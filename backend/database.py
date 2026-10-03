import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "kirana_shop.db")
JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "shop.json"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(force_reseed=False):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shop_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        owner TEXT,
        location TEXT,
        currency TEXT,
        currency_symbol TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        hindi_name TEXT,
        aliases TEXT,
        category TEXT,
        unit TEXT,
        stock REAL NOT NULL DEFAULT 0,
        min_threshold REAL NOT NULL DEFAULT 5,
        cost_price REAL DEFAULT 0,
        selling_price REAL DEFAULT 0,
        supplier TEXT,
        shelf_life_days INTEGER DEFAULT 180,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        day_1 REAL DEFAULT 0,
        day_2 REAL DEFAULT 0,
        day_3 REAL DEFAULT 0,
        day_4 REAL DEFAULT 0,
        day_5 REAL DEFAULT 0,
        day_6 REAL DEFAULT 0,
        day_7 REAL DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS purchase_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        estimated_cost REAL DEFAULT 0,
        supplier TEXT,
        urgency TEXT DEFAULT 'HIGH',
        added_by TEXT DEFAULT 'AI Agent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS agent_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        raw_text TEXT NOT NULL,
        intent TEXT,
        extracted_data TEXT,
        ai_response TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Check if database needs seeding
    cursor.execute("SELECT COUNT(*) as count FROM products")
    count = cursor.fetchone()["count"]

    if count == 0 or force_reseed:
        seed_data(conn)
    
    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products")
    cursor.execute("DELETE FROM sales_history")
    cursor.execute("DELETE FROM purchase_list")
    cursor.execute("DELETE FROM shop_info")
    cursor.execute("DELETE FROM agent_logs")

    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Seed shop info
        shop = data.get("shop_info", {})
        cursor.execute(
            "INSERT INTO shop_info (name, owner, location, currency, currency_symbol) VALUES (?, ?, ?, ?, ?)",
            (shop.get("name"), shop.get("owner"), shop.get("location"), shop.get("currency"), shop.get("currency_symbol"))
        )

        # Seed products
        for p in data.get("products", []):
            aliases_str = json.dumps(p.get("aliases", []))
            cursor.execute("""
                INSERT INTO products (id, name, hindi_name, aliases, category, unit, stock, min_threshold, cost_price, selling_price, supplier, shelf_life_days)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["name"], p.get("hindi_name", ""), aliases_str, p.get("category", "General"),
                p.get("unit", "units"), p.get("stock", 0), p.get("min_threshold", 5),
                p.get("cost_price", 0.0), p.get("selling_price", 0.0), p.get("supplier", "Local Wholesale"),
                p.get("shelf_life_days", 180)
            ))

        # Seed sales history
        for s in data.get("sales_history_7_days", []):
            cursor.execute("""
                INSERT INTO sales_history (product_id, day_1, day_2, day_3, day_4, day_5, day_6, day_7)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["product_id"], s["day_1"], s["day_2"], s["day_3"], s["day_4"], s["day_5"], s["day_6"], s["day_7"]
            ))

        # Seed initial purchase list from low stock items
        cursor.execute("SELECT * FROM products WHERE stock <= min_threshold")
        low_stock_products = cursor.fetchall()
        for p in low_stock_products:
            # Add initial sample items to purchase list
            if p["name"] in ["Maggi 2-Min Noodles", "Sugar (Chini)"]:
                rec_qty = 30.0 if p["unit"] == "packets" else 10.0
                est_cost = rec_qty * p["cost_price"]
                cursor.execute("""
                    INSERT INTO purchase_list (product_id, product_name, quantity, unit, estimated_cost, supplier, urgency, added_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (p["id"], p["name"], rec_qty, p["unit"], est_cost, p["supplier"], "HIGH", "AI Demand Engine"))

        conn.commit()

if __name__ == "__main__":
    init_db(force_reseed=True)
    print("Database initialized successfully.")
