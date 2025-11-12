from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from middleware.auth import get_current_user, AuthUser
from models.database import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
    AnnouncementCategory
)
from services.supabase_service import get_supabase_service, SupabaseService

router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
    responses={
        404: {"description": "Announcement not found"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
    }
)


@router.get(
    "",
    response_model=List[AnnouncementResponse],
    status_code=status.HTTP_200_OK,
    summary="List all active announcements",
    description="Retrieve all active announcements with optional filtering."
)
def list_announcements(
    upcoming_only: bool = Query(True, description="Show only upcoming announcements"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results"),
    db: SupabaseService = Depends(get_supabase_service)
) -> List[AnnouncementResponse]:
    announcements = db.get_all_announcements(limit=limit, upcoming_only=upcoming_only)
    
    if category and announcements:
        announcements = [
            ann for ann in announcements
            if ann.get("category") == category
        ]
    
    return [AnnouncementResponse(**ann) for ann in announcements]


@router.get(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_200_OK,
    summary="Get announcement by ID",
    description="Retrieve a single announcement by its unique identifier."
)
def get_announcement(
    announcement_id: UUID,
    db: SupabaseService = Depends(get_supabase_service)
) -> AnnouncementResponse:
    announcement = db.get_announcement_by_id(str(announcement_id))
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement with ID {announcement_id} not found"
        )
    
    return AnnouncementResponse(**announcement)


@router.post(
    "",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new announcement",
    description="Create a new announcement entry. Requires authentication."
)
def create_announcement(
    announcement_data: AnnouncementCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> AnnouncementResponse:
    announcement_dict = announcement_data.model_dump()
    
    if "date" in announcement_dict and announcement_dict["date"]:
        announcement_dict["date"] = announcement_dict["date"].isoformat()
    
    created_announcement = db.create_announcement(announcement_dict, current_user.id)
    
    if not created_announcement:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create announcement. Please try again."
        )
    
    return AnnouncementResponse(**created_announcement)


@router.put(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_200_OK,
    summary="Update announcement",
    description="Update an existing announcement. Only the creator can update."
)
def update_announcement(
    announcement_id: UUID,
    announcement_data: AnnouncementUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> AnnouncementResponse:
    existing_announcement = db.get_announcement_by_id(str(announcement_id))
    if not existing_announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement with ID {announcement_id} not found"
        )
    
    if existing_announcement.get("created_by") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this announcement"
        )
    
    announcement_dict = announcement_data.model_dump(exclude_none=True)
    
    if not announcement_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    if "date" in announcement_dict and announcement_dict["date"]:
        announcement_dict["date"] = announcement_dict["date"].isoformat()
    
    updated_announcement = db.update_announcement(
        str(announcement_id), 
        announcement_dict, 
        current_user.id
    )
    
    if not updated_announcement:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update announcement. Please try again."
        )
    
    return AnnouncementResponse(**updated_announcement)


@router.delete(
    "/{announcement_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete announcement",
    description="Soft delete an announcement (sets is_active to false). Only the creator can delete."
)
def delete_announcement(
    announcement_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> dict:
    existing_announcement = db.get_announcement_by_id(str(announcement_id))
    if not existing_announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Announcement with ID {announcement_id} not found"
        )
    
    if existing_announcement.get("created_by") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this announcement"
        )
    
    success = db.delete_announcement(str(announcement_id), current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete announcement. Please try again."
        )
    
    return {"message": "Announcement deleted successfully"}


@router.get(
    "/category/{category}",
    response_model=List[AnnouncementResponse],
    status_code=status.HTTP_200_OK,
    summary="Get announcements by category",
    description="Retrieve all active announcements in a specific category."
)
def get_announcements_by_category(
    category: AnnouncementCategory,
    limit: int = Query(50, ge=1, le=200, description="Maximum number of results"),
    db: SupabaseService = Depends(get_supabase_service)
) -> List[AnnouncementResponse]:
    announcements = db.get_all_announcements(limit=limit, upcoming_only=False)
    
    announcements = [
        ann for ann in announcements
        if ann.get("category") == category.value
    ]
    
    return [AnnouncementResponse(**ann) for ann in announcements]
