import urllib.request
r = urllib.request.urlopen("https://dflex-fdya.onrender.com")
content = r.read().decode()
tag = "LgBd1l6fCFzOl9QRvTpOSy9FrCt3T3eLqqQBc7UlpP0"
print("Google verification tag:", "✅ FOUND" if tag in content else "❌ NOT FOUND")
print("Homepage size:", len(content), "bytes")
print()
print(content)
