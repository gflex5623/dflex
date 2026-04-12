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
        print(f"Error {e.code}: {e.read().decode()[:200]}")
        return {}

# Trigger deploy
print("Deploying sitemap update...")
deploy_req = urllib.request.Request(
    f"https://api.render.com/v1/services/{SERVICE_ID}/deploys",
    data=json.dumps({}).encode(), headers=HEADERS, method="POST")
try:
    with urllib.request.urlopen(deploy_req) as r:
        body = r.read()
        d = json.loads(body) if body else {}
        if isinstance(d, list): d = d[0] if d else {}
        deploy_id = d.get("deploy", d).get("id", "")
except:
    deploys = api("GET", f"/services/{SERVICE_ID}/deploys?limit=1")
    items = deploys if isinstance(deploys, list) else []
    deploy_id = items[0].get("deploy", items[0]).get("id", "") if items else ""

print(f"Deploy: {deploy_id}")
for i in range(30):
    time.sleep(10)
    r = api("GET", f"/services/{SERVICE_ID}/deploys/{deploy_id}")
    if isinstance(r, list): r = r[0] if r else {}
    status = r.get("deploy", r).get("status", "?")
    print(f"  [{i+1}] {status}")
    if status == "live":
        print("✅ Live!")
        break
    elif "failed" in status:
        print("❌ Failed")
        break
