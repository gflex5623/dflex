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

# Trigger deploy
print("Deploying...")
deploy = api("POST", f"/services/{SERVICE_ID}/deploys", {"clearCache": "clear"})
d = deploy.get("deploy", deploy)
deploy_id = d.get("id", "")
if not deploy_id:
    deploys = api("GET", f"/services/{SERVICE_ID}/deploys?limit=1")
    items = deploys if isinstance(deploys, list) else []
    if items:
        d = items[0].get("deploy", items[0])
        deploy_id = d.get("id")
print(f"Deploy: {deploy_id} | {d.get('status','?')}")

for i in range(30):
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
