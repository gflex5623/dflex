import urllib.request, urllib.error, json

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
SERVICE_ID = "srv-d7c7elv7f7vs739dfokg"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json", "Content-Type": "application/json"}

def api(method, path, data=None):
    req = urllib.request.Request(f"https://api.render.com/v1{path}",
          data=json.dumps(data).encode() if data else None,
          headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()[:200]}")
        return {}

# Get existing env vars
existing = api("GET", f"/services/{SERVICE_ID}/env-vars")
existing_list = existing if isinstance(existing, list) else []

# Build updated list
env_vars = []
for item in existing_list:
    ev = item.get("envVar", item)
    key = ev.get("key", "")
    if key and key not in ("PAYSTACK_SECRET_KEY", "PAYSTACK_PUBLIC_KEY", "APP_URL"):
        env_vars.append({"key": key, "value": ev.get("value", "")})

# Add Paystack keys
env_vars.append({"key": "PAYSTACK_SECRET_KEY", "value": "sk_test_b8e6df421464efb419b99c53509c4f51cd8e95b9"})
env_vars.append({"key": "PAYSTACK_PUBLIC_KEY", "value": "pk_test_9df68d4c4b89e5b3eaf97171f096c2152407e421"})
env_vars.append({"key": "APP_URL", "value": "https://dflex-fdya.onrender.com"})

result = api("PUT", f"/services/{SERVICE_ID}/env-vars", env_vars)
print(f"Updated {len(result) if isinstance(result, list) else '?'} env vars")
print("Paystack keys set successfully!")
