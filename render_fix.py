import urllib.request, urllib.error, json, time

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
        print(f"{method} error {e.code}: {e.read().decode()[:300]}")
        return {}

# Update build command to include npm build
print("Updating build command...")
result = api("PATCH", f"/services/{SERVICE_ID}", {
    "serviceDetails": {
        "envSpecificDetails": {
            "buildCommand": "pip install -r requirements.txt && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs && npm --prefix client install && npm --prefix client run build",
            "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT"
        }
    }
})
print("Done")

# Deploy
print("Deploying...")
deploy = api("POST", f"/services/{SERVICE_ID}/deploys", {})
d = deploy.get("deploy", deploy)
deploy_id = d.get("id", "")
print(f"Deploy: {deploy_id} | {d.get('status','?')}")

for i in range(40):
    time.sleep(10)
    r = api("GET", f"/services/{SERVICE_ID}/deploys/{deploy_id}")
    status = r.get("deploy", r).get("status", "?")
    print(f"  [{i+1}] {status}")
    if status == "live":
        print(f"\n✅ LIVE: https://dflex-fdya.onrender.com")
        break
    elif "failed" in status or status == "canceled":
        print(f"\n❌ Failed: {status}")
        break
