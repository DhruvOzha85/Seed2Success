from fastapi import HTTPException, Security, Request
from fastapi.security import APIKeyHeader
from slowapi import Limiter
from slowapi.util import get_remote_address
import os

# Rate Limiter setup (using IP address as identifier)
limiter = Limiter(key_func=get_remote_address)

# API Key Authentication setup
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# In production, this would be validated against the Database or HashiCorp Vault.
# For now, it pulls from the Environment Variable or uses a default test key.
VALID_API_KEY = os.environ.get("S2S_API_KEY", "s2s_test_key_123")

async def verify_api_key(api_key_header: str = Security(api_key_header)):
    """Dependency to enforce API Key authentication on protected routes."""
    if not api_key_header:
        raise HTTPException(status_code=401, detail="Missing API Key header")
    if api_key_header != VALID_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key_header
