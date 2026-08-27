import re
import hashlib
import uuid

class PrivacyGuard:
    """
    Privacy by Design Layer:
    - Masks PII in user strings before display/storage
    - Anonymizes conversation & event identifiers
    - Zero raw-chat persistence guarantee
    """

    @staticmethod
    def mask_pii(text: str) -> str:
        if not text:
            return ""

        # Mask Phone numbers
        text = re.sub(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[PHONE_NUMBER_PROTECTED]', text)
        
        # Mask Email addresses
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL_PROTECTED]', text)

        # Mask Passwords or sensitive keys
        text = re.sub(r'\b(pass(?:word)?\s*[:=]\s*)(\S+)', r'\1********', text, flags=re.IGNORECASE)

        return text

    @staticmethod
    def anonymize_id(raw_id: str) -> str:
        """
        Generates a non-reversible anonymized string identifier.
        """
        hash_digest = hashlib.sha256(raw_id.encode('utf-8')).hexdigest()[:8].upper()
        return f"ANON-{hash_digest}"

    @staticmethod
    def generate_event_id() -> str:
        return f"EVT-{uuid.uuid4().hex[:6].upper()}"
