# models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with messages
    message_broadcasts = relationship("MessageBroadcast", back_populates="user")


class MessageStatus(enum.Enum):
    PENDING = "pending"
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"

class MessageBroadcast(Base):
    __tablename__ = "message_broadcasts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    message_content = Column(String(1000))
    wa_business_account_id = Column(String(50))
    phone_number_id = Column(String(50))
    template_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with user
    user = relationship("User", back_populates="message_broadcasts")
    
    # Relationship with recipients
    recipients = relationship("Recipient", back_populates="broadcast")

class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(Integer, primary_key=True, index=True)
    broadcast_id = Column(Integer, ForeignKey('message_broadcasts.id'))
    phone_number = Column(String(20))
    status = Column(Enum(MessageStatus), default=MessageStatus.PENDING)
    message_sid = Column(String(100), nullable=True)
    error_message = Column(String(500), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with message broadcast
    broadcast = relationship("MessageBroadcast", back_populates="recipients")
    __tablename__ = "recipients"

    id = Column(Integer, primary_key=True, index=True)
    broadcast_id = Column(Integer, ForeignKey('message_broadcasts.id'))
    phone_number = Column(String(20))
    status = Column(String(20), default='pending')  # pending, sent, delivered, failed
    
    # Relationship with message broadcast
    message_broadcast = relationship("MessageBroadcast")