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

# Try with shell expansion syntax
print("Updating start command with shell syntax...")
result = api("PATCH", f"/services/{SERVICE_ID}", {
    "serviceDetails": {
        "envSpecificDetails": {
            "startCommand": "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}"
        }
    }
})
details = result.get("serviceDetails", {}).get("envSpecificDetails", {})
print(f"startCommand: {details.get('startCommand','')}")

# Deploy
print("Deploying...")
time.sleep(3)
deploys = api("GET", f"/services/{SERVICE_ID}/deploys?limit=1")
items = deploys if isinstance(deploys, list) else []
latest = items[0].get("deploy", items[0]) if items else {}

# Trigger via POST
deploy_req = urllib.request.Request(
    f"https://api.render.com/v1/services/{SERVICE_ID}/deploys",
    data=json.dumps({}).encode(), headers=HEADERS, method="POST")
try:
    with urllib.request.urlopen(deploy_req) as r:
        body = r.read()
        d = json.loads(body) if body else {}
        if isinstance(d, list): d = d[0] if d else {}
        deploy_id = d.get("deploy", d).get("id", "")
        print(f"Deploy triggered: {deploy_id}")
except Exception as e:
    print(f"Deploy trigger: {e}")
    # Get latest
    deploys2 = api("GET", f"/services/{SERVICE_ID}/deploys?limit=1")
    items2 = deploys2 if isinstance(deploys2, list) else []
    if items2:
        deploy_id = items2[0].get("deploy", items2[0]).get("id", "")
        print(f"Using latest deploy: {deploy_id}")

for i in range(40):
    time.sleep(10)
    r = api("GET", f"/services/{SERVICE_ID}/deploys/{deploy_id}")
    if isinstance(r, list): r = r[0] if r else {}
    status = r.get("deploy", r).get("status", "?")
    print(f"  [{i+1}] {status}")
    if status == "live":
        print(f"\n✅ LIVE: https://dflex-fdya.onrender.com")
        break
    elif "failed" in status or status == "canceled":
        print(f"\n❌ Failed: {status}")
        break
