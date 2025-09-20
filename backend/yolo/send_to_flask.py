# send_to_flask.py
import json
import requests
import os

with open("payload.txt", "r", encoding="utf-8") as f:
    data_url = f.read()

url = os.getenv("ENDPOINT", "http://127.0.0.1:3333/detect")
body = {
    "data_url": data_url,
    "conf": 0.25,
}

r = requests.post(url, json=body, timeout=120)
ctype = r.headers.get("content-type", "")
print(f"HTTP {r.status_code}  Content-Type: {ctype}")

try:
    print(json.dumps(r.json(), indent=2))
except Exception:
    # Fall back to raw text so you can see Flask’s HTML error page or whatever it returned
    print(r.text[:4000])
    r.raise_for_status()
