def test_health_endpoint_success(client):
    """Verify that GET /api/v1/health returns 200 OK with correct metadata."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "AI Finance Advisor"
    assert data["environment"] == "development"
    assert "version" in data
    assert "timestamp" in data


def test_health_request_id_header(client):
    """Verify that the health response contains the X-Request-ID tracking header."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert "x-request-id" in response.headers
    assert response.headers["x-request-id"].startswith("req_")

def test_readiness_endpoint_success(client):
    """Verify that GET /api/v1/health/ready returns 200 OK and database ok."""
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"

def test_readiness_endpoint_db_failure(client):
    """Verify that GET /api/v1/health/ready handles DB failure gracefully."""
    from app.dependencies.database import get_db

    class MockFailingDB:
        async def execute(self, *args, **kwargs):
            raise Exception("DB connection failed")

    async def override_get_db():
        yield MockFailingDB()

    original_override = client.app.dependency_overrides.get(get_db)
    client.app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/api/v1/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unavailable"
        assert data["database"] == "unavailable"
    finally:
        if original_override:
            client.app.dependency_overrides[get_db] = original_override
        else:
            del client.app.dependency_overrides[get_db]
