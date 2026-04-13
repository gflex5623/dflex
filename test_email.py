import urllib.request, json

BASE = "https://dflex-fdya.onrender.com"

def post(path, data):
    req = urllib.request.Request(f"{BASE}{path}",
          data=json.dumps(data).encode(),
          headers={"Content-Type": "application/json"}, method="POST")
    try:
        r = urllib.request.urlopen(req)
        return json.loads(r.read()), r.status
    except urllib.request.HTTPError as e:
        return json.loads(e.read()), e.code

print("Testing forgot password email...")
resp, status = post("/api/auth/forgot-password", {"email": "davidzarch0@gmail.com"})
print(f"Status: {status}")
print(f"Response: {resp}")

if resp.get("reset_token"):
    print("\n⚠️  Email NOT sent — SMTP credentials may be wrong or not picked up yet")
    print(f"Reset token (for manual testing): {resp['reset_token']}")
else:
    print("\n✅ Email sent to davidzarch0@gmail.com — check your inbox!")
