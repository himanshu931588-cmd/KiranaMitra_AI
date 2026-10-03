import sqlite3
import json
from database import get_db_connection

def get_all_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()

    products = []
    for row in rows:
        p = dict(row)
        if p.get("aliases"):
            try:
                p["aliases"] = json.loads(p["aliases"])
            except Exception:
                p["aliases"] = []
        else:
            p["aliases"] = []
        
        # Calculate stock status
        if p["stock"] <= 0:
            p["status"] = "OUT_OF_STOCK"
            p["status_color"] = "RED"
        elif p["stock"] <= p["min_threshold"]:
            p["status"] = "LOW_STOCK"
            p["status_color"] = "RED"
        elif p["stock"] <= p["min_threshold"] * 1.5:
            p["status"] = "MODERATE"
            p["status_color"] = "YELLOW"
        else:
            p["status"] = "OPTIMAL"
            p["status_color"] = "GREEN"

        products.append(p)
    return products

def get_product_by_id(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    p = dict(row)
    if p.get("aliases"):
        try:
            p["aliases"] = json.loads(p["aliases"])
        except Exception:
            p["aliases"] = []
    return p

def update_product_stock(product_id: int, quantity_change: float, mode: str = "delta"):
    """
    mode: 'delta' (+3 received, -2 sold) or 'absolute' (set exact stock)
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    if mode == "absolute":
        new_stock = max(0.0, float(quantity_change))
    else:
        cursor.execute("SELECT stock FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        current_stock = row["stock"]
        new_stock = max(0.0, float(current_stock + quantity_change))

    cursor.execute("""
        UPDATE products 
        SET stock = ?, last_updated = CURRENT_TIMESTAMP 
        WHERE id = ?
    """, (new_stock, product_id))
    conn.commit()

    conn.close()
    return get_product_by_id(product_id)

def find_product_by_keyword(query: str):
    """
    Fuzzy / match product by name, hindi_name, or alias keyword.
    """
    query_clean = query.lower().strip()
    products = get_all_products()

    # Direct name or alias exact check
    for p in products:
        if query_clean in p["name"].lower():
            return p
        if p.get("hindi_name") and query_clean in p["hindi_name"].lower():
            return p
        aliases = p.get("aliases", [])
        for alias in aliases:
            if alias.lower() in query_clean or query_clean in alias.lower():
                return p

    # Partial keyword matching
    for p in products:
        name_words = p["name"].lower().split()
        for word in name_words:
            if len(word) > 2 and word in query_clean:
                return p
    return None
