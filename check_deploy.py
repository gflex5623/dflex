import urllib.request, json

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
SERVICE_ID = "srv-d7c7elv7f7vs739dfokg"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

# Get latest deploy
req = urllib.request.Request(f"https://api.render.com/v1/services/{SERVICE_ID}/deploys?limit=3", headers=HEADERS)
with urllib.request.urlopen(req) as r:
    deploys = json.loads(r.read())

for item in (deploys if isinstance(deploys, list) else []):
    d = item.get("deploy", item)
    print(f"{d.get('id')} | {d.get('status')} | {d.get('commit',{}).get('message','')[:50]}")
