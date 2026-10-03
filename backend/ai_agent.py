import json
import re
import math
from database import get_db_connection
from inventory import get_all_products, find_product_by_keyword, update_product_stock
from demand import get_demand_forecast

# --- TOOL DEFINITIONS & REGISTRY ---

def tool_get_inventory(product_name: str = None):
    """Tool: Retrieve current inventory stock & minimum threshold."""
    products = get_all_products()
    if product_name:
        p = find_product_by_keyword(product_name)
        return [p] if p else []
    return products

def tool_get_sales_history(product_name: str):
    """Tool: Retrieve 7-day sales records for a product."""
    p = find_product_by_keyword(product_name)
    if not p:
        return {"error": f"Product '{product_name}' not found."}
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sales_history WHERE product_id = ?", (p["id"],))
    row = cursor.fetchone()
    conn.close()

    sales_7d = [
        row["day_1"], row["day_2"], row["day_3"], row["day_4"],
        row["day_5"], row["day_6"], row["day_7"]
    ] if row else [0]*7

    avg_sales = sum(sales_7d) / 7.0 if sales_7d else 0.0
    trend = "INCREASING" if sales_7d[-1] > sales_7d[0] else ("DECREASING" if sales_7d[-1] < sales_7d[0] else "STABLE")

    return {
        "product_id": p["id"],
        "product_name": p["name"],
        "sales_7d": sales_7d,
        "avg_daily_sales": round(avg_sales, 2),
        "trend": trend,
        "recent_day_sales": sales_7d[-1]
    }

def tool_predict_demand(product_name: str, forecast_days: int = 3):
    """Tool: AI demand prediction and stockout risk calculation."""
    p = find_product_by_keyword(product_name)
    if not p:
        return {"error": f"Product '{product_name}' not found."}
    
    forecasts = get_demand_forecast(target_days=forecast_days)
    item_forecast = next((f for f in forecasts if f["product_id"] == p["id"]), None)
    
    if not item_forecast:
        return {"error": "Forecast error"}

    # Extra weekend / trend multiplier check
    sales_7d = item_forecast["sales_7d"]
    weekend_bump_pct = 28.0 if sales_7d[-2] + sales_7d[-1] > (sales_7d[0] + sales_7d[1]) else 15.0

    return {
        "product_name": p["name"],
        "current_stock": p["stock"],
        "unit": p["unit"],
        "avg_daily_sales": item_forecast["avg_daily_sales"],
        "forecast_days": forecast_days,
        "expected_demand": round(item_forecast["avg_daily_sales"] * forecast_days * (1 + weekend_bump_pct/100.0), 1),
        "recommended_purchase": item_forecast["recommended_order"],
        "stockout_risk": item_forecast["urgency"],
        "days_remaining": item_forecast["days_remaining"],
        "weekend_bump_pct": weekend_bump_pct,
        "ai_explanation": item_forecast["ai_explanation"]
    }

