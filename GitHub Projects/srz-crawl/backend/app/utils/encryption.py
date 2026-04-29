# /opt/srz-crawl/app/utils/encryption.py
import os
import base64
from cryptography.fernet import Fernet
from loguru import logger


def _get_fernet() -> Fernet:
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("ENCRYPTION_KEY not set in environment")
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt(value: str) -> str:
    """Encrypt a string value and return base64-encoded ciphertext."""
    try:
        f = _get_fernet()
        encrypted = f.encrypt(value.encode("utf-8"))
        return encrypted.decode("utf-8")
    except Exception as e:
        logger.error(f"Encryption error: {e}")
        raise


def decrypt(encrypted_value: str) -> str:
    """Decrypt a base64-encoded ciphertext and return plaintext."""
    try:
        f = _get_fernet()
        decrypted = f.decrypt(encrypted_value.encode("utf-8"))
        return decrypted.decode("utf-8")
    except Exception as e:
        logger.error(f"Decryption error: {e}")
        raise


def mask_key(key: str, visible_chars: int = 4) -> str:
    """Return a masked version of an API key like sk-...xxxx"""
    if not key:
        return ""
    if len(key) <= visible_chars * 2:
        return "*" * len(key)
    prefix = key[:8] if key.startswith("sk-") else key[:4]
    suffix = key[-visible_chars:]
    return f"{prefix}...{suffix}"


def mask_url(url: str) -> str:
    """Mask a URL, showing only the domain."""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.netloc}/..."
    except Exception:
        return url[:20] + "..."
