# services/message_service.py
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import services.whatsapp_service as whatsapp_service
import crud
import models

class MessageProcessingService:
    def __init__(
        self, 
        db: Session, 
        whatsapp_service: whatsapp_service.WhatsAppService
    ):
        self.db = db
        self.whatsapp_service = whatsapp_service

    def process_campaign_messages(
        self, 
        campaign_id: int, 
        batch_size: int = 50
    ) -> Dict[str, Any]:
        """
        Process messages for a specific campaign in batches
        """
        campaign = crud.CampaignCRUD.get_campaign_by_id(self.db, campaign_id)
        
        if not campaign:
            return {"error": "Campaign not found"}
        
        # Get pending messages
        pending_messages = self.db.query(models.Message).filter(
            models.Message.campaign_id == campaign_id,
            models.Message.status == 'pending'
        ).limit(batch_size).all()
        
        results = []
        
        for message in pending_messages:
            # Send message based on campaign type
            if campaign.campaign_type == 'broadcast':
                result = self.whatsapp_service.send_text_message(
                    message.recipient_phone, 
                    campaign.message_template
                )
            elif campaign.campaign_type == 'personalized':
                # You could implement personalization logic here
                personalized_message = self.personalize_message(
                    campaign.message_template, 
                    message.additional_data
                )
                result = self.whatsapp_service.send_text_message(
                    message.recipient_phone, 
                    personalized_message
                )
            
            # Update message status
            if 'error' not in result:
                crud.MessageCRUD.update_message_status(
                    self.db, 
                    campaign_id, 
                    message.recipient_phone, 
                    'sent', 
                    result
                )
                results.append({
                    'phone': message.recipient_phone, 
                    'status': 'sent'
                })
            else:
                crud.MessageCRUD.update_message_status(
                    self.db, 
                    campaign_id, 
                    message.recipient_phone, 
                    'failed', 
                    result
                )
                results.append({
                    'phone': message.recipient_phone, 
                    'status': 'failed'
                })
        
        # Update campaign status if all messages processed
        remaining_pending = self.db.query(models.Message).filter(
            models.Message.campaign_id == campaign_id,
            models.Message.status == 'pending'
        ).count()
        
        if remaining_pending == 0:
            crud.CampaignCRUD.update_campaign_status(
                self.db, 
                campaign_id, 
                'completed'
            )
        
        return {
            "campaign_id": campaign_id,
            "total_processed": len(results),
            "results": results
        }

    def personalize_message(
        self, 
        template: str, 
        contact_data: Dict
    ) -> str:
        """
        Personalize message template with contact data
        """
        try:
            return template.format(**contact_data)
        except KeyError as e:
            # Log missing personalization variables
            return template