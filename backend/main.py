from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
import logging

from dotenv import load_dotenv

# Load environment variables FIRST before importing other modules
load_dotenv()

from middleware.auth import get_current_user, AuthUser
from routers import faqs, announcements, chat_logs
from services.supabase_service import get_supabase_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up ClarifyAI API...")
    try:
        db = get_supabase_service()
        logger.info("✓ Supabase connection established successfully")
    except Exception as e:
        logger.error(f"✗ Failed to connect to Supabase: {str(e)}")
        logger.warning("API will start but database operations may fail")
    yield
    logger.info("Shutting down ClarifyAI API...")

app = FastAPI(
    title="ClarifyAI API",
    description="Intelligent campus assistant API for FAQs, announcements, and chat",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization"],
    expose_headers=["*"],
)




@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):

    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "message": "Validation error in request data"
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": "An internal server error occurred",
            "detail": str(exc) if app.debug else "Please contact support"
        }
    )





app.include_router(faqs.router, prefix="/api/v1", tags=["FAQs"])
app.include_router(announcements.router, prefix="/api/v1", tags=["Announcements"])
app.include_router(chat_logs.router, prefix="/api/v1", tags=["Chat Logs"])



class UserInfoResponse(BaseModel):
    id: str
    email: Optional[str] = None
    auth_provider: Optional[str] = None


class ProtectedTestResponse(BaseModel):
    message: str
    user: dict




@app.get("/")
def root():

    return {
        "message": "ClarifyAI API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "faqs": "/api/v1/faqs",
            "announcements": "/api/v1/announcements",
            "chat-logs": "/api/v1/chat-logs",
            "auth": "/api/v1/auth/me",
            "health": "/ping"
        },
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/ping")
def ping():
    return {"status": "healthy"}


@app.get("/api/v1/auth/me", response_model=UserInfoResponse)
def get_me(current_user: AuthUser = Depends(get_current_user)):

    # Determine auth provider from user metadata if available
    auth_provider = "email"  # Default to email
    if current_user.email and "google" in current_user.email.lower():
        auth_provider = "google"
    
    return UserInfoResponse(
        id=current_user.id,
        email=current_user.email,
        auth_provider=auth_provider
    )


@app.post("/api/v1/protected/test", response_model=ProtectedTestResponse)
def protected_test(current_user: AuthUser = Depends(get_current_user)):

    return ProtectedTestResponse(
        message="Authentication successful",
        user={
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role
        }
    )


