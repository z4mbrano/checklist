"""
Authentication schemas for API serialization
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")
    user: "UserInfo"


class UserInfo(BaseModel):
    """Schema for user information in token response."""
    id: int
    name: str
    email: str
    role: UserRole


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str = Field(..., description="Refresh token")


class LogoutRequest(BaseModel):
    """Schema for logout request."""
    token: str = Field(..., description="Token to invalidate")


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    email: EmailStr = Field(..., description="User email address")


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""
    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=6, max_length=50, description="New password")


class RegisterRequest(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, max_length=50, description="User password")