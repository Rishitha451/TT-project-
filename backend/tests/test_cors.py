def test_cors_preflight_request(client):
    """Verify that OPTIONS CORS preflight returns correct access control headers for configured origin."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization,content-type,x-request-id",
    }
    response = client.options("/api/v1/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "GET" in response.headers.get("access-control-allow-methods", "")


def test_cors_simple_request_origin_header(client):
    """Verify that simple GET requests include access-control-allow-origin header."""
    headers = {
        "Origin": "http://localhost:5173",
    }
    response = client.get("/api/v1/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
