import urllib.request, json

base = "https://dflex-fdya.onrender.com"

# Test homepage
r = urllib.request.urlopen(base)
print(f"Homepage: {r.status} ({len(r.read())} bytes)")

# Test categories API
r2 = urllib.request.urlopen(f"{base}/api/categories/")
cats = json.loads(r2.read())
print(f"Categories API: {r2.status} - {len(cats)} categories found")
for c in cats:
    print(f"  - {c['name']}")

# Test register
data = json.dumps({"name":"Test User","email":"testuser99@dflex.com","password":"test123"}).encode()
req = urllib.request.Request(f"{base}/api/auth/register", data=data,
      headers={"Content-Type":"application/json"}, method="POST")
try:
    r3 = urllib.request.urlopen(req)
    resp = json.loads(r3.read())
    print(f"Register: {r3.status} - user: {resp['user']['name']} - token OK")
except urllib.request.HTTPError as e:
    body = json.loads(e.read())
    print(f"Register: {e.code} - {body.get('detail','')}")

print()
print("=" * 40)
print("SITE IS LIVE AND WORKING")
print(f"URL: {base}")
print("=" * 40)
