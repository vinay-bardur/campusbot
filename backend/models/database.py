"""
Database models for the Dynamic Campus Query Chatbot.

This module defines Pydantic models for all database entities including
FAQs, Announcements, and Chat Logs. These models provide validation,
serialization, and type safety for API requests and responses.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class FAQCategory(str, Enum):
    """Valid categories for FAQs."""
    ACADEMICS = "academics"
    ADMISSIONS = "admissions"
    FACILITIES = "facilities"
    EVENTS = "events"
    GENERAL = "general"
    SPORTS = "sports"
    LIBRARY = "library"
    HOSTEL = "hostel"
    PLACEMENT = "placement"
    CLUBS = "clubs"
    ACCOMMODATION = "accommodation"
    TECHNICAL = "technical"


class Priority(str, Enum):
    """Priority levels for announcements."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
    NORMAL = "normal"


class AnnouncementCategory(str, Enum):
    """Valid categories for announcements."""
    ACADEMIC = "academic"
    EVENT = "event"
    EXAM = "exam"
    HOLIDAY = "holiday"
    GENERAL = "general"
    SPORTS = "sports"
    CULTURAL = "cultural"
    PLACEMENT = "placement"
    EMERGENCY = "emergency"
    FACILITIES = "facilities"
    EVENTS = "events"
    HOLIDAYS = "holidays"


# ============================================================================
# FAQ Models
# ============================================================================

class FAQBase(BaseModel):
    """
    Base model for FAQ with common fields.
    
    Attributes:
        question: The FAQ question text
        answer: The detailed answer text
        category: Category classification for the FAQ
        tags: List of searchable tags
        is_active: Whether the FAQ is active and visible
    """
    question: str = Field(..., min_length=5, max_length=500, description="FAQ question")
    answer: str = Field(..., min_length=10, max_length=5000, description="FAQ answer")
    category: FAQCategory = Field(..., description="FAQ category")
    tags: List[str] = Field(default_factory=list, description="Searchable tags")
    is_active: bool = Field(default=True, description="Active status")

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Ensure tags are lowercase and non-empty."""
        return [tag.lower().strip() for tag in v if tag.strip()]


class FAQCreate(FAQBase):
    """
    Model for creating a new FAQ.
    Inherits all fields from FAQBase.
    """
    pass


class FAQUpdate(BaseModel):
    """
    Model for updating an existing FAQ.
    All fields are optional to support partial updates.
    """
    question: Optional[str] = Field(None, min_length=5, max_length=500)
    answer: Optional[str] = Field(None, min_length=10, max_length=5000)
    category: Optional[FAQCategory] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Ensure tags are lowercase and non-empty."""
        if v is None:
            return None
        return [tag.lower().strip() for tag in v if tag.strip()]


class FAQResponse(FAQBase):
    """
    Model for FAQ responses including metadata.

    Additional attributes:
        id: Unique identifier (UUID)
        created_by: User ID who created the FAQ
        created_at: Timestamp of creation
        updated_at: Timestamp of last update
        view_count: Number of times FAQ was viewed
    """
    id: UUID = Field(..., description="Unique FAQ identifier")
    created_by: Optional[str] = Field(None, description="User ID of creator")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    view_count: int = Field(default=0, ge=0, description="View count")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "question": "What are the library timings?",
                "answer": "The library is open from 8 AM to 10 PM on weekdays.",
                "category": "library",
                "tags": ["library", "timings", "hours"],
                "is_active": True,
                "created_by": "user123",
                "created_at": "2024-01-01T10:00:00Z",
                "updated_at": "2024-01-01T10:00:00Z",
                "view_count": 42
            }
        }


# ============================================================================
# Announcement Models
# ============================================================================

class AnnouncementBase(BaseModel):
    """
    Base model for Announcement with common fields.
    
    Attributes:
        title: Announcement title
        description: Detailed description
        category: Category classification
        date: Event/announcement date
        priority: Priority level
    """
    title: str = Field(..., min_length=5, max_length=200, description="Announcement title")
    description: str = Field(..., min_length=10, max_length=2000, description="Detailed description")
    category: AnnouncementCategory = Field(..., description="Announcement category")
    date: datetime = Field(..., description="Event/announcement date")
    priority: Priority = Field(default=Priority.MEDIUM, description="Priority level")


class AnnouncementCreate(AnnouncementBase):
    """
    Model for creating a new announcement.
    Inherits all fields from AnnouncementBase.
    """
    pass


class AnnouncementUpdate(BaseModel):
    """
    Model for updating an existing announcement.
    All fields are optional to support partial updates.
    """
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[AnnouncementCategory] = None
    date: Optional[datetime] = None
    priority: Optional[Priority] = None
    is_active: Optional[bool] = None


class AnnouncementResponse(AnnouncementBase):
    """
    Model for announcement responses including metadata.
    
    Additional attributes:
        id: Unique identifier (UUID)
        created_by: User ID who created the announcement
        created_at: Timestamp of creation
        updated_at: Timestamp of last update
        is_active: Whether announcement is active
    """
    id: UUID = Field(..., description="Unique announcement identifier")
    created_by: Optional[str] = Field(None, description="User ID of creator")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    is_active: bool = Field(default=True, description="Active status")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174001",
                "title": "Annual Sports Day",
                "description": "Join us for the annual sports day on campus.",
                "category": "sports",
                "date": "2024-02-15T09:00:00Z",
                "priority": "high",
                "created_by": "admin123",
                "created_at": "2024-01-01T10:00:00Z",
                "updated_at": "2024-01-01T10:00:00Z",
                "is_active": True
            }
        }


# ============================================================================
# Chat Log Models
# ============================================================================

class ChatLogCreate(BaseModel):
    """
    Model for creating a chat log entry.
    
    Attributes:
        user_id: ID of the user who asked the question
        question: The question asked by the user
        matched_faq_id: Optional ID of matched FAQ
        confidence: Optional confidence score of the match (0.0 to 1.0)
    """
    user_id: str = Field(..., description="User ID")
    question: str = Field(..., min_length=1, max_length=1000, description="User question")
    matched_faq_id: Optional[UUID] = Field(None, description="Matched FAQ ID if any")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Match confidence score")


class ChatLogResponse(ChatLogCreate):
    """
    Model for chat log responses including metadata.
    
    Additional attributes:
        id: Unique identifier (UUID)
        created_at: Timestamp of the chat
        was_helpful: Optional feedback on whether response was helpful
    """
    id: UUID = Field(..., description="Unique chat log identifier")
    created_at: datetime = Field(..., description="Chat timestamp")
    was_helpful: Optional[bool] = Field(None, description="User feedback on helpfulness")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174002",
                "user_id": "user123",
                "question": "What are the library timings?",
                "matched_faq_id": "123e4567-e89b-12d3-a456-426614174000",
                "confidence": 0.95,
                "created_at": "2024-01-01T14:30:00Z",
                "was_helpful": True
            }
        }
