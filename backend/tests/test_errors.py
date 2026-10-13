def test_404_not_found_standardized_format(client):
    """Verify that accessing a non-existent route returns standardized 404 error schema."""
    response = client.get("/api/v1/non_existent_route_404")
    assert response.status_code == 404

    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "timestamp" in data


def test_405_method_not_allowed(client):
    """Verify that invoking an unallowed HTTP method returns standardized 405 error schema."""
    response = client.delete("/api/v1/health")
    assert response.status_code == 405

    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "METHOD_NOT_ALLOWED"
    assert "timestamp" in data
