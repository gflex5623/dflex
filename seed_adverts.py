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
        body = e.read()
        try:
            return json.loads(body), e.code
        except:
            return {"detail": body.decode()[:200]}, e.code
    except Exception as e:
        return {"detail": str(e)}, 500

def register_or_login(name, email, password):
    resp, status = post("/api/auth/register", {"name": name, "email": email, "password": password})
    if status == 400:
        resp, status = post("/api/auth/login", {"email": email, "password": password})
    return resp.get("access_token")

# ── Developer 1: Kiro Developer ──────────────────────────
print("Creating Kiro Developer account...")
token1 = register_or_login("Kiro Developer", "kiro.developer@dflex.com", "kiro2024")

adverts1 = [
    {
        "title": "Full-Stack Web Development Services",
        "description": "Professional full-stack web development using React, FastAPI, and Python. I build modern, responsive web applications tailored to your business needs. Services include: custom web apps, REST APIs, database design, deployment & hosting setup. Fast delivery, clean code, and ongoing support.",
        "price": 500.0,
        "location": "Remote / Worldwide",
        "contact": "kiro.developer@dflex.com",
        "category_id": 5
    },
    {
        "title": "AI-Powered Business Application Development",
        "description": "Transform your business with AI-powered applications. I specialize in building intelligent tools using Python, machine learning, and modern AI frameworks. From chatbots to data analytics dashboards — let's build something smart together.",
        "price": 1200.0,
        "location": "Remote / Worldwide",
        "contact": "kiro.developer@dflex.com",
        "category_id": 5
    },
    {
        "title": "Mobile-Responsive Website Design & Development",
        "description": "Get a stunning, mobile-first website for your business. I design and develop websites that look great on all devices. Includes SEO optimization, fast loading, and Google Search Console setup. Perfect for small businesses, startups, and entrepreneurs.",
        "price": 300.0,
        "location": "Remote / Worldwide",
        "contact": "kiro.developer@dflex.com",
        "category_id": 5
    }
]

for a in adverts1:
    resp, status = post("/api/adverts/", a, token=token1)
    print(f"  ✅ Posted: {a['title'][:50]} (ID: {resp.get('id')})")

# ── Developer 2: Alex Chen ────────────────────────────────
print("\nCreating Alex Chen account...")
token2 = register_or_login("Alex Chen", "alex.chen@dflex.com", "alex2024")

adverts2 = [
    {
        "title": "iOS & Android App Development",
        "description": "Expert mobile app developer with 5+ years experience. I build native and cross-platform mobile apps for iOS and Android using React Native and Flutter. From concept to App Store — I handle everything. Portfolio available on request.",
        "price": 800.0,
        "location": "San Francisco, USA",
        "contact": "alex.chen@dflex.com",
        "category_id": 5
    },
    {
        "title": "E-Commerce Store Setup & Development",
        "description": "Launch your online store with a professional e-commerce solution. I build custom online shops with payment integration, inventory management, and order tracking. Platforms: Shopify, WooCommerce, or fully custom. Start selling online today!",
        "price": 650.0,
        "location": "Remote / Worldwide",
        "contact": "alex.chen@dflex.com",
        "category_id": 5
    },
    {
        "title": "MacBook Pro 2023 M2 — For Sale",
        "description": "Selling my MacBook Pro 2023 with M2 chip, 16GB RAM, 512GB SSD. Excellent condition, barely used. Comes with original charger and box. Perfect for developers, designers, and creatives. Price negotiable for serious buyers.",
        "price": 1800.0,
        "location": "San Francisco, USA",
        "contact": "alex.chen@dflex.com",
        "category_id": 3
    }
]

for a in adverts2:
    resp, status = post("/api/adverts/", a, token=token2)
    print(f"  ✅ Posted: {a['title'][:50]} (ID: {resp.get('id')})")

# ── Developer 3: Sarah Okafor ─────────────────────────────
print("\nCreating Sarah Okafor account...")
token3 = register_or_login("Sarah Okafor", "sarah.okafor@dflex.com", "sarah2024")

adverts3 = [
    {
        "title": "UI/UX Design & Branding Services",
        "description": "Creative UI/UX designer offering professional design services for web and mobile apps. I create beautiful, user-friendly interfaces that convert visitors into customers. Services: wireframing, prototyping, brand identity, logo design, and design systems. Tools: Figma, Adobe XD.",
        "price": 400.0,
        "location": "Lagos, Nigeria",
        "contact": "sarah.okafor@dflex.com",
        "category_id": 5
    },
    {
        "title": "Digital Marketing & SEO Services",
        "description": "Grow your business online with expert digital marketing. I offer SEO optimization, social media management, Google Ads, and content marketing. I have helped 50+ businesses increase their online visibility and sales. Let's grow your brand together!",
        "price": 250.0,
        "location": "Lagos, Nigeria",
        "contact": "sarah.okafor@dflex.com",
        "category_id": 5
    },
    {
        "title": "3-Bedroom Apartment for Rent — Victoria Island",
        "description": "Spacious 3-bedroom apartment available for rent in Victoria Island, Lagos. Fully furnished with modern appliances, 24/7 security, backup power, and parking space. Close to major banks, restaurants, and shopping malls. Ideal for professionals and families.",
        "price": 2500.0,
        "location": "Victoria Island, Lagos",
        "contact": "sarah.okafor@dflex.com",
        "category_id": 1
    }
]

for a in adverts3:
    resp, status = post("/api/adverts/", a, token=token3)
    print(f"  ✅ Posted: {a['title'][:50]} (ID: {resp.get('id')})")

print("\n" + "="*50)
print("✅ All 9 adverts posted successfully!")
print(f"🌐 View at: {BASE}")
print("="*50)
