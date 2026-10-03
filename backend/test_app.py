from main import app
from ai_agent import run_kirana_agent_pipeline

print("Backend imports and app loaded OK!")
print("Testing Agent Pipeline with sample prompt...")
res = run_kirana_agent_pipeline("Bhai Maggi ke 20 packet aur 5 kilo chini order mein daal de")
print("Agent Result:")
print(f"Intent: {res['intent']}")
print(f"Hindi Reply: {res['reply_text_hindi']}")
print(f"Tools Called: {[t['tool'] for t in res['tools_called']]}")
