# whatsapp_service.py
import asyncio
import logging
import uuid
import json
import aiohttp
import redis
from sqlalchemy.orm import Session
import models
from database import SessionLocal

class WhatsAppMessageSender:
    def __init__(self, access_token, phone_number_id):
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.logger = logging.getLogger(__name__)

    async def send_template_message(self, 
                                    phone_number: str, 
                                    template_name: str = "hello_world", 
                                    language_code: str = "en_US"):
        """
        Send a WhatsApp template message
        """
        url = f"https://graph.facebook.com/v22.0/{self.phone_number_id}/messages"
        
        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code}
            }
        }

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    result = await response.json()
                    if response.status == 200:
                        return {
                            "status": "success", 
                            "message_id": result.get('messages', [{}])[0].get('id')
                        }
                    else:
                        return {"status": "failed", "error": result}
        except Exception as e:
            self.logger.error(f"Message sending error: {e}")
            return {"status": "failed", "error": str(e)}

    def queue_broadcast(self, broadcast_id: int, recipients: list):
        """
        Queue messages for a specific broadcast
        """
        for recipient in recipients:
            # Generate unique job ID
            job_id = f"whatsapp_job:{uuid.uuid4()}"
            
            # Store message in queue
            self.redis_client.rpush('whatsapp_message_queue', json.dumps({
                'job_id': job_id,
                'broadcast_id': broadcast_id,
                'phone_number': recipient['phone_number'],
                'template_name': recipient.get('template_name', 'hello_world'),
                'attempts': 0
            }))

    async def process_message_queue(self, max_workers=10):
        """
        Async worker to process message queue with concurrency
        """
        async def worker():
            # Create a new database session for each worker
            db = SessionLocal()
            try:
                db = SessionLocal()
                
                while True:
                    # Fetch message from queue with timeout to prevent blocking
                    message_data = self.redis_client.lpop('whatsapp_message_queue')
                    if not message_data:
                        await asyncio.sleep(1)
                        continue

                    try:
                        message = json.loads(message_data)
                    except json.JSONDecodeError:
                        self.logger.error(f"Invalid JSON in message queue: {message_data}")
                        continue

                    # Prevent infinite retries
                    if message['attempts'] > 3:
                        await self.handle_max_attempts(db, message)
                        continue

                    # Send message
                    try:
                        result = await self.send_template_message(
                            phone_number=message['phone_number'],
                            template_name=message.get('template_name', 'hello_world')
                        )

                        await self.update_recipient_status(db, message, result)

                    except Exception as send_error:
                        self.logger.error(f"Error sending message: {send_error}")
                        await self.handle_send_error(db, message, send_error)

            except Exception as worker_error:
                self.logger.error(f"Unhandled worker error: {worker_error}")
            finally:
                # Ensure database session is always closed
                if db:
                    try:
                        db.close()
                    except Exception as close_error:
                        self.logger.error(f"Error closing database session: {close_error}")


        # Create worker pool
        workers = [asyncio.create_task(worker()) for _ in range(max_workers)]
        await asyncio.gather(*workers)

def create_broadcast_queue(broadcast_id: int, recipients: list, access_token: str, phone_number_id: str):
    """
    Helper function to create and process broadcast queue
    """
    sender = WhatsAppMessageSender(
        access_token=access_token, 
        phone_number_id=phone_number_id
    )
    
    # Queue messages
    sender.queue_broadcast(broadcast_id, recipients)
    
    # Start processing (this would typically be done via Celery or similar)
    asyncio.run(sender.process_message_queue())