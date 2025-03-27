# schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenData(BaseModel):
    username: Optional[str] = None

class RecipientCreate(BaseModel):
    phone_number: str

class MessageBroadcastCreate(BaseModel):
    message_content: str = Field(..., max_length=1000)
    recipients: List[RecipientCreate]
    wa_business_account_id: str
    phone_number_id: str
    template_name: Optional[str] = "hello_world"

class BroadcastStatusResponse(BaseModel):
    broadcast_id: int
    status_counts: dict

class MessageBroadcastResponse(BaseModel):
    id: int
    message_content: str
    created_at: datetime
    recipients_count: int