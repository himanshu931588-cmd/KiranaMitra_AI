import sqlite3

from database import DB_PATH, init_db


def test_seed_data_adds_all_low_stock_items_to_purchase_list(tmp_path, monkeypatch):
    test_db = tmp_path / "kirana_shop_test.db"
    monkeypatch.setattr("database.DB_PATH", str(test_db))

    init_db(force_reseed=True)

    conn = sqlite3.connect(test_db)
    try:
        count = conn.execute("SELECT COUNT(*) FROM purchase_list").fetchone()[0]
    finally:
        conn.close()

    assert count == 11
