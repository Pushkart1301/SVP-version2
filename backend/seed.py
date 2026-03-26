import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

MONGO_URI = os.getenv("DATABASE_URL")
if not MONGO_URI:
    raise ValueError("DATABASE_URL is not set in the environment.")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client["svp_db"]
    
    email = "1032230410@tcetmumbai.in"
    user = await db["users"].find_one({"email": email})
    
    if not user:
        # Create user if it doesn't exist
        print("User not found, creating user...")
        hashed_password = pwd_context.hash("tcet")
        new_user = {
            "email": email,
            "full_name": "Test User",
            "hashed_password": hashed_password,
            "branch": "AIML",
            "semester": "5",
            "created_at": datetime.utcnow()
        }
        res = await db["users"].insert_one(new_user)
        user_id = str(res.inserted_id)
    else:
        user_id = str(user["_id"])
        print(f"Found user {user_id}, resetting their password to 'tcet'")
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"hashed_password": pwd_context.hash("tcet")}}
        )
    
    print(f"Seeding for user {user_id}")
    
    # 1. Add dummy subjects
    subjects = [
        {"name": "Machine Learning", "code": "ML", "type": "Theory", "target_attendance_percent": 75, "user_id": user_id, "created_at": datetime.utcnow()},
        {"name": "Web Development", "code": "WD", "type": "Theory", "target_attendance_percent": 75, "user_id": user_id, "created_at": datetime.utcnow()},
        {"name": "Cloud Computing", "code": "CC", "type": "Theory", "target_attendance_percent": 75, "user_id": user_id, "created_at": datetime.utcnow()}
    ]
    
    # Clear old subjects and schedule
    await db["subjects"].delete_many({"user_id": user_id})
    res = await db["subjects"].insert_many(subjects)
    subj_ids = res.inserted_ids
    ml_id = str(subj_ids[0])
    wd_id = str(subj_ids[1])
    cc_id = str(subj_ids[2])
    
    # 2. Add dummy schedule
    await db["schedules"].delete_many({"user_id": user_id})
    schedules = [
        {
            "user_id": user_id,
            "weekday": 0, # 0 = Monday
            "slots": [
                {"subject_id": ml_id, "start_time": "09:00", "end_time": "10:00", "room": "Room 1", "type": "Theory"},
                {"subject_id": wd_id, "start_time": "10:00", "end_time": "11:00", "room": "Room 2", "type": "Theory"}
            ]
        },
        {
            "user_id": user_id,
            "weekday": 1, # 1 = Tuesday
            "slots": [
                {"subject_id": cc_id, "start_time": "11:00", "end_time": "12:00", "room": "Room 3", "type": "Theory"}
            ]
        },
        {"user_id": user_id, "weekday": 2, "slots": []},
        {"user_id": user_id, "weekday": 3, "slots": []},
        {"user_id": user_id, "weekday": 4, "slots": []},
        {"user_id": user_id, "weekday": 5, "slots": []},
        {"user_id": user_id, "weekday": 6, "slots": []}
    ]
    await db["schedules"].insert_many(schedules)
    
    # 3. Add dummy attendance records
    await db["attendance_records"].delete_many({"user_id": user_id})
    today = datetime.now()
    
    records = []
    # 10 days of attendance
    # Total classes: 10 days * 3 subjects = 30 classes.
    # We want attendance to be < 75% so we can trigger the warning notification when they mark "today".
    for i in range(1, 11): # Add past 10 days
        d = today - timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        records.append({
            "user_id": user_id,
            "date": date_str,
            "entries": [
                {"subject_id": ml_id, "status": "A" if i % 2 == 0 else "P", "type": "Theory"}, # 5P, 5A (50%)
                {"subject_id": wd_id, "status": "P", "type": "Theory"}, # 10P (100%)
                {"subject_id": cc_id, "status": "A" if i < 4 else "P", "type": "Theory"} # 7P, 3A (70%)
            ]
        })
    # Overall: 22 / 30 = 73.3%
    await db["attendance_records"].insert_many(records)
    
    print("Dummy data seeded successfully. Login with email: 1032230410@tcetmumbai, password: tcet")
    print("Attendance is currently ~73%. Mark today's attendance to trigger the WARNING notification.")

asyncio.run(seed())
