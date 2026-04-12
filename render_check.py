import urllib.request, json

API_KEY = "rnd_dleXrjGnGeCpdo4amskPje0IS2qO"
SERVICE_ID = "srv-d7c7elv7f7vs739dfokg"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

req = urllib.request.Request(f"https://api.render.com/v1/services/{SERVICE_ID}", headers=HEADERS)
with urllib.request.urlopen(req) as r:
    svc = json.loads(r.read())

details = svc.get("serviceDetails", {})
env_details = details.get("envSpecificDetails", {})
print("startCommand:", repr(env_details.get("startCommand", "")))
print("buildCommand:", repr(env_details.get("buildCommand", "")))
print("runtime:", details.get("runtime", ""))
print("env:", details.get("env", ""))
