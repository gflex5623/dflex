import urllib.request, urllib.error, json

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
SERVICE_ID = "srv-d7c7elv7f7vs739dfokg"
DEPLOY_ID = "dep-d7crmkolgd3c73dg9140"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

def api(path):
    req = urllib.request.Request(f"https://api.render.com/v1{path}", headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()[:300]}")
        return {}

# Get deploy details
print("=== Deploy details ===")
r = api(f"/services/{SERVICE_ID}/deploys/{DEPLOY_ID}")
print(json.dumps(r, indent=2))
