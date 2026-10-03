import pandas as pd
import math
from database import get_db_connection
from inventory import get_all_products

def get_demand_forecast(target_days: int = 7):
    """
    Computes 7-day average daily sales, stock depletion runway, and recommended reorder quantities.
    """
    conn = get_db_connection()
    df_products = pd.read_sql_query("SELECT * FROM products", conn)
    df_sales = pd.read_sql_query("SELECT * FROM sales_history", conn)
    conn.close()

    if df_products.empty or df_sales.empty:
        return []

    # Merge products with 7-day sales records
    merged = pd.merge(df_products, df_sales, left_on="id", right_on="product_id")

    recommendations = []

    for _, row in merged.iterrows():
        product_id = row["id_x"] if "id_x" in row else row["id"]
        name = row["name"]
        hindi_name = row.get("hindi_name", "")
        unit = row["unit"]
        current_stock = float(row["stock"])
        min_threshold = float(row["min_threshold"])
        cost_price = float(row["cost_price"])
        supplier = row["supplier"]

        # 7-day sales columns
        sales_7d = [
            float(row.get("day_1", 0)),
            float(row.get("day_2", 0)),
            float(row.get("day_3", 0)),
            float(row.get("day_4", 0)),
            float(row.get("day_5", 0)),
            float(row.get("day_6", 0)),
            float(row.get("day_7", 0)),
        ]

        avg_daily_sales = sum(sales_7d) / 7.0
        if avg_daily_sales <= 0:
            avg_daily_sales = 0.5  # default minimum baseline

        days_remaining = current_stock / avg_daily_sales if avg_daily_sales > 0 else 99.0
        
        # Calculate requirement
        # Target Days requirement + 20% safety stock
        raw_requirement = (avg_daily_sales * target_days * 1.2) - current_stock
        recommended_order = max(0.0, math.ceil(raw_requirement))

        # Check urgency status
        if current_stock <= min_threshold or days_remaining <= 3.0:
            urgency = "HIGH"
            urgency_icon = "🔴"
        elif days_remaining <= 5.0:
            urgency = "MEDIUM"
            urgency_icon = "🟡"
        else:
            urgency = "LOW"
            urgency_icon = "🟢"

        # Generate Human AI Explanation
        if days_remaining < 1.0:
            runway_str = "less than a day"
        else:
            runway_str = f"approx {round(days_remaining, 1)} days"

        ai_explanation = (
            f"You currently have {current_stock:g} {unit} of {name}. "
            f"Based on 7-day sales memory ({avg_daily_sales:.1f} {unit}/day), "
            f"your stock will last for {runway_str}. "
            f"We suggest reordering {recommended_order:g} {unit}."
        )

        recommendations.append({
            "product_id": product_id,
            "product_name": name,
            "hindi_name": hindi_name,
            "category": row["category"],
            "unit": unit,
            "current_stock": current_stock,
            "min_threshold": min_threshold,
            "avg_daily_sales": round(avg_daily_sales, 2),
            "days_remaining": round(days_remaining, 1),
            "recommended_order": float(recommended_order),
            "estimated_cost": float(round(recommended_order * cost_price, 2)),
            "cost_price": cost_price,
            "supplier": supplier,
            "urgency": urgency,
            "urgency_icon": urgency_icon,
            "ai_explanation": ai_explanation,
            "sales_7d": sales_7d
        })

    # Sort by urgency HIGH first, then days remaining
    recommendations.sort(key=lambda x: (0 if x["urgency"] == "HIGH" else (1 if x["urgency"] == "MEDIUM" else 2), x["days_remaining"]))
    return recommendations
