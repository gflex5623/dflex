import urllib.request, urllib.error, json, time

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
SERVICE_ID = "srv-d7c7elv7f7vs739dfokg"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json", "Content-Type": "application/json"}

DB_URL = "postgresql://dflex_db_n34u_user:FDfnGatpYo1yYDLaRmRCFmB3VdraZLVG@dpg-d7e6c9vlk1mc73f5hkk0-a/dflex_db_n34u"

def api(method, path, data=None):
    req = urllib.request.Request(f"https://api.render.com/v1{path}",
          data=json.dumps(data).encode() if data else None,
          headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()[:300]}")
        return {}

# Get existing env vars
print("Getting existing env vars...")
existing = api("GET", f"/services/{SERVICE_ID}/env-vars")
existing_list = existing if isinstance(existing, list) else []
print(f"Found {len(existing_list)} existing vars")

# Build updated list keeping existing vars, adding DATABASE_URL
env_vars = []
for item in existing_list:
    key = item.get("envVar", item).get("key", "")
    if key and key != "DATABASE_URL":
        env_vars.append({"key": key, "value": item.get("envVar", item).get("value", "")})

env_vars.append({"key": "DATABASE_URL", "value": DB_URL})

# Update env vars
print("Setting DATABASE_URL...")
result = api("PUT", f"/services/{SERVICE_ID}/env-vars", env_vars)
print(f"Updated {len(result) if isinstance(result, list) else '?'} env vars")

# Deploy
print("Deploying...")
deploy_req = urllib.request.Request(
    f"https://api.render.com/v1/services/{SERVICE_ID}/deploys",
    data=json.dumps({}).encode(), headers=HEADERS, method="POST")
try:
    with urllib.request.urlopen(deploy_req) as r:
        body = r.read()
        d = json.loads(body) if body else {}
        if isinstance(d, list): d = d[0] if d else {}
        deploy_id = d.get("deploy", d).get("id", "")
except Exception as e:
    deploy_id = ""
    print(f"Deploy trigger: {e}")

if not deploy_id:
    deploys = api("GET", f"/services/{SERVICE_ID}/deploys?limit=1")
    items = deploys if isinstance(deploys, list) else []
    deploy_id = items[0].get("deploy", items[0]).get("id", "") if items else ""

print(f"Deploy: {deploy_id}")
for i in range(40):
    time.sleep(10)
    r = api("GET", f"/services/{SERVICE_ID}/deploys/{deploy_id}")
    if isinstance(r, list): r = r[0] if r else {}
    status = r.get("deploy", r).get("status", "?")
    print(f"  [{i+1}] {status}")
    if status == "live":
        print(f"\n✅ LIVE with PostgreSQL: https://dflex-fdya.onrender.com")
        break
    elif "failed" in status:
        print(f"\n❌ Failed: {status}")
        break