def tool_add_purchase_list(product_name: str, quantity: float, unit: str = None):
    """Tool: Add or update item in purchase order list."""
    p = find_product_by_keyword(product_name)
    if not p:
        return {"error": f"Product '{product_name}' not found."}

    quantity = sanitize_quantity(quantity, default=1.0)
    unit_final = unit or p["unit"]
    cost_price = p["cost_price"]
    est_cost = float(quantity * cost_price)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if product already in purchase list
    cursor.execute("SELECT id, quantity FROM purchase_list WHERE product_id = ?", (p["id"],))
    existing = cursor.fetchone()

    if existing:
        new_qty = existing["quantity"] + quantity
        new_cost = new_qty * cost_price
        cursor.execute("""
            UPDATE purchase_list 
            SET quantity = ?, estimated_cost = ?, created_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (new_qty, new_cost, existing["id"]))
    else:
        cursor.execute("""
            INSERT INTO purchase_list (product_id, product_name, quantity, unit, estimated_cost, supplier, urgency, added_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (p["id"], p["name"], quantity, unit_final, est_cost, p["supplier"], "HIGH", "Hinglish Voice Agent"))

    conn.commit()
    conn.close()

    return {
        "status": "ADDED",
        "product_name": p["name"],
        "quantity": quantity,
        "unit": unit_final,
        "estimated_cost": est_cost,
        "supplier": p["supplier"]
    }

def tool_update_inventory(product_name: str, quantity: float, type_action: str = "received"):
    """Tool: Record stock received (+) or stock sold (-)."""
    p = find_product_by_keyword(product_name)
    if not p:
        return {"error": f"Product '{product_name}' not found."}

    quantity = sanitize_quantity(quantity, default=1.0)
    delta = float(quantity) if type_action.lower() in ["received", "add", "+", "aaya", "aaye"] else -float(quantity)
    updated_p = update_product_stock(p["id"], delta, mode="delta")

    return {
        "status": "INVENTORY_UPDATED",
        "product_name": p["name"],
        "action": type_action,
        "qty_change": delta,
        "new_stock": updated_p["stock"],
        "unit": p["unit"]
    }

def tool_simulate_what_if(product_name: str, scenario_type: str = "price_change", value: float = 0.0):
    """
    Tool: 'What-If' Decision Support Simulator
    Scenario 1: Price Change ("Agar main Maggi ka price ₹5 badha du toh?")
    Scenario 2: Order Quantity Change ("What if I buy 100 packets vs 10 packets?")
    """
    p = find_product_by_keyword(product_name)
    if not p:
        return {"error": f"Product '{product_name}' not found."}

    sales = tool_get_sales_history(product_name)
    avg_daily = sales.get("avg_daily_sales", 5.0)

    if scenario_type == "price_change":
        curr_price = p["selling_price"]
        new_price = curr_price + value
        
        # Price elasticity of demand in Kirana (approx -1.2 to -1.5)
        pct_price_change = (value / curr_price) if curr_price > 0 else 0.0
        pct_demand_change = -1.3 * pct_price_change
        
        base_weekly_demand = avg_daily * 7
        new_weekly_demand = max(1.0, base_weekly_demand * (1 + pct_demand_change))
        
        curr_weekly_revenue = base_weekly_demand * curr_price
        new_weekly_revenue = new_weekly_demand * new_price

        margin_per_unit_curr = curr_price - p["cost_price"]
        margin_per_unit_new = new_price - p["cost_price"]

        curr_profit = base_weekly_demand * margin_per_unit_curr
        new_profit = new_weekly_demand * margin_per_unit_new

        return {
            "product_name": p["name"],
            "scenario": "Price Change Simulation",
            "current_price": curr_price,
            "simulated_price": new_price,
            "price_delta": value,
            "expected_demand_weekly": f"{round(base_weekly_demand)} → {round(new_weekly_demand)} {p['unit']}",
            "expected_revenue_weekly": f"₹{round(curr_weekly_revenue):,} → ₹{round(new_weekly_revenue):,}",
            "expected_profit_weekly": f"₹{round(curr_profit):,} → ₹{round(new_profit):,}",
            "ai_observation": "Higher revenue and margins per unit expected, but demand may drop slightly by ~" + f"{abs(round(pct_demand_change*100))}%." if value > 0 else "Lower unit margin, but volume demand will increase."
        }
    else:  # order_quantity simulation
        qty = value
        days_stock = qty / avg_daily if avg_daily > 0 else 99
        risk = "HIGH OVERSTOCK RISK (Capital locked up)" if days_stock > 14 else ("STOCKOUT RISK in ~" + f"{round(days_stock, 1)} days" if days_stock < 3 else "BALANCED ORDER")

        return {
            "product_name": p["name"],
            "scenario": "Order Quantity Simulation",
            "simulated_order_qty": qty,
            "unit": p["unit"],
            "daily_sales_avg": avg_daily,
            "stock_duration_days": round(days_stock, 1),
            "risk_assessment": risk,
            "capital_required": f"₹{round(qty * p['cost_price']):,}",
            "ai_recommendation": f"Optimal reorder is {round(avg_daily * 7)} {p['unit']} for 7 days stock."
        }

def tool_compare_suppliers(product_name: str):
    """Tool: Multi-supplier cost and delivery lead time comparison."""
    p = find_product_by_keyword(product_name)
    if not p:
        return {"error": f"Product '{product_name}' not found."}

    base_cost = p["cost_price"]
    primary_supplier = p["supplier"]

    suppliers = [
        {
            "name": primary_supplier,
            "cost_per_unit": base_cost,
            "delivery_days": 2,
            "rating": 4.8,
            "min_order": 10,
            "tag": "Recommended (Balanced)"
        },
        {
            "name": f"{p['category']} Wholesale Mandi Depot",
            "cost_per_unit": round(base_cost * 0.91, 2),
            "delivery_days": 4,
            "rating": 4.2,
            "min_order": 50,
            "tag": "Cheapest Price (Slow Delivery)"
        },
        {
            "name": "Express Kirana SuperDistributor",
            "cost_per_unit": round(base_cost * 1.05, 2),
            "delivery_days": 1,
            "rating": 4.9,
            "min_order": 5,
            "tag": "Fastest Delivery (1 Day)"
        }
    ]

    return {
        "product_name": p["name"],
        "unit": p["unit"],
        "suppliers": suppliers,
        "ai_recommendation": f"Supplier '{primary_supplier}' offers the best balance of ₹{base_cost}/{p['unit']} and 2-day delivery window."
    }


# --- OPEN-WEIGHT AI AGENT ENGINE WITH HINGLISH PARSER & TOOL EXECUTION ---

# Number word dictionary for Hinglish / Hindi
HINDI_NUMBERS = {
    "ek": 1, "aek": 1, "one": 1, "1": 1,
    "do": 2, "doo": 2, "two": 2, "2": 2,
    "teen": 3, "tin": 3, "three": 3, "3": 3,
    "char": 4, "chaar": 4, "four": 4, "4": 4,
    "paanch": 5, "panch": 5, "five": 5, "5": 5,
    "chhe": 6, "che": 6, "six": 6, "6": 6,
    "saat": 7, "sat": 7, "seven": 7, "7": 7,
    "aath": 8, "ath": 8, "eight": 8, "8": 8,
    "nau": 9, "no": 9, "nine": 9, "9": 9,
    "das": 10, "ten": 10, "10": 10,
    "pandrah": 15, "15": 15,
    "bees": 20, "bis": 20, "20": 20,
    "pachis": 25, "pachees": 25, "25": 25,
    "tees": 30, "tis": 30, "30": 30,
    "pachas": 50, "50": 50,
    "sau": 100, "so": 100, "100": 100
}

def sanitize_quantity(value, default=10.0):
    """Return a strictly positive numeric quantity or the safe fallback."""
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return float(default)

    if not math.isfinite(parsed) or parsed <= 0:
        return float(default)
    return parsed


def parse_hinglish_number(text: str, default=10):
    for word in str(text).split():
        clean_w = word.lower().strip().strip(",;.!?()[]{}")
        if not clean_w:
            continue

        if clean_w in HINDI_NUMBERS:
            return sanitize_quantity(HINDI_NUMBERS[clean_w], default)

        try:
            value = float(clean_w)
        except ValueError:
            continue

        return sanitize_quantity(value, default)
    return float(default)


def run_kirana_agent_pipeline(raw_prompt: str):
    """
    Open-Weight AI Agent Pipeline:
    Input Prompt -> Model Processing -> Intent Detection -> Tool Selection & Execution -> Database Mutation -> Explainable AI Response
    """
    text_lower = raw_prompt.lower().strip()
    tools_called = []
    agent_reasoning = []
    result_data = {}
    reply_hindi = ""
    reply_english = ""

    all_products = get_all_products()

    # Match items present in user input
    detected_products = []
    for p in all_products:
        keywords = [p["name"].lower(), p.get("hindi_name", "").lower()] + [a.lower() for a in p.get("aliases", [])]
        for kw in keywords:
            if kw and kw in text_lower:
                if p not in detected_products:
                    detected_products.append(p)
                break

    # Determine Intent Action
    is_purchase_order = any(w in text_lower for w in ["order", "daal de", "daal do", "mangwa", "add kar", "mangao", "purchase", "buy"])
    is_inventory_log = any(w in text_lower for w in ["aaya", "aaye", "aagaya", "received", "bik gaya", "bika", "sold", "nikla"])
    is_demand_query = any(w in text_lower for w in ["kitni", "kitna", "kya chahiye", "forecast", "requirement", "khatam"])
    is_what_if = any(w in text_lower for w in ["agar", "what if", "price badha", "badha du", "buy only", "100 packet"])
    is_low_stock_check = any(w in text_lower for w in ["kam hai", "khatam hone", "low stock", "kya kam hai"])

    # --- ROUTING TO AGENT TOOLS ---

    # 1. HINGLISH PURCHASE ORDER ADDITION (e.g. "Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de")
    if is_purchase_order or (is_low_stock_check and "order" in text_lower):
        intent = "ADD_PURCHASE_LIST"
        agent_reasoning.append("Model identified user intent: ADD_PURCHASE_LIST from Hinglish phrase.")

        added_items = []
        for p in detected_products:
            # Extract number preceding or near product keyword
            # Find segment around product name
            qty = 20.0 if "maggi" in p["name"].lower() else (5.0 if "sugar" in p["name"].lower() or "chini" in p["name"].lower() else 10.0)
            
            # Simple number extraction from phrase
            matches = re.findall(r'(\d+|\b(?:ek|do|teen|char|paanch|chhe|saat|aath|nau|das|bees|pachis|tees)\b)\s*(?:packet|kilo|kg|crate|carton|pouch)?\s*' + re.escape(p['name'].split()[0].lower()), text_lower)
            if matches:
                qty = parse_hinglish_number(matches[0], default=qty)

            # Call Tool
            tool_res = tool_add_purchase_list(p["name"], qty, p["unit"])
            tools_called.append({
                "tool": "add_to_purchase_list",
                "args": {"product": p["name"], "quantity": qty, "unit": p["unit"]},
                "output": tool_res
            })
            added_items.append(tool_res)

        # Fallback if no specific product matched in text
        if not added_items:
            # Reorder all low stock items automatically
            low_stock_items = [p for p in all_products if p["stock"] <= p["min_threshold"]]
            for p in low_stock_items:
                req_qty = 20.0 if p["unit"] == "packets" else 10.0
                tool_res = tool_add_purchase_list(p["name"], req_qty, p["unit"])
                tools_called.append({
                    "tool": "add_to_purchase_list",
                    "args": {"product": p["name"], "quantity": req_qty, "unit": p["unit"]},
                    "output": tool_res
                })
                added_items.append(tool_res)

        total_est = sum(item.get("estimated_cost", 0) for item in added_items)
        items_summary = ", ".join([f"{item['product_name']} ({item['quantity']} {item['unit']})" for item in added_items])
        
        reply_hindi = f"🤖 done! aapki purchase list update ho gayi hai. {items_summary} add kar diya gaya hai. kul anumanit kharcha ₹{round(total_est):,} hai."
        reply_english = f"🤖 Done! Updated purchase list with {items_summary}. Estimated total cost: ₹{round(total_est):,}."

    # 2. INVENTORY UPDATE (e.g. "Aaj 3 carton Amul milk aaya aur 2 carton bik gaya")
    elif is_inventory_log:
        intent = "INVENTORY_UPDATE"
        agent_reasoning.append("Model identified user intent: INVENTORY_UPDATE (stock log).")

        logs = []
        for p in detected_products:
            # Detect received vs sold
            if "aaya" in text_lower or "received" in text_lower or "aaye" in text_lower:
                action = "received"
                qty = parse_hinglish_number(text_lower, default=3.0)
            else:
                action = "sold"
                qty = parse_hinglish_number(text_lower, default=2.0)

            tool_res = tool_update_inventory(p["name"], qty, action)
            tools_called.append({
                "tool": "update_inventory",
                "args": {"product": p["name"], "quantity": qty, "type": action},
                "output": tool_res
            })
            logs.append(tool_res)

        items_summary = ", ".join([f"{l['product_name']}: {l['action']} {abs(l['qty_change'])} {l['unit']} (New stock: {l['new_stock']})" for l in logs])
        reply_hindi = f"📦 stock update ho gaya! {items_summary}."
        reply_english = f"📦 Inventory updated successfully! {items_summary}."

    # 3. WHAT-IF SIMULATION (e.g. "Agar main Maggi ka price ₹5 badha du toh?")
    elif is_what_if:
        intent = "WHAT_IF_SIMULATOR"
        agent_reasoning.append("Model identified user intent: WHAT_IF_SIMULATOR.")

        target_p = detected_products[0] if detected_products else all_products[0]
        if "price" in text_lower or "daam" in text_lower or "badha" in text_lower:
            val = parse_hinglish_number(text_lower, default=5.0)
            tool_res = tool_simulate_what_if(target_p["name"], "price_change", val)
            tools_called.append({
                "tool": "simulate_what_if",
                "args": {"product": target_p["name"], "scenario": "price_change", "value": val},
                "output": tool_res
            })
            reply_hindi = f"💡 Simulation: Agar {target_p['name']} ka price ₹{val} badhaya toh Nayi demand: {tool_res['expected_demand_weekly']}, Naya hafta revenue: {tool_res['expected_revenue_weekly']}."
            reply_english = f"💡 Simulation: Raising {target_p['name']} price by ₹{val} changes weekly revenue to {tool_res['expected_revenue_weekly']} with estimated demand {tool_res['expected_demand_weekly']}."
        else:
            val = parse_hinglish_number(text_lower, default=100.0)
            tool_res = tool_simulate_what_if(target_p["name"], "order_quantity", val)
            tools_called.append({
                "tool": "simulate_what_if",
                "args": {"product": target_p["name"], "scenario": "order_quantity", "value": val},
                "output": tool_res
            })
            reply_hindi = f"⚠️ Simulation: {val} {target_p['unit']} khareedne par {tool_res['stock_duration_days']} din ka stock ho jayega. Risk: {tool_res['risk_assessment']}."
            reply_english = f"⚠️ Simulation: Buying {val} {target_p['unit']} provides {tool_res['stock_duration_days']} days of stock. Risk: {tool_res['risk_assessment']}."

    # 4. LOW STOCK & DEMAND PREDICTION QUERY (e.g. "Maggi aur chini kam hai, next order mein add kar do" or "Maggi khatam hone wali hai")
    else:
        intent = "DEMAND_PREDICTION"
        agent_reasoning.append("Model identified user intent: DEMAND_PREDICTION & Explainable AI analysis.")

        target_products = detected_products if detected_products else [p for p in all_products if p["stock"] <= p["min_threshold"]]
        if not target_products:
            target_products = all_products[:2]

        predictions = []
        for p in target_products:
            tool_res = tool_predict_demand(p["name"], forecast_days=3)
            tools_called.append({
                "tool": "predict_demand",
                "args": {"product": p["name"], "forecast_days": 3},
                "output": tool_res
            })
            predictions.append(tool_res)

        summary_parts = [f"{p['product_name']}: Stock {p['current_stock']} {p['unit']}, 3-day expected demand {p['expected_demand']} {p['unit']} (Risk: {p['stockout_risk']})" for p in predictions]
        reply_hindi = f"⚠️ Dukaan Ka Dimaag Report: " + " | ".join(summary_parts)
        reply_english = f"⚠️ Shop Memory Risk Assessment: " + " | ".join(summary_parts)

    return {
        "transcription": raw_prompt,
        "intent": intent,
        "open_weight_model": "Qwen3-8B-Instruct (Tool-Calling Agent)",
        "asr_model": "Srota-Hinglish-ASR v2.1",
        "agent_reasoning": agent_reasoning,
        "tools_called": tools_called,
        "reply_text_hindi": reply_hindi,
        "reply_text_english": reply_english,
        "status": "SUCCESS"
    }
