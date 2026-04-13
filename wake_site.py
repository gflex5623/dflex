import urllib.request, time

BASE = "https://dflex-fdya.onrender.com"

print("Waking up the site (may take 30-60 seconds)...")
for i in range(10):
    try:
        r = urllib.request.urlopen(BASE, timeout=30)
        print(f"✅ Site is UP! Status: {r.status}")
        print(f"🌐 {BASE}")
        break
    except Exception as e:
        print(f"  [{i+1}] Waiting... ({e})")
        time.sleep(10)
