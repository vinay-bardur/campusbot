from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from middleware.auth import get_current_user, AuthUser
from models.database import (
    FAQCreate,
    FAQUpdate,
    FAQResponse,
    FAQCategory
)
from services.supabase_service import get_supabase_service, SupabaseService

router = APIRouter(
    prefix="/faqs",
    tags=["FAQs"],
    responses={
        404: {"description": "FAQ not found"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
    }
)


@router.get(
    "",
    response_model=List[FAQResponse],
    status_code=status.HTTP_200_OK,
    summary="List all active FAQs",
    description="Retrieve all active FAQs with optional filtering by category and search term."
)
def list_faqs(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in questions and answers"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results"),
    db: SupabaseService = Depends(get_supabase_service)
) -> List[FAQResponse]:
    faqs = db.get_all_faqs(category=category, limit=limit)
    
    if search and faqs:
        search_lower = search.lower()
        faqs = [
            faq for faq in faqs
            if search_lower in faq.get("question", "").lower() or
               search_lower in faq.get("answer", "").lower() or
               search_lower in " ".join(faq.get("tags", [])).lower()
        ]
    
    return [FAQResponse(**faq) for faq in faqs]


@router.get(
    "/{faq_id}",
    response_model=FAQResponse,
    status_code=status.HTTP_200_OK,
    summary="Get FAQ by ID",
    description="Retrieve a single FAQ by its unique identifier. Increments view count."
)
def get_faq(
    faq_id: UUID,
    db: SupabaseService = Depends(get_supabase_service)
) -> FAQResponse:
    faq = db.get_faq_by_id(str(faq_id))
    
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with ID {faq_id} not found"
        )
    
    db.increment_faq_views(str(faq_id))
    
    return FAQResponse(**faq)


@router.post(
    "",
    response_model=FAQResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new FAQ",
    description="Create a new FAQ entry. Requires authentication."
)
def create_faq(
    faq_data: FAQCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> FAQResponse:
    faq_dict = faq_data.model_dump()
    created_faq = db.create_faq(faq_dict, current_user.id)
    
    if not created_faq:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create FAQ. Please try again."
        )
    
    return FAQResponse(**created_faq)


@router.put(
    "/{faq_id}",
    response_model=FAQResponse,
    status_code=status.HTTP_200_OK,
    summary="Update FAQ",
    description="Update an existing FAQ. Only the creator can update."
)
def update_faq(
    faq_id: UUID,
    faq_data: FAQUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> FAQResponse:
    existing_faq = db.get_faq_by_id(str(faq_id))
    if not existing_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with ID {faq_id} not found"
        )
    
    if existing_faq.get("created_by") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this FAQ"
        )
    
    faq_dict = faq_data.model_dump(exclude_none=True)
    
    if not faq_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    updated_faq = db.update_faq(str(faq_id), faq_dict, current_user.id)
    
    if not updated_faq:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update FAQ. Please try again."
        )
    
    return FAQResponse(**updated_faq)


@router.delete(
    "/{faq_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete FAQ",
    description="Soft delete an FAQ (sets is_active to false). Only the creator can delete."
)
def delete_faq(
    faq_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> dict:
    existing_faq = db.get_faq_by_id(str(faq_id))
    if not existing_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with ID {faq_id} not found"
        )
    
    if existing_faq.get("created_by") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this FAQ"
        )
    
    success = db.delete_faq(str(faq_id), current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete FAQ. Please try again."
        )
    
    return {"message": "FAQ deleted successfully"}


@router.get(
    "/category/{category}",
    response_model=List[FAQResponse],
    status_code=status.HTTP_200_OK,
    summary="Get FAQs by category",
    description="Retrieve all active FAQs in a specific category."
)
def get_faqs_by_category(
    category: FAQCategory,
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results"),
    db: SupabaseService = Depends(get_supabase_service)
) -> List[FAQResponse]:
    faqs = db.get_all_faqs(category=category.value, limit=limit)
    
    return [FAQResponse(**faq) for faq in faqs]
