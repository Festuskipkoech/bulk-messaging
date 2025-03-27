import requests
import logging
from typing import Dict, Optional, Any, List

class WhatsAppService:
    def __init__(
        self, 
        access_token: str, 
        phone_number_id: str, 
        business_account_id: str
    ):
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.business_account_id = business_account_id
        self.base_url = "https://graph.facebook.com/v19.0"
        self.logger = logging.getLogger(__name__)

    def send_text_message(
        self, 
        recipient_phone: str, 
        message: str
    ) -> Dict[str, Any]:
        """
        Send a text message via WhatsApp Business API
        """
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_phone,
            "type": "text",
            "text": {"body": message}
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"WhatsApp message send error: {e}")
            return {"error": str(e)}

    def send_template_message(
        self, 
        recipient_phone: str, 
        template_name: str, 
        language_code: str = 'en_US',
        components: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Send a message using a pre-approved WhatsApp message template
        """
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code}
            }
        }
        
        if components:
            payload["template"]["components"] = components
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"WhatsApp template message error: {e}")
            return {"error": str(e)}