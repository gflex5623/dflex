import urllib.request, json

BASE = "https://dflex-fdya.onrender.com"

def post(path, data):
    req = urllib.request.Request(f"{BASE}{path}",
          data=json.dumps(data).encode(),
          headers={"Content-Type": "application/json"}, method="POST")
    try:
        r = urllib.request.urlopen(req)
        return json.loads(r.read()), r.status
    except urllib.request.HTTPError as e:
        return json.loads(e.read()), e.code

# Test login with existing accounts
test_users = [
    ("kiro.developer@dflex.com", "kiro2024"),
    ("james.obi@dflex.com", "james2024"),
    ("fatima.bello@dflex.com", "fatima2024"),
    ("sarah.okafor@dflex.com", "sarah2024"),
]

print("Testing login for existing users...")
for email, password in test_users:
    resp, status = post("/api/auth/login", {"email": email, "password": password})
    if status == 200:
        print(f"  ✅ {email} — login OK")
    else:
        print(f"  ❌ {email} — {resp.get('detail', status)}")
