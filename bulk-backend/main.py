# main.py
import os
import requests
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

import models
import schemas
import auth
from database import engine, get_db
import re
from whatsapp_service import create_broadcast_queue
import threading

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(
    user_credentials: schemas.UserLogin,  # Create this schema
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/broadcast", response_model=schemas.MessageBroadcastResponse)
def send_whatsapp_broadcast(
    broadcast: schemas.MessageBroadcastCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Create broadcast record
    db_broadcast = models.MessageBroadcast(
        user_id=current_user.id,
        message_content=broadcast.message_content,
        wa_business_account_id=broadcast.wa_business_account_id,
        phone_number_id=broadcast.phone_number_id,
        template_name=broadcast.template_name or "hello_world"
    )
    db.add(db_broadcast)
    db.commit()
    db.refresh(db_broadcast)

    # Validate recipients and phone numbers
    if not broadcast.recipients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No recipients provided"
        )

    # Add recipients with detailed tracking
    recipients = []
    successful_recipients = 0
    failed_recipients = 0


    # Add recipients
    recipients = []
    for recipient in broadcast.recipients:
        db_recipient = models.Recipient(
            broadcast_id=db_broadcast.id,
            phone_number=recipient.phone_number,
            status=models.MessageStatus.QUEUED
        )
        recipients.append(db_recipient)
        db.add(db_recipient)

    # db.commit()

    # Start broadcast in a separate thread to not block the API
    def start_broadcast():
        create_broadcast_queue(
            broadcast_id=db_broadcast.id, 
            recipients=[
                {
                    "phone_number": r.phone_number, 
                    "template_name": db_broadcast.template_name
                } for r in recipients
            ],
            access_token=os.getenv('WHATSAPP_ACCESS_TOKEN'),
            phone_number_id=broadcast.phone_number_id
        )

    # Use threading to prevent blocking
    threading.Thread(target=start_broadcast, daemon=True).start()

    return {
        "id": db_broadcast.id,
        "message_content": db_broadcast.message_content,
        "created_at": db_broadcast.created_at,
        "recipients_count": len(recipients)
    }

def is_valid_phone_number(phone_number: str) -> bool:
    """
    Validate phone number format
    Customize this function based on your specific requirements
    """
    # Basic validation - ensure it starts with + and has digits
    return bool(re.match(r'^\+[1-9]\d{1,14}$', phone_number))
def send_whatsapp_message(phone_number, message, phone_number_id):
    # Replace with actual WhatsApp Business API call
    access_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
    api_url = f"https://graph.facebook.com/v22.0/{phone_number_id}/messages"
    
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone_number,
        "type": "text",
        "text": {"body": message}
    }
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        return {"success": True, "data": response.json()}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


@app.get("/broadcast/{broadcast_id}/status")
def get_broadcast_status(
    broadcast_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Fetch broadcast and its recipients
    broadcast = db.query(models.MessageBroadcast).filter(
        models.MessageBroadcast.id == broadcast_id,
        models.MessageBroadcast.user_id == current_user.id
    ).first()

    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    # Aggregate status
    status_counts = {}
    for status in models.MessageStatus:
        count = db.query(models.Recipient).filter(
            models.Recipient.broadcast_id == broadcast_id,
            models.Recipient.status == status
        ).count()
        status_counts[status.value] = count

    return {
        "broadcast_id": broadcast_id,
        "status_counts": status_counts
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)