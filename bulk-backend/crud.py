# crud.py
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

import models
import schemas
import utils.security as security

class UserCRUD:
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate):
        try:
            hashed_password = security.get_password_hash(user.password)
            db_user = models.User(
                username=user.username, 
                email=user.email, 
                hashed_password=hashed_password
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        except IntegrityError:
            db.rollback()
            raise ValueError("Username or email already exists")

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(models.User).filter(models.User.email == email).first()

class CampaignCRUD:
    @staticmethod
    def create_campaign(
        db: Session, 
        campaign: schemas.CampaignCreate, 
        user_id: int
    ):
        db_campaign = models.Campaign(
            user_id=user_id,
            name=campaign.name,
            message_template=campaign.message_template,
            campaign_type=campaign.campaign_type,
            status='pending',
            total_contacts=len(campaign.contacts)
        )
        db.add(db_campaign)
        db.commit()
        db.refresh(db_campaign)
        
        # Create message entries
        messages = [
            models.Message(
                campaign_id=db_campaign.id, 
                recipient_phone=contact.phone, 
                status='pending',
                additional_data=contact.additional_data or {}
            ) for contact in campaign.contacts
        ]
        db.add_all(messages)
        db.commit()
        
        return db_campaign

    @staticmethod
    def get_campaign_by_id(db: Session, campaign_id: int):
        return db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()

    @staticmethod
    def update_campaign_status(
        db: Session, 
        campaign_id: int, 
        status: str
    ):
        campaign = db.query(models.Campaign).filter(
            models.Campaign.id == campaign_id
        ).first()
        
        if campaign:
            campaign.status = status
            db.commit()
            db.refresh(campaign)
        
        return campaign

class MessageCRUD:
    @staticmethod
    def update_message_status(
        db: Session, 
        campaign_id: int, 
        recipient_phone: str, 
        status: str,
        additional_data: Optional[dict] = None
    ):
        message = db.query(models.Message).filter(
            models.Message.campaign_id == campaign_id,
            models.Message.recipient_phone == recipient_phone
        ).first()
        
        if message:
            message.status = status
            message.sent_at = datetime.utcnow()
            if additional_data:
                message.additional_data.update(additional_data)
            
            db.commit()
            db.refresh(message)
        
        return message