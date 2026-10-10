<<<<<<< HEAD
"""Integration tests for PRAMAAN AI FastAPI endpoints and audit workflows."""
=======
"""Integration tests for SiteSure AI FastAPI endpoints and audit workflows."""
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_ready_check():
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "siteaudit"
    assert "version" in data
