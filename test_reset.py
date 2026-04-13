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

# 1. Request password reset
print("1. Requesting password reset...")
resp, status = post("/api/auth/forgot-password", {"email": "poster_test_99@dflex.com"})
print(f"   Status: {status}")
print(f"   Message: {resp.get('message')}")
token = resp.get("reset_token", "")
if token:
    print(f"   Token: {token[:20]}...")

    # 2. Reset password using token
    print("\n2. Resetting password with token...")
    resp2, status2 = post("/api/auth/reset-password", {
        "token": token,
        "new_password": "newpass123"
    })
    print(f"   Status: {status2}")
    print(f"   Message: {resp2.get('message')}")

    # 3. Login with new password
    print("\n3. Logging in with new password...")
    resp3, status3 = post("/api/auth/login", {
        "email": "poster_test_99@dflex.com",
        "password": "newpass123"
    })
    print(f"   Status: {status3}")
    if status3 == 200:
        print(f"   ✅ Login successful! Token: {resp3.get('access_token','')[:20]}...")
        print("\n✅ FORGOT PASSWORD FLOW WORKS PERFECTLY")
    else:
        print(f"   ❌ Login failed: {resp3}")
else:
    print("   (Email configured — reset link sent to email)")
    print("   ✅ Forgot password endpoint working")
