import requests

PUBLIC_PRODUCTS_URL = "https://dummyjson.com/products"


def fetch_public_products(limit: int = 10):
    """Fetch a small product list from a public API and normalize it for the app."""
    try:
        page_limit = max(1, min(int(limit), 30))
        response = requests.get(PUBLIC_PRODUCTS_URL, params={"limit": page_limit}, timeout=8)
        response.raise_for_status()
        payload = response.json() or {}
        items = payload.get("products", [])

        normalized = []
        for item in items[:page_limit]:
            name = item.get("title") or item.get("name") or "Unnamed product"
            normalized.append(
                {
                    "id": item.get("id"),
                    "name": name,
                    "category": item.get("category"),
                    "price": float(item.get("price") or 0.0),
                    "rating": item.get("rating"),
                    "source": "dummyjson",
                }
            )
        return normalized
    except Exception:
        return []
