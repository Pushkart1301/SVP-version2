import logging

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.core import database
from app.routers.auth import get_current_user
from app.models.user import UserResponse
from app.services.ocr import extract_text_from_file
from app.services.ai_engine import ai_engine
from app.models.attendance import SubjectResponse, ScheduleResponse
from app.core.vacation_engine import VacationRecommendationEngine, Subject, DayType, AIReasoningLayer

from app.services.vacation_service import generate_vacation_plan

router = APIRouter(tags=["Planner"])

logger = logging.getLogger(__name__)


def serialize_for_json(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, list):
        return [serialize_for_json(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize_for_json(item) for key, item in value.items()}
    return value

@router.post("/recommend")
async def recommend_vacation(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # 1. Fetch Subjects
    subjects_docs = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    subject_map = {str(s["_id"]): s["name"] for s in subjects_docs} # id -> name
    
    # 2. Fetch Attendance Stats
    stats = {} # subject_id -> {attended: int, total: int}
    for sid in subject_map.keys():
        stats[sid] = {"attended": 0, "total": 0}
        
    cursor = db["attendance_records"].find({"user_id": current_user.id})
    async for record in cursor:
        for entry in record.get("entries", []):
            sid = entry["subject_id"]
            if sid in stats and entry["status"] in ["P", "A"]:
                stats[sid]["total"] += 1
                if entry["status"] == "P":
                    stats[sid]["attended"] += 1

    subjects_data = []
    for sid, data in stats.items():
        subjects_data.append({
            "id": sid,
            "name": subject_map[sid],
            "attended": data["attended"],
            "total": data["total"]
        })

    # 3. Fetch Schedule
    schedule_docs = await db["schedules"].find({"user_id": current_user.id}).to_list(7)
    weekly_schedule = {}
    weekday_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday"}
    
    for doc in schedule_docs:
        day_int = doc["weekday"]
        day_name = weekday_map.get(day_int)
        
        subjects = []
        if "slots" in doc:
            for slot in doc["slots"]:
                if "subject_id" in slot:
                    subjects.append(slot["subject_id"])
        
        if day_name:
            weekly_schedule[day_name] = subjects

    # 4. Fetch Calendar
    calendar_doc = await db["academic_calendars"].find_one({"user_id": current_user.id}, sort=[("_id", -1)])
    academic_calendar = {}
    from app.core.vacation_engine import DayType
    
    if calendar_doc and "parsed_events" in calendar_doc:
        holidays = calendar_doc["parsed_events"].get("holidays", [])
        for h in holidays:
            if isinstance(h, str):
                academic_calendar[h] = DayType.HOLIDAY
            elif isinstance(h, dict) and "date" in h:
                academic_calendar[h["date"]] = DayType.HOLIDAY

    # 5. Call Service
    result = generate_vacation_plan(
        subjects_data=subjects_data,
        weekly_schedule=weekly_schedule,
        academic_calendar=academic_calendar,
        min_attendance=75
    )

    # 6. Transform for Frontend
    windows = []
    if result["success"]:
        for opt in result["vacation_options"]:
            windows.append({
                "start_date": opt["start_date"],
                "end_date": opt["end_date"],
                "reason": f"Safe! Leaves: {opt['leave_days']}, Score: {opt['score']}"
            })

    return {
        "windows": windows,
        "ai_advice": result["ai_advice"],
        "debug_info": {"subjects_count": len(subjects_data)}
    }


@router.post("/academic-calendar/upload")
async def upload_academic_calendar(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # 1. OCR
    text = await extract_text_from_file(file)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    
    # 2. AI Extraction
    result = ai_engine.extract_calendar_events(text)
    if not result:
        raise HTTPException(status_code=500, detail="AI extraction failed")
        
    # 3. Save to DB
    doc = {
        "user_id": current_user.id,
        "raw_text": text[:500] + "...",
        "parsed_events": result,
        "uploaded_at": str(file.filename)
    }
    await db["academic_calendars"].insert_one(doc)
    
    return {"message": "Calendar processed", "data": result}

@router.post("/vacation/generate")
async def generate_vacation(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    # Gather Context
    subjects = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    schedule_docs = await db["schedules"].find({"user_id": current_user.id}).to_list(7)
    attendance_cursor = db["attendance_records"].find({"user_id": current_user.id})

    # Build stats from DB
    subject_map = {str(s["_id"]): s for s in subjects}
    stats = {}
    for s in subjects:
        stats[s["name"]] = {
            "subject_id": str(s["_id"]),
            "attended": 0,
            "total": 0,
            "percentage": 0.0,
            "threshold": s.get("target_attendance_percent", 75.0),
        }

    async for record in attendance_cursor:
        for entry in record.get("entries", []):
            subject_id = entry.get("subject_id")
            status = entry.get("status")
            if subject_id and subject_id in subject_map and status in ["P", "A"]:
                subject_name = subject_map[subject_id]["name"]
                stats[subject_name]["total"] += 1
                if status == "P":
                    stats[subject_name]["attended"] += 1

    for name, substats in stats.items():
        if substats["total"] > 0:
            substats["percentage"] = round(substats["attended"] / substats["total"] * 100, 2)
        else:
            substats["percentage"] = 0.0

    total_classes = sum(s["total"] for s in stats.values())
    logger.info("Computed vacation stats", extra={"user_id": current_user.id, "subjects": len(subjects), "records": total_classes})

    if not subjects or total_classes == 0:
        return {
            "success": False,
            "message": "Not enough data to generate plan",
            "ai_mode": "none",
            "windows": [],
            "ai_advice": "",
            "debug_info": {"subjects_count": len(subjects), "total_classes": total_classes}
        }

    holidays_doc = await db["academic_calendars"].find_one({"user_id": current_user.id}, sort=[("_id", -1)])
    holidays = holidays_doc.get("parsed_events", {}).get("holidays", []) if holidays_doc else []

    request_data = await request.json()
    query = request_data.get("query")

    safe_schedule = serialize_for_json([s for s in schedule_docs if "weekday" in s])
    safe_holidays = serialize_for_json(holidays)

    ai_mode = "ai"
    plan = None

    try:
        plan = ai_engine.generate_vacation_plan(
            attendance_summary=stats,
            schedule=safe_schedule,
            holidays=safe_holidays,
            query=query
        )

        if not plan or not isinstance(plan, dict) or "windows" not in plan:
            raise ValueError("Invalid AI response")

        logger.info("AI vacation plan generated", extra={"user_id": current_user.id, "ai_mode": ai_mode, "window_count": len(plan.get("windows", []))})

    except Exception as ai_exc:
        logger.error("AI planning failed, falling back to deterministic planner", exc_info=True, extra={"user_id": current_user.id, "exception": str(ai_exc)})
        ai_mode = "fallback"

        weekday_map = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday", 5: "Saturday", 6: "Sunday"}
        weekly_schedule = {}
        for doc in schedule_docs:
            day_name = weekday_map.get(doc.get("weekday"))
            if not day_name:
                continue
            slots = [slot.get("subject_id") for slot in doc.get("slots", []) if slot.get("subject_id")]
            weekly_schedule[day_name] = slots

        academic_calendar = {}
        from app.core.vacation_engine import DayType as _DayType

        if holidays_doc and "parsed_events" in holidays_doc:
            for h in holidays_doc["parsed_events"].get("holidays", []):
                if isinstance(h, str):
                    academic_calendar[h] = _DayType.HOLIDAY
                elif isinstance(h, dict) and h.get("date"):
                    academic_calendar[h["date"]] = _DayType.HOLIDAY

        engine_subjects = []
        for sub_name, substats in stats.items():
            engine_subjects.append(
                Subject(
                    subject_id=substats["subject_id"],
                    name=sub_name,
                    attended=substats["attended"],
                    total=substats["total"],
                    threshold=substats.get("threshold", 75.0)
                )
            )

        engine = VacationRecommendationEngine(
            subjects=engine_subjects,
            weekly_schedule=weekly_schedule,
            academic_calendar=academic_calendar,
            global_threshold=75.0
        )

        windows = engine.find_safe_vacations()
        ai_advice = "AI failed; using deterministic fallback vacation planner."
        plan = AIReasoningLayer.format_results_for_student(windows, ai_advice)

    plan["ai_mode"] = ai_mode
    plan.setdefault("debug_info", {})
    plan["debug_info"].update({"subjects_count": len(subjects), "total_classes": total_classes})

    return plan

@router.post("/study-plan/generate")
async def generate_study_plan(
    preferences: dict,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    subjects = await db["subjects"].find({"user_id": current_user.id}).to_list(100)
    subject_names = [s["name"] for s in subjects]
    
    plan = ai_engine.generate_study_plan(
        subjects=subject_names,
        preferences=preferences
    )
    
    # Save plan
    if plan:
        await db["study_plans"].insert_one({
            "user_id": current_user.id,
            "plan": plan,
            "created_at": "now"
        })

    if not plan:
        raise HTTPException(status_code=502, detail="AI study plan generation failed")

    return plan
