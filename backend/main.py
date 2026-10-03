from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import os
import sqlite3

from database import init_db, get_db_connection
from inventory import get_all_products, get_product_by_id, update_product_stock, find_product_by_keyword
from demand import get_demand_forecast
from ai_agent import (
    run_kirana_agent_pipeline, tool_simulate_what_if, tool_compare_suppliers,
    tool_get_sales_history, tool_predict_demand
)
from public_api import fetch_public_products
from speech import process_audio_speech

app = FastAPI(
    title="KiranaMitra AI - Open-Source Shopkeeper Assistant API",
    version="2.0.0",
    description="Natural language Hinglish voice & text AI agent for small Indian store inventory and explainable demand prediction."
)

# Enable CORS for Vite frontend local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def startup_event():
    init_db(force_reseed=False)

# --- REQUEST MODELS ---
class CommandRequest(BaseModel):
    command: str

class StockUpdateRequest(BaseModel):
    product_id: int
    quantity_change: float
    mode: Optional[str] = "delta"  # 'delta' or 'absolute'

class PurchaseItemRequest(BaseModel):
    product_id: int
    quantity: float
    unit: Optional[str] = None

class WhatIfRequest(BaseModel):
    product_name: str
    scenario_type: str  # 'price_change' or 'order_quantity'
    value: float

# --- API ENDPOINTS ---

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "app": "KiranaMitra AI",
        "version": "2.0.0",
        "models": ["Srota-Hinglish-ASR", "Qwen3-8B-Tool-Calling"]
    }

# 1. INVENTORY ENDPOINTS
@app.get("/api/inventory")
def get_inventory():
    return get_all_products()

@app.get("/api/inventory/{product_id}")
def get_inventory_item(product_id: int):
    item = get_product_by_id(product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return item

@app.post("/api/inventory/update-stock")
def update_stock_endpoint(req: StockUpdateRequest):
    res = update_product_stock(req.product_id, req.quantity_change, req.mode)
    if not res:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "SUCCESS", "product": res}

# 2. DEMAND & EXPLAINABLE AI ENDPOINTS ("Dukaan Ka Dimaag")
@app.get("/api/demand/recommendations")
def get_recommendations(forecast_days: int = 7):
    return get_demand_forecast(target_days=forecast_days)

@app.get("/api/demand/explain/{product_id}")
def explain_order(product_id: int):
    """
    Feature: 'Why am I buying this?' Explainable AI
    Returns deep breakdown of sales history, trend, lead time, weekend multipliers.
    """
    item = get_product_by_id(product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")

    sales_info = tool_get_sales_history(item["name"])
    demand_info = tool_predict_demand(item["name"], forecast_days=3)

    return {
        "product_id": item["id"],
        "product_name": item["name"],
        "hindi_name": item.get("hindi_name"),
        "unit": item["unit"],
        "current_stock": item["stock"],
        "cost_price": item["cost_price"],
        "selling_price": item["selling_price"],
        "supplier": item["supplier"],
        "explainable_reasoning": {
            "average_daily_sales": sales_info.get("avg_daily_sales"),
            "sales_7d_history": sales_info.get("sales_7d"),
            "sales_trend": sales_info.get("trend"),
            "weekend_demand_bump_pct": demand_info.get("weekend_bump_pct", 28.0),
            "expected_3day_demand": demand_info.get("expected_demand"),
            "supplier_lead_time_days": 2,
            "stockout_risk": demand_info.get("stockout_risk"),
            "days_stock_remaining": demand_info.get("days_remaining"),
            "recommended_order": demand_info.get("recommended_purchase"),
            "ai_formula_explanation": f"Recommended purchase ({demand_info.get('recommended_purchase')} {item['unit']}) = (Average daily sales ({sales_info.get('avg_daily_sales')}) × 3 days × 1.28 weekend factor) - Current Stock ({item['stock']}) + Safety buffer."
        }
    }

@app.post("/api/demand/what-if")
def simulate_what_if_endpoint(req: WhatIfRequest):
    """
    Feature: 'What-if?' Simulator
    Simulates price hike impact or bulk purchase overstock risk.
    """
    return tool_simulate_what_if(req.product_name, req.scenario_type, req.value)

@app.get("/api/demand/suppliers/{product_id}")
def compare_suppliers_endpoint(product_id: int):
    """
    Feature: Smart Supplier Comparison
    """
    item = get_product_by_id(product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return tool_compare_suppliers(item["name"])

@app.get("/api/public/products")
def get_public_products(limit: int = 10):
    """Return a small list of public catalog products from a free public API."""
    return fetch_public_products(limit)

# 3. PURCHASE LIST ENDPOINTS
@app.get("/api/purchase-list")
def get_purchase_list():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM purchase_list ORDER BY urgency DESC, id DESC")
    rows = cursor.fetchall()
    conn.close()
    
    items = [dict(r) for r in rows]
    total_cost = sum(i["estimated_cost"] for i in items)
    return {
        "items": items,
        "total_cost": round(total_cost, 2),
        "item_count": len(items)
    }

@app.post("/api/purchase-list/add")
def add_purchase_item(req: PurchaseItemRequest):
    item = get_product_by_id(req.product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    unit = req.unit or item["unit"]
    est_cost = req.quantity * item["cost_price"]

    cursor.execute("SELECT id, quantity FROM purchase_list WHERE product_id = ?", (item["id"],))
    existing = cursor.fetchone()
    if existing:
        new_qty = existing["quantity"] + req.quantity
        new_cost = new_qty * item["cost_price"]
        cursor.execute("UPDATE purchase_list SET quantity = ?, estimated_cost = ? WHERE id = ?", (new_qty, new_cost, existing["id"]))
    else:
        cursor.execute("""
            INSERT INTO purchase_list (product_id, product_name, quantity, unit, estimated_cost, supplier, urgency, added_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (item["id"], item["name"], req.quantity, unit, est_cost, item["supplier"], "HIGH", "Manual User"))
    
    conn.commit()
    conn.close()
    return {"status": "SUCCESS"}

@app.delete("/api/purchase-list/{item_id}")
def delete_purchase_item(item_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM purchase_list WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"status": "DELETED"}

@app.delete("/api/purchase-list")
def clear_purchase_list():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM purchase_list")
    conn.commit()
    conn.close()
    return {"status": "CLEARED"}

# 4. HINGLISH VOICE & TEXT AI AGENT PIPELINE ("Bolo → Kaam Ho Gaya")
@app.post("/api/agent/command")
def process_agent_command(req: CommandRequest):
    """
    Main open-weight AI agent endpoint. Takes raw Hinglish audio transcription or text command.
    """
    if not req.command.strip():
        raise HTTPException(status_code=400, detail="Command cannot be empty")
    
    result = run_kirana_agent_pipeline(req.command)
    
    # Save log to agent_logs
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO agent_logs (raw_text, intent, extracted_data, ai_response)
            VALUES (?, ?, ?, ?)
        """, (req.command, result.get("intent"), str(result.get("tools_called")), result.get("reply_text_english")))
        conn.commit()
        conn.close()
    except Exception:
        pass

    return result

# 5. DEMO SCENARIO RESET
@app.post("/api/demo/reset")
def reset_demo_database():
    """Resets the shop state to initial hackathon demo scenario."""
    init_db(force_reseed=True)
    return {"status": "SUCCESS", "message": "Shop state reset to initial demo values!"}

# Serve static frontend in production build if folder exists
static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
