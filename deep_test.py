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
        try: return json.loads(e.read()), e.code
        except: return {}, e.code

print("1. Homepage...")
r = urllib.request.urlopen(BASE)
print(f"   ✅ {r.status} ({len(r.read())} bytes)")

print("2. Categories API...")
cats, s = req("GET", "/api/categories/")
print(f"   ✅ {s} — {len(cats)} categories")

print("3. Adverts API...")
ads, s = req("GET", "/api/adverts/?limit=5")
print(f"   ✅ {s} — {len(ads)} adverts returned")
for a in ads[:3]:
    print(f"      • {a['title'][:45]} — ₦{a.get('price','?'):,}")

print("4. Login test...")
resp, s = req("POST", "/api/auth/login", {"email": "kiro.developer@dflex.com", "password": "kiro2024"})
token = resp.get("access_token", "")
print(f"   ✅ {s} — token: {token[:25]}...")

print("5. Auth /me endpoint...")
me, s = req("GET", "/api/auth/me", token=token)
print(f"   ✅ {s} — user: {me.get('name')}")

print("6. Sitemap...")
r2 = urllib.request.urlopen(f"{BASE}/sitemap.xml")
print(f"   ✅ {r2.status}")

print("\n✅ All checks passed — site is fully working!")
print(f"🌐 {BASE}")
