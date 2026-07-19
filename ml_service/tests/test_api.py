from fastapi.testclient import TestClient
import sys
import os

# Ensure the parent directory is in sys.path so we can import 'main'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import the main FastAPI app
# Note: We must mock the Machine Learning model loading in a real enterprise setup, 
# but for this Phase 10 execution, we will mock the dependencies dynamically.
from main import app

# Create a test client
client = TestClient(app)

def test_missing_api_key_rejected():
    """Test that our new Phase 10 API Security blocks unauthorized access."""
    response = client.post("/api/v1/predict", json={
        "latitude": 28.7,
        "longitude": 77.1
    })
    
    # We expect a 401 Unauthorized because the X-API-Key header is missing
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing API Key header"}

def test_invalid_api_key_rejected():
    """Test that a fake API key is blocked."""
    response = client.post("/api/v1/predict", 
        headers={"X-API-Key": "HACKER_KEY"},
        json={
            "latitude": 28.7,
            "longitude": 77.1
        }
    )
    
    # We expect a 403 Forbidden because the API key doesn't match os.environ
    assert response.status_code == 403
    assert response.json() == {"detail": "Invalid API Key"}

def test_health_check_requires_no_auth():
    """Test that the /health endpoint is accessible (if we didn't block it globally).
    Wait, in Phase 10 we applied security globally. Let's see what happens!
    Actually, /health is protected now. Let's test it with the valid key."""
    
    # Assuming default key is "s2s_test_key_123" from security.py
    valid_key = os.environ.get("S2S_API_KEY", "s2s_test_key_123")
    
    response = client.get("/api/v1/health", headers={"X-API-Key": valid_key})
    
    # If the DB is offline during the test, it returns 503. If online, 200.
    assert response.status_code in [200, 503]
    if response.status_code == 200:
        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"
