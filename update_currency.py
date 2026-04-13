import urllib.request, json

BASE = "https://dflex-fdya.onrender.com"

def req(method, path, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token: headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(f"{BASE}{path}",
        data=json.dumps(data).encode() if data else None,
        headers=headers, method=method)
    try:
        res = urllib.request.urlopen(r)
        return json.loads(res.read()), res.status
    except urllib.request.HTTPError as e:
        body = e.read()
        try: return json.loads(body), e.code
        except: return {"detail": body.decode()[:100]}, e.code

# Get ALL adverts (no auth needed)
print("Fetching all adverts...")
resp, status = req("GET", "/api/adverts/?limit=100")
all_adverts = resp if isinstance(resp, list) else []
print(f"Found {len(all_adverts)} adverts")

if len(all_adverts) == 0:
    print("No adverts found — database may be empty. Run seed_adverts.py first.")
    exit()

# Login as each user and update their adverts
users = [
    ("kiro.developer@dflex.com", "kiro2024"),
    ("alex.chen@dflex.com", "alex2024"),
    ("sarah.okafor@dflex.com", "sarah2024"),
    ("james.obi@dflex.com", "james2024"),
    ("fatima.bello@dflex.com", "fatima2024"),
    ("emeka.nwosu@dflex.com", "emeka2024"),
    ("amina.yusuf@dflex.com", "amina2024"),
    ("chidi.eze@dflex.com", "chidi2024"),
    ("ngozi.adeyemi@dflex.com", "ngozi2024"),
    ("tunde.bakare@dflex.com", "tunde2024"),
]

total = 0
for email, password in users:
    resp, status = req("POST", "/api/auth/login", {"email": email, "password": password})
    if status != 200:
        continue
    token = resp.get("access_token")
    name = resp.get("user", {}).get("name", email)

    # Get this user's adverts
    my_adverts, _ = req("GET", "/api/adverts/my", token=token)
    if not isinstance(my_adverts, list): my_adverts = []

    updated = 0
    for ad in my_adverts:
        r, s = req("PUT", f"/api/adverts/{ad['id']}", {"currency": "NGN"}, token=token)
        if s == 200: updated += 1

    total += updated
    print(f"  ✅ {name}: {updated}/{len(my_adverts)} → NGN")

print(f"\n✅ {total} adverts updated to ₦ NGN")
