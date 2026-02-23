from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.user import UserResponse

class NotificationService:
    @staticmethod
    async def trigger_attendance_notifications(current_user: UserResponse, db: AsyncIOMotorDatabase):
        """
        Evaluates the user's current overall attendance against the 75% threshold
        and generates appropriate Warning or Success notifications.
        """
        from app.routers.attendance import get_overall_attendance_stats, get_attendance_stats
        
        overall_stats = await get_overall_attendance_stats(
            mode="overall", month=None, year=None, current_user=current_user, db=db
        )
        current_pct = overall_stats.overall_percentage
        last_status = getattr(current_user, "last_attendance_status", None)
        
        threshold = 75.0
        
        if current_pct < threshold:
            # Trigger WARNING notification every time attendance is marked and remains < 75%
            # Fetch subject breakdown to list subjects below 75%
            subject_stats = await get_attendance_stats(current_user=current_user, db=db)
            
            # We need subject names, but stats only have subject_id. Let's fetch subjects.
            subjects_cursor = db["subjects"].find({"user_id": current_user.id})
            subject_map = {str(s["_id"]): s["name"] for s in await subjects_cursor.to_list(length=100)}
            
            low_subjects = []
            for s in subject_stats:
                if s.current_percentage < threshold:
                    s_name = subject_map.get(s.subject_id, "Unknown Subject")
                    low_subjects.append((s_name, s.current_percentage))
            
            # Sort worst-performing subjects first
            low_subjects.sort(key=lambda x: x[1])
            
            msg = f"You're below the 75% requirement.\n\nOverall: {current_pct}%\n\nSubjects to focus on:"
            if low_subjects:
                msg += "\n" + "\n".join([f"• {name} – {pct}%" for name, pct in low_subjects])
                
            notification = {
                "user_id": current_user.id,
                "title": "Attendance Alert ⚠️",
                "message": msg,
                "type": "warning",
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            await db["notifications"].insert_one(notification)
            
            if last_status != "below":
                await db["users"].update_one(
                    {"_id": ObjectId(current_user.id)}, 
                    {"$set": {"last_attendance_status": "below"}}
                )
                
        elif current_pct >= threshold and last_status == "below":
            # Trigger SUCCESS notification once
            msg = f"You're back on track with your attendance.\nKeep it up!\n\nOverall: {current_pct}%"
            notification = {
                "user_id": current_user.id,
                "title": "Great job 🎉",
                "message": msg,
                "type": "success",
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            await db["notifications"].insert_one(notification)
            
            await db["users"].update_one(
                {"_id": ObjectId(current_user.id)}, 
                {"$set": {"last_attendance_status": "above"}}
            )
        elif current_pct >= threshold and last_status is None:
            # Initialize status if it was never set
            await db["users"].update_one(
                {"_id": ObjectId(current_user.id)}, 
                {"$set": {"last_attendance_status": "above"}}
            )
