from unittest.mock import patch

from public_api import fetch_public_products


@patch("public_api.requests.get")
def test_fetch_public_products_returns_normalized_results(mock_get):
    mock_get.return_value.raise_for_status.return_value = None
    mock_get.return_value.json.return_value = {
        "products": [
            {"id": 1, "title": "MacBook", "category": "electronics", "price": 999.99}
        ]
    }

    products = fetch_public_products(limit=1)

    assert len(products) == 1
    assert products[0]["name"] == "MacBook"
    assert products[0]["source"] == "dummyjson"
    assert products[0]["price"] == 999.99


@patch("public_api.requests.get", side_effect=Exception("network issue"))
def test_fetch_public_products_falls_back_cleanly(mock_get):
    assert fetch_public_products(limit=3) == []
