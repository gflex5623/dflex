import urllib.request, json

BASE = "https://dflex-fdya.onrender.com"
r = urllib.request.urlopen(f"{BASE}/api/adverts/?limit=100")
adverts = json.loads(r.read())

ngn = sum(1 for a in adverts if a.get("currency") == "NGN")
other = [(a["title"][:40], a.get("currency")) for a in adverts if a.get("currency") != "NGN"]

print(f"Total adverts: {len(adverts)}")
print(f"NGN (₦): {ngn}")
if other:
    print(f"Other currencies: {other}")
else:
    print("✅ All adverts are in NGN (₦)")
