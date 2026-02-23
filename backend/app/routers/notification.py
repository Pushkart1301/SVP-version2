from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core import database
from app.routers.auth import get_current_user
from app.models.user import UserResponse
from app.models.notification import NotificationResponse

router = APIRouter()

def fix_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    """Get all notifications for the current user, sorted by most recent."""
    cursor = db["notifications"].find({"user_id": current_user.id})
    cursor.sort("created_at", -1).skip(skip).limit(limit)
    
    notifications = await cursor.to_list(length=limit)
    return [fix_id(n) for n in notifications]

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    """Mark a specific notification as read."""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
        
    result = await db["notifications"].update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"message": "Notification marked as read", "success": True}

@router.put("/read-all")
async def mark_all_notifications_read(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(database.get_database)
):
    """Mark all notifications as read for the current user."""
    result = await db["notifications"].update_many(
        {"user_id": current_user.id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": f"Marked {result.modified_count} notifications as read", "success": True}
