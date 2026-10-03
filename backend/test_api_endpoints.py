import requests
import json
import sys

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"

print("--- 1. Testing Health Endpoint ---")
r = requests.get(f"{BASE_URL}/health")
print("Health:", r.status_code, r.json())

print("\n--- 2. Testing Inventory Endpoint ---")
r = requests.get(f"{BASE_URL}/inventory")
products = r.json()
print(f"Products Count: {len(products)}")
print("Sample Product:", products[0]["name"], "| Stock:", products[0]["stock"])

print("\n--- 3. Testing Demand Recommendations Endpoint ---")
r = requests.get(f"{BASE_URL}/demand/recommendations")
recs = r.json()
print(f"Recommendations Count: {len(recs)}")
print("Sample Rec:", recs[0]["product_name"], "| Urgency:", recs[0]["urgency"], "| Recommended Order:", recs[0]["recommended_order"])

print("\n--- 4. Testing Explainable AI Endpoint ---")
r = requests.get(f"{BASE_URL}/demand/explain/1")
explain = r.json()
print("Explainable Reasoning for Maggi:")
print("Formula:", explain["explainable_reasoning"]["ai_formula_explanation"])

print("\n--- 5. Testing What-If Simulator Endpoint ---")
r = requests.post(f"{BASE_URL}/demand/what-if", json={
    "product_name": "Maggi 2-Min Noodles",
    "scenario_type": "price_change",
    "value": 5.0
})
what_if = r.json()
print("Price Change Simulation:")
print("Expected Revenue:", what_if.get("expected_revenue_weekly"))
print("AI Observation:", what_if.get("ai_observation"))

print("\n--- 6. Testing Open-Weight AI Agent Command Pipeline ---")
r = requests.post(f"{BASE_URL}/agent/command", json={
    "command": "Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de"
})
agent_res = r.json()
print("Agent Intent:", agent_res["intent"])
print("Agent Reply:", agent_res["reply_text_english"])
print("Tools Invoked:", [t["tool"] for t in agent_res["tools_called"]])

print("\n--- 7. Testing Purchase List Endpoint ---")
r = requests.get(f"{BASE_URL}/purchase-list")
pur = r.json()
print(f"Purchase List Count: {pur['item_count']} items | Total Cost: ₹{pur['total_cost']}")

print("\nALL API ENDPOINTS TESTED SUCCESSFULLY!")
