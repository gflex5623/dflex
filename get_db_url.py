import urllib.request, urllib.error, json, time

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
DB_ID = "dpg-d7e6c9vlk1mc73f5hkk0-a"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

def api(path):
    req = urllib.request.Request(f"https://api.render.com/v1{path}", headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()[:200]}")
        return {}

print("Waiting for database to be ready...")
for i in range(20):
    result = api(f"/postgres/{DB_ID}")
    status = result.get("status", "?")
    print(f"  [{i+1}] Status: {status}")
    if status == "available":
        # Get connection info
        conn = api(f"/postgres/{DB_ID}/connection-info")
        print(f"\nDatabase ready!")
        print(f"Internal URL: {conn.get('internalConnectionString', '')}")
        print(f"External URL: {conn.get('externalConnectionString', '')}")
        break
    time.sleep(10)
