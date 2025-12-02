from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}

def test_get_sessions():
    response = client.get("/api/v1/sessions")
    assert response.status_code == 200
    assert "total" in response.json()
    assert "sessions" in response.json()
    assert isinstance(response.json()["total"], int)
    assert isinstance(response.json()["sessions"], list)
