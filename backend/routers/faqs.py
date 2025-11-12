"""
FAQ Router for FastAPI.

This module provides REST API endpoints for FAQ management including
CRUD operations with proper authentication and authorization.
"""

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

# Create router with tags for OpenAPI documentation
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
    """
    Get all active FAQs.
    
    Public endpoint - no authentication required.
    
    Query Parameters:
    - category: Optional category filter
    - search: Optional search term (searches in question and answer)
    - limit: Maximum number of FAQs to return (1-500, default: 100)
    
    Returns:
    - List of FAQ objects
    """
    faqs = db.get_all_faqs(category=category, limit=limit)
    
    # Apply search filter if provided
    if search and faqs:
        search_lower = search.lower()
        faqs = [
            faq for faq in faqs
            if search_lower in faq.get("question", "").lower() or
               search_lower in faq.get("answer", "").lower() or
               search_lower in " ".join(faq.get("tags", [])).lower()
        ]
    
    # Convert to response models
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
    """
    Get a single FAQ by ID.
    
    Public endpoint - no authentication required.
    Automatically increments the view count for analytics.
    
    Path Parameters:
    - faq_id: UUID of the FAQ
    
    Returns:
    - FAQ object
    
    Raises:
    - 404: FAQ not found
    """
    faq = db.get_faq_by_id(str(faq_id))
    
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with ID {faq_id} not found"
        )
    
    # Increment view count asynchronously (don't block on failure)
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
    """
    Create a new FAQ.
    
    Requires authentication.
    
    Request Body:
    - FAQCreate model with question, answer, category, tags, etc.
    
    Returns:
    - Created FAQ object
    
    Raises:
    - 401: Unauthorized (no valid token)
    - 500: Internal server error if creation fails
    """
    # Convert Pydantic model to dict
    faq_dict = faq_data.model_dump()
    
    # Create FAQ with user ID
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
    """
    Update an existing FAQ.
    
    Requires authentication.
    Only the user who created the FAQ can update it.
    
    Path Parameters:
    - faq_id: UUID of the FAQ to update
    
    Request Body:
    - FAQUpdate model with optional fields to update
    
    Returns:
    - Updated FAQ object
    
    Raises:
    - 401: Unauthorized (no valid token)
    - 403: Forbidden (not the creator)
    - 404: FAQ not found
    """
    # Check if FAQ exists
    existing_faq = db.get_faq_by_id(str(faq_id))
    if not existing_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with ID {faq_id} not found"
        )
    
    # Check authorization
    if existing_faq.get("created_by") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this FAQ"
        )
    
    # Convert Pydantic model to dict, excluding None values
    faq_dict = faq_data.model_dump(exclude_none=True)
    
    if not faq_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update FAQ
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
    """
    Delete an FAQ (soft delete).
    
    Requires authentication.
    Only the user who created the FAQ can delete it.
    Sets is_active to False instead of permanently deleting.
    
    Path Parameters:
    - faq_id: UUID of the FAQ to delete
    
    Returns:
    - Success message
    
    Raises:
    - 401: Unauthorized (no valid token)
    - 403: Forbidden (not the creator)
    - 404: FAQ not found
    """
    # Check if FAQ exists
    existing_faq = db.get_faq_by_id(str(faq_id))
    if not existing_faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FAQ with ID {faq_id} not found"
        )
    
    # Check authorization
    if existing_faq.get("created_by") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this FAQ"
        )
    
    # Delete FAQ
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
    """
    Get all FAQs in a specific category.
    
    Public endpoint - no authentication required.
    
    Path Parameters:
    - category: FAQ category (must be a valid FAQCategory enum value)
    
    Query Parameters:
    - limit: Maximum number of FAQs to return (1-500, default: 100)
    
    Returns:
    - List of FAQ objects in the specified category
    """
    faqs = db.get_all_faqs(category=category.value, limit=limit)
    
    return [FAQResponse(**faq) for faq in faqs]
