from typing import Optional
import os

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

# Load environment variables
load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("SUPABASE_SERVICE_KEY")


class AuthUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None
    # Add more fields if needed from JWT claims


def verify_supabase_token(token: str) -> AuthUser:
    """Verify Supabase JWT using shared secret; return user claims."""
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="JWT secret not configured")
    try:
        # Supabase uses HS256 with project JWT secret (or service key for verification)
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub") or payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing subject")
        email = payload.get("email")
        role = payload.get("role")
        return AuthUser(id=str(user_id), email=email, role=role)
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid or expired token: {str(e)}")


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> AuthUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Bearer token")
    token = credentials.credentials
    return verify_supabase_token(token)


