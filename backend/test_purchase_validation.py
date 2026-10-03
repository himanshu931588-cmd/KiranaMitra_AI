from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_purchase_item_rejects_non_positive_quantity():
    response = client.post(
        "/api/purchase-list/add",
        json={"product_id": 1, "quantity": 0, "unit": "packets"},
    )

    assert response.status_code == 400
    assert "positive" in response.json()["detail"].lower()
