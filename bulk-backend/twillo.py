import os
import requests
import asyncio
import logging
from dotenv import load_dotenv

class WhatsAppBulkMessenger:
    def __init__(self):
        load_dotenv()
        
        self.token = os.getenv('WHATSAPP_TOKEN')
        self.phone_number_id = os.getenv('PHONE_NUMBER_ID')
        
        self.base_url = f'https://graph.facebook.com/v22.0/{self.phone_number_id}/messages'
        
        logging.basicConfig(level=logging.INFO, 
                            format='%(asctime)s - %(levelname)s: %(message)s')
        self.logger = logging.getLogger(__name__)

    async def send_template_message(self, contact, template_name='hello_world', language_code='en_US'):
        """
        Send a WhatsApp template message
        """
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": contact,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code}
            }
        }
        
        try:
            async with asyncio.Lock():
                response = await self._async_post(self.base_url, headers=headers, json=payload)
            
            if response.status_code in [200, 201]:
                self.logger.info(f"Message sent successfully to {contact}")
                return {
                    'contact': contact,
                    'status': 'success',
                    'response': response.json()
                }
            else:
                self.logger.error(f"Failed to send message to {contact}")
                self.logger.error(f"Status Code: {response.status_code}")
                self.logger.error(f"Response: {response.text}")
                return {
                    'contact': contact,
                    'status': 'failed',
                    'error': response.text
                }
        
        except Exception as e:
            self.logger.error(f"Exception occurred while sending message to {contact}")
            self.logger.error(f"Error: {str(e)}")
            return {
                'contact': contact,
                'status': 'failed',
                'error': str(e)
            }

    async def _async_post(self, url, headers=None, json=None):
        """
        Async POST request using aiohttp
        """
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=json) as response:
                return await self._create_response_proxy(response)

    async def _create_response_proxy(self, response):
        """
        Create a proxy response object to mimic requests library response
        """
        class ResponseProxy:
            def __init__(self, status_code, text, json_data):
                self.status_code = status_code
                self._text = text
                self._json_data = json_data
            
            def text(self):
                return self._text
            
            def json(self):
                return self._json_data
        
        return ResponseProxy(
            response.status, 
            await response.text(), 
            await response.json() if response.content_type == 'application/json' else {}
        )

    async def send_bulk_template_messages(self, contacts, template_name='hello_world', language_code='en_US'):
        """
        Send template messages to multiple contacts
        """
        results = await asyncio.gather(
            *[self.send_template_message(contact, template_name, language_code) for contact in contacts],
            return_exceptions=True
        )
        
        self._log_detailed_results(results)
        return results

    def _log_detailed_results(self, results):
        """
        Provide a comprehensive breakdown of messaging results
        """
        success_contacts = [r['contact'] for r in results if isinstance(r, dict) and r.get('status') == 'success']
        failed_contacts = [r['contact'] for r in results if isinstance(r, dict) and r.get('status') == 'failed']
        
        self.logger.info("Detailed Messaging Report:")
        self.logger.info(f"Total Contacts Attempted: {len(results)}")
        self.logger.info(f"Successful Messages: {len(success_contacts)}")
        self.logger.info(f"Failed Messages: {len(failed_contacts)}")
        
        if failed_contacts:
            self.logger.warning(f"Failed Contacts: {', '.join(failed_contacts)}")

def main():
    bulk_messenger = WhatsAppBulkMessenger()
    
    contacts = [
        '254701183935', 
        '254701423251', 
        '254790358274'
    ]
    
    async def run_messaging():
        results = await bulk_messenger.send_bulk_template_messages(
            contacts, 
            template_name='hello_world',
            language_code='en_US'
        )
        
        for result in results:
            print(result)
    
    asyncio.run(run_messaging())

if __name__ == "__main__":
    main()