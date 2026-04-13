import urllib.request

urls = [
    ("Homepage", "https://dflex-fdya.onrender.com"),
    ("JS Bundle", "https://dflex-fdya.onrender.com/assets/index-Cygfqt-V.js"),
    ("CSS", "https://dflex-fdya.onrender.com/assets/index-7A63JAHn.css"),
    ("Categories API", "https://dflex-fdya.onrender.com/api/categories/"),
    ("Adverts API", "https://dflex-fdya.onrender.com/api/adverts/"),
]

for name, url in urls:
    try:
        r = urllib.request.urlopen(url, timeout=15)
        size = len(r.read())
        print(f"  OK  {name}: {r.status} ({size} bytes)")
    except Exception as e:
        print(f"  FAIL {name}: {e}")
