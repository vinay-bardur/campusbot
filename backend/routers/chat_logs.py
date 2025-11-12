"""
Chat Logs Router for FastAPI.

This module provides REST API endpoints for chat logging and analytics,
allowing users to track their chat history and provide feedback.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from middleware.auth import get_current_user, AuthUser
from models.database import ChatLogCreate, ChatLogResponse
from services.supabase_service import get_supabase_service, SupabaseService

# Create router with tags for OpenAPI documentation
router = APIRouter(
    prefix="/chat-logs",
    tags=["Chat Logs"],
    responses={
        404: {"description": "Chat log not found"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
    }
)


class FeedbackUpdate(BaseModel):
    """Model for updating chat log feedback."""
    was_helpful: bool


@router.post(
    "",
    response_model=ChatLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new chat log entry",
    description="Log a user's chat interaction for analytics and history tracking."
)
def create_chat_log(
    log_data: ChatLogCreate,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> ChatLogResponse:
    """
    Create a new chat log entry.
    
    Requires authentication.
    Logs user questions and matched FAQ responses for analytics.
    
    Request Body:
    - ChatLogCreate model with user_id, question, matched_faq_id, confidence
    
    Returns:
    - Created chat log object
    
    Raises:
    - 401: Unauthorized (no valid token)
    - 400: Invalid data
    - 500: Internal server error if creation fails
    """
    # Verify the user_id in the request matches the authenticated user
    if log_data.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create chat log for another user"
        )
    
    # Convert Pydantic model to dict
    log_dict = log_data.model_dump()
    
    # Create chat log
    created_log = db.create_chat_log(log_dict)
    
    if not created_log:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat log. Please try again."
        )
    
    return ChatLogResponse(**created_log)


@router.get(
    "/my-history",
    response_model=List[ChatLogResponse],
    status_code=status.HTTP_200_OK,
    summary="Get current user's chat history",
    description="Retrieve the authenticated user's chat history sorted by most recent first."
)
def get_my_chat_history(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of logs to return"),
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> List[ChatLogResponse]:
    """
    Get the current user's chat history.
    
    Requires authentication.
    Returns chat logs sorted by created_at in descending order (newest first).
    
    Query Parameters:
    - limit: Maximum number of logs to return (1-200, default: 50)
    
    Returns:
    - List of chat log objects
    
    Raises:
    - 401: Unauthorized (no valid token)
    """
    logs = db.get_user_chat_logs(current_user.id, limit=limit)
    
    return [ChatLogResponse(**log) for log in logs]


@router.put(
    "/{log_id}/feedback",
    response_model=ChatLogResponse,
    status_code=status.HTTP_200_OK,
    summary="Update feedback on chat response",
    description="Allow users to provide feedback on whether a chat response was helpful."
)
def update_chat_feedback(
    log_id: UUID,
    feedback: FeedbackUpdate,
    current_user: AuthUser = Depends(get_current_user),
    db: SupabaseService = Depends(get_supabase_service)
) -> ChatLogResponse:
    """
    Update feedback on a chat log entry.
    
    Requires authentication.
    Users can only update feedback on their own chat logs.
    
    Path Parameters:
    - log_id: UUID of the chat log
    
    Request Body:
    - FeedbackUpdate model with was_helpful boolean
    
    Returns:
    - Updated chat log object
    
    Raises:
    - 401: Unauthorized (no valid token)
    - 403: Forbidden (not the log owner)
    - 404: Chat log not found
    - 500: Update failed
    """
    # Get the existing chat log
    existing_logs = db.get_user_chat_logs(current_user.id, limit=1000)
    existing_log = None
    
    for log in existing_logs:
        if str(log.get("id")) == str(log_id):
            existing_log = log
            break
    
    if not existing_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat log with ID {log_id} not found or you don't have access to it"
        )
    
    # Verify ownership
    if existing_log.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update feedback on your own chat logs"
        )
    
    # Update the feedback
    try:
        response = db.client.table("chat_logs").update({
            "was_helpful": feedback.was_helpful
        }).eq("id", str(log_id)).execute()
        
        if response.data and len(response.data) > 0:
            return ChatLogResponse(**response.data[0])
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update feedback"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update feedback: {str(e)}"
        )
