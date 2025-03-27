# utils/validators.py
import re
from typing import List, Dict, Any

def validate_phone_number(phone: str) -> bool:
    """
    Validate international phone number format
    Supports various international formats
    """
    # Regex for international phone number validation
    phone_regex = r'^\+?1?\d{9,15}$'
    return re.match(phone_regex, phone) is not None

def sanitize_input(input_data: Any) -> Any:
    """
    Basic input sanitization to prevent injection
    """
    if isinstance(input_data, str):
        # Remove potentially dangerous characters
        return re.sub(r'[<>&\']', '', input_data)
    elif isinstance(input_data, dict):
        return {k: sanitize_input(v) for k, v in input_data.items()}
    elif isinstance(input_data, list):
        return [sanitize_input(item) for item in input_data]
    return input_data