"""
Supabase Service for database operations.

This service provides a clean interface for interacting with Supabase
database tables including FAQs, Announcements, and Chat Logs.
"""

import logging
import os
from typing import List, Optional, Dict, Any
from datetime import datetime

from dotenv import load_dotenv
from supabase import create_client, Client
from postgrest.exceptions import APIError

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SupabaseService:
    """
    Service class for Supabase database operations.
    
    Handles all CRUD operations for FAQs, Announcements, and Chat Logs
    with proper error handling and logging.
    """

    def __init__(self):
        """Initialize Supabase client with environment credentials."""
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            logger.error("Supabase credentials not found in environment variables")
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        try:
            self.client: Client = create_client(self.supabase_url, self.supabase_key)
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise

    # ========================================================================
    # FAQ Operations
    # ========================================================================

    def get_all_faqs(
        self, 
        category: Optional[str] = None, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieve all active FAQs, optionally filtered by category.
        
        Args:
            category: Optional category filter
            limit: Maximum number of FAQs to return (default: 100)
            
        Returns:
            List of FAQ dictionaries
        """
        try:
            query = self.client.table("faqs").select("*").eq("is_active", True)
            
            if category:
                query = query.eq("category", category)
            
            query = query.limit(limit).order("created_at", desc=True)
            
            response = query.execute()
            logger.info(f"Retrieved {len(response.data)} FAQs")
            return response.data
        except APIError as e:
            logger.error(f"Supabase API error in get_all_faqs: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in get_all_faqs: {str(e)}")
            return []

    def get_faq_by_id(self, faq_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single FAQ by its ID.
        
        Args:
            faq_id: UUID of the FAQ
            
        Returns:
            FAQ dictionary or None if not found
        """
        try:
            response = self.client.table("faqs").select("*").eq("id", faq_id).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Retrieved FAQ with ID: {faq_id}")
                return response.data[0]
            else:
                logger.warning(f"FAQ not found with ID: {faq_id}")
                return None
        except APIError as e:
            logger.error(f"Supabase API error in get_faq_by_id: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in get_faq_by_id: {str(e)}")
            return None

    def create_faq(
        self, 
        faq_data: Dict[str, Any], 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new FAQ.
        
        Args:
            faq_data: Dictionary containing FAQ fields
            user_id: ID of the user creating the FAQ
            
        Returns:
            Created FAQ dictionary or None on error
        """
        try:
            # Add metadata
            faq_data["created_by"] = user_id
            faq_data["created_at"] = datetime.utcnow().isoformat()
            faq_data["updated_at"] = datetime.utcnow().isoformat()
            faq_data["view_count"] = 0
            
            response = self.client.table("faqs").insert(faq_data).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Created FAQ with ID: {response.data[0].get('id')}")
                return response.data[0]
            else:
                logger.error("Failed to create FAQ: No data returned")
                return None
        except APIError as e:
            logger.error(f"Supabase API error in create_faq: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in create_faq: {str(e)}")
            return None

    def update_faq(
        self, 
        faq_id: str, 
        faq_data: Dict[str, Any], 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Update an existing FAQ.
        
        Args:
            faq_id: UUID of the FAQ to update
            faq_data: Dictionary containing fields to update
            user_id: ID of the user updating the FAQ
            
        Returns:
            Updated FAQ dictionary or None on error
        """
        try:
            # Check if FAQ exists and user is the creator
            existing_faq = self.get_faq_by_id(faq_id)
            if not existing_faq:
                logger.warning(f"Cannot update: FAQ not found with ID: {faq_id}")
                return None
            
            if existing_faq.get("created_by") != user_id:
                logger.warning(f"User {user_id} not authorized to update FAQ {faq_id}")
                return None
            
            # Add update timestamp
            faq_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.client.table("faqs").update(faq_data).eq("id", faq_id).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Updated FAQ with ID: {faq_id}")
                return response.data[0]
            else:
                logger.error(f"Failed to update FAQ: {faq_id}")
                return None
        except APIError as e:
            logger.error(f"Supabase API error in update_faq: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in update_faq: {str(e)}")
            return None

    def delete_faq(self, faq_id: str, user_id: str) -> bool:
        """
        Soft delete an FAQ (sets is_active to False).
        
        Args:
            faq_id: UUID of the FAQ to delete
            user_id: ID of the user deleting the FAQ
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if FAQ exists and user is the creator
            existing_faq = self.get_faq_by_id(faq_id)
            if not existing_faq:
                logger.warning(f"Cannot delete: FAQ not found with ID: {faq_id}")
                return False
            
            if existing_faq.get("created_by") != user_id:
                logger.warning(f"User {user_id} not authorized to delete FAQ {faq_id}")
                return False
            
            # Soft delete
            response = self.client.table("faqs").update({
                "is_active": False,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", faq_id).execute()
            
            if response.data:
                logger.info(f"Soft deleted FAQ with ID: {faq_id}")
                return True
            else:
                logger.error(f"Failed to delete FAQ: {faq_id}")
                return False
        except APIError as e:
            logger.error(f"Supabase API error in delete_faq: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error in delete_faq: {str(e)}")
            return False

    def increment_faq_views(self, faq_id: str) -> bool:
        """
        Increment the view count for an FAQ.
        
        Args:
            faq_id: UUID of the FAQ
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get current view count
            faq = self.get_faq_by_id(faq_id)
            if not faq:
                return False
            
            current_views = faq.get("view_count", 0)
            
            response = self.client.table("faqs").update({
                "view_count": current_views + 1
            }).eq("id", faq_id).execute()
            
            if response.data:
                logger.info(f"Incremented view count for FAQ: {faq_id}")
                return True
            else:
                return False
        except APIError as e:
            logger.error(f"Supabase API error in increment_faq_views: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error in increment_faq_views: {str(e)}")
            return False

    # ========================================================================
    # Announcement Operations
    # ========================================================================

    def get_all_announcements(
        self, 
        limit: int = 50, 
        upcoming_only: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Retrieve announcements, optionally filtered to upcoming only.
        
        Args:
            limit: Maximum number of announcements to return (default: 50)
            upcoming_only: If True, only return future announcements
            
        Returns:
            List of announcement dictionaries
        """
        try:
            query = self.client.table("announcements").select("*").eq("is_active", True)
            
            if upcoming_only:
                current_time = datetime.utcnow().isoformat()
                query = query.gte("date", current_time)
            
            query = query.limit(limit).order("date", desc=False)
            
            response = query.execute()
            logger.info(f"Retrieved {len(response.data)} announcements")
            return response.data
        except APIError as e:
            logger.error(f"Supabase API error in get_all_announcements: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in get_all_announcements: {str(e)}")
            return []

    def get_announcement_by_id(self, announcement_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single announcement by its ID.
        
        Args:
            announcement_id: UUID of the announcement
            
        Returns:
            Announcement dictionary or None if not found
        """
        try:
            response = self.client.table("announcements").select("*").eq("id", announcement_id).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Retrieved announcement with ID: {announcement_id}")
                return response.data[0]
            else:
                logger.warning(f"Announcement not found with ID: {announcement_id}")
                return None
        except APIError as e:
            logger.error(f"Supabase API error in get_announcement_by_id: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in get_announcement_by_id: {str(e)}")
            return None

    def create_announcement(
        self, 
        announcement_data: Dict[str, Any], 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new announcement.
        
        Args:
            announcement_data: Dictionary containing announcement fields
            user_id: ID of the user creating the announcement
            
        Returns:
            Created announcement dictionary or None on error
        """
        try:
            # Add metadata
            announcement_data["created_by"] = user_id
            announcement_data["created_at"] = datetime.utcnow().isoformat()
            announcement_data["updated_at"] = datetime.utcnow().isoformat()
            announcement_data["is_active"] = True
            
            response = self.client.table("announcements").insert(announcement_data).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Created announcement with ID: {response.data[0].get('id')}")
                return response.data[0]
            else:
                logger.error("Failed to create announcement: No data returned")
                return None
        except APIError as e:
            logger.error(f"Supabase API error in create_announcement: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in create_announcement: {str(e)}")
            return None

    def update_announcement(
        self, 
        announcement_id: str, 
        announcement_data: Dict[str, Any], 
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Update an existing announcement.
        
        Args:
            announcement_id: UUID of the announcement to update
            announcement_data: Dictionary containing fields to update
            user_id: ID of the user updating the announcement
            
        Returns:
            Updated announcement dictionary or None on error
        """
        try:
            # Check if announcement exists and user is the creator
            existing_announcement = self.get_announcement_by_id(announcement_id)
            if not existing_announcement:
                logger.warning(f"Cannot update: Announcement not found with ID: {announcement_id}")
                return None
            
            if existing_announcement.get("created_by") != user_id:
                logger.warning(f"User {user_id} not authorized to update announcement {announcement_id}")
                return None
            
            # Add update timestamp
            announcement_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.client.table("announcements").update(announcement_data).eq("id", announcement_id).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Updated announcement with ID: {announcement_id}")
                return response.data[0]
            else:
                logger.error(f"Failed to update announcement: {announcement_id}")
                return None
        except APIError as e:
            logger.error(f"Supabase API error in update_announcement: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in update_announcement: {str(e)}")
            return None

    def delete_announcement(self, announcement_id: str, user_id: str) -> bool:
        """
        Soft delete an announcement (sets is_active to False).
        
        Args:
            announcement_id: UUID of the announcement to delete
            user_id: ID of the user deleting the announcement
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if announcement exists and user is the creator
            existing_announcement = self.get_announcement_by_id(announcement_id)
            if not existing_announcement:
                logger.warning(f"Cannot delete: Announcement not found with ID: {announcement_id}")
                return False
            
            if existing_announcement.get("created_by") != user_id:
                logger.warning(f"User {user_id} not authorized to delete announcement {announcement_id}")
                return False
            
            # Soft delete
            response = self.client.table("announcements").update({
                "is_active": False,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", announcement_id).execute()
            
            if response.data:
                logger.info(f"Soft deleted announcement with ID: {announcement_id}")
                return True
            else:
                logger.error(f"Failed to delete announcement: {announcement_id}")
                return False
        except APIError as e:
            logger.error(f"Supabase API error in delete_announcement: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error in delete_announcement: {str(e)}")
            return False

    # ========================================================================
    # Chat Log Operations
    # ========================================================================

    def create_chat_log(self, log_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create a new chat log entry.
        
        Args:
            log_data: Dictionary containing chat log fields
            
        Returns:
            Created chat log dictionary or None on error
        """
        try:
            # Add timestamp
            log_data["created_at"] = datetime.utcnow().isoformat()
            
            response = self.client.table("chat_logs").insert(log_data).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Created chat log with ID: {response.data[0].get('id')}")
                return response.data[0]
            else:
                logger.error("Failed to create chat log: No data returned")
                return None
        except APIError as e:
            logger.error(f"Supabase API error in create_chat_log: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in create_chat_log: {str(e)}")
            return None

    def get_user_chat_logs(
        self, 
        user_id: str, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Retrieve chat logs for a specific user.
        
        Args:
            user_id: ID of the user
            limit: Maximum number of logs to return (default: 50)
            
        Returns:
            List of chat log dictionaries
        """
        try:
            response = self.client.table("chat_logs").select("*").eq("user_id", user_id).limit(limit).order("created_at", desc=True).execute()
            
            logger.info(f"Retrieved {len(response.data)} chat logs for user: {user_id}")
            return response.data
        except APIError as e:
            logger.error(f"Supabase API error in get_user_chat_logs: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in get_user_chat_logs: {str(e)}")
            return []


# Singleton instance
_supabase_service: Optional[SupabaseService] = None


def get_supabase_service() -> SupabaseService:
    """
    Get or create the singleton SupabaseService instance.
    
    Returns:
        SupabaseService instance
    """
    global _supabase_service
    if _supabase_service is None:
        _supabase_service = SupabaseService()
    return _supabase_service
