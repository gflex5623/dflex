import urllib.request, urllib.error, json

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
SERVICE_ID = "srv-d7c7elv7f7vs739dfokg"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

def api(path):
    req = urllib.request.Request(f"https://api.render.com/v1{path}", headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()[:500]}")
        return {}

# Get all recent deploys
deploys = api(f"/services/{SERVICE_ID}/deploys?limit=10")
print("Recent deploys:")
for item in (deploys if isinstance(deploys, list) else []):
    d = item.get("deploy", item)
    print(f"  {d.get('id')} | {d.get('status')} | commit: {d.get('commit',{}).get('message','')[:50]}")
