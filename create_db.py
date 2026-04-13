import urllib.request, urllib.error, json, time

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
OWNER_ID = "tea-d7c7bsvlk1mc7391pjk0"
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
        print(f"{method} error {e.code}: {e.read().decode()[:400]}")
        return {}

# Create free PostgreSQL database
print("Creating free PostgreSQL database...")
result = api("POST", "/postgres", {
    "name": "dflex-db",
    "ownerId": OWNER_ID,
    "plan": "free",
    "region": "oregon",
    "version": "16"
})
print(json.dumps(result, indent=2)[:1000])
