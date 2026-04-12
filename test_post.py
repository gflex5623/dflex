import urllib.request, json

BASE = "https://dflex-fdya.onrender.com"

def post(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token: headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{path}",
          data=json.dumps(data).encode(), headers=headers, method="POST")
    try:
        r = urllib.request.urlopen(req)
        return json.loads(r.read()), r.status
    except urllib.request.HTTPError as e:
        return json.loads(e.read()), e.code

# 1. Register fresh user
print("1. Registering user...")
resp, status = post("/api/auth/register", {
    "name": "Test Poster",
    "email": "poster_test_99@dflex.com",
    "password": "test123"
})
if status == 400:
    # Already exists, login instead
    print("   Already exists, logging in...")
    resp, status = post("/api/auth/login", {
        "email": "poster_test_99@dflex.com",
        "password": "test123"
    })
print(f"   Status: {status}")
token = resp.get("access_token", "")
print(f"   Token: {token[:30]}...")

# 2. Post an advert
print("\n2. Posting advert...")
advert, status = post("/api/adverts/", {
    "title": "Test Business Advert",
    "description": "This is a test advert posted via API",
    "price": 100.0,
    "location": "Lagos",
    "contact": "+234 800 000 0000",
    "category_id": 1
}, token=token)
print(f"   Status: {status}")
if status == 200:
    print(f"   Advert ID: {advert.get('id')}")
    print(f"   Title: {advert.get('title')}")
    print(f"   Owner: {advert.get('owner', {}).get('name')}")
    print("\n✅ POSTING WORKS PERFECTLY")
else:
    print(f"   Error: {advert}")
    print("\n❌ POSTING FAILED")
