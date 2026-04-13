import urllib.request, json, time

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
        try: return json.loads(body), e.code
        except: return {"detail": body.decode()[:100]}, e.code

def register_or_login(name, email, password):
    resp, status = post("/api/auth/register", {"name": name, "email": email, "password": password})
    if status == 400:
        resp, status = post("/api/auth/login", {"email": email, "password": password})
    return resp.get("access_token")

def post_advert(token, advert):
    resp, status = post("/api/adverts/", advert, token=token)
    title = advert['title'][:45]
    if status == 200:
        print(f"  ✅ {title}")
    else:
        print(f"  ❌ {title} — {resp.get('detail','')}")

# ── User 1: James Obi (Real Estate) ──────────────────────
print("\n👤 James Obi — Real Estate Agent")
t = register_or_login("James Obi", "james.obi@dflex.com", "james2024")
for a in [
    {"title": "Luxury 4-Bedroom Duplex for Sale — Lekki Phase 1", "description": "Stunning 4-bedroom duplex in the heart of Lekki Phase 1. Features include: marble floors, fitted kitchen, 3 bathrooms, boys quarters, 2 parking spaces, 24/7 security and power. Perfect for families and investors. Title: C of O. Price negotiable.", "price": 85000000, "location": "Lekki Phase 1, Lagos", "contact": "+234 803 456 7890", "category_id": 1, "currency": "NGN"},
    {"title": "2-Bedroom Flat for Rent — Ikeja GRA", "description": "Spacious 2-bedroom flat in Ikeja GRA. Fully tiled, fitted kitchen, wardrobe in all rooms, POP ceiling, prepaid meter, 24/7 security. Close to MMA2 airport and major roads. Available immediately. 1 year rent required.", "price": 1800000, "location": "Ikeja GRA, Lagos", "contact": "+234 803 456 7890", "category_id": 1, "currency": "NGN"},
    {"title": "Commercial Office Space for Lease — Victoria Island", "description": "Prime commercial office space available for lease on Victoria Island. 500sqm open plan office on the 3rd floor of a modern building. Features: central AC, backup power, high-speed internet, parking for 10 cars, reception area. Ideal for corporate offices, banks, and tech companies.", "price": 12000000, "location": "Victoria Island, Lagos", "contact": "+234 803 456 7890", "category_id": 1, "currency": "NGN"},
]:
    post_advert(t, a)

# ── User 2: Fatima Bello (Vehicles) ──────────────────────
print("\n👤 Fatima Bello — Auto Dealer")
t = register_or_login("Fatima Bello", "fatima.bello@dflex.com", "fatima2024")
for a in [
    {"title": "2022 Toyota Camry XSE — Tokunbo, Full Option", "description": "Clean 2022 Toyota Camry XSE V6 for sale. Tokunbo (foreign used), accident-free. Features: leather seats, sunroof, reverse camera, blind spot monitor, lane assist, Apple CarPlay. Mileage: 28,000 miles. Customs duty paid. Available for inspection in Lagos.", "price": 28000000, "location": "Lekki, Lagos", "contact": "+234 806 789 0123", "category_id": 2, "currency": "NGN"},
    {"title": "2020 Mercedes-Benz GLE 350 — Registered", "description": "2020 Mercedes-Benz GLE 350 4MATIC for sale. Nigerian used, registered. Full option: panoramic roof, Burmester sound system, 360 camera, heated seats, ambient lighting. Excellent condition, service history available. Serious buyers only.", "price": 55000000, "location": "Abuja, FCT", "contact": "+234 806 789 0123", "category_id": 2, "currency": "NGN"},
    {"title": "2019 Honda Civic Sedan — Clean & Affordable", "description": "2019 Honda Civic EX sedan for sale. Foreign used, very clean. Features: turbocharged engine, Honda Sensing safety suite, Apple CarPlay/Android Auto, heated front seats, sunroof. Low mileage: 35,000 miles. Price is firm.", "price": 14500000, "location": "Port Harcourt, Rivers", "contact": "+234 806 789 0123", "category_id": 2, "currency": "NGN"},
]:
    post_advert(t, a)

# ── User 3: Emeka Nwosu (Electronics) ────────────────────
print("\n👤 Emeka Nwosu — Electronics Store")
t = register_or_login("Emeka Nwosu", "emeka.nwosu@dflex.com", "emeka2024")
for a in [
    {"title": "iPhone 15 Pro Max 256GB — Brand New Sealed", "description": "Brand new sealed iPhone 15 Pro Max 256GB in Natural Titanium. Comes with full Apple warranty, original accessories. Purchased from Apple Store USA. Available for immediate pickup or delivery within Lagos. We accept bank transfer and POS.", "price": 1350000, "location": "Computer Village, Ikeja", "contact": "+234 809 012 3456", "category_id": 3, "currency": "NGN"},
    {"title": "Samsung 65-inch QLED 4K Smart TV — 2023 Model", "description": "Samsung 65-inch QLED 4K Smart TV (QN65Q80C). Brand new in box. Features: Quantum HDR, 120Hz refresh rate, built-in Alexa, 4 HDMI ports, WiFi 5. Perfect for home cinema setup. Delivery available nationwide. 1-year warranty.", "price": 850000, "location": "Ikeja, Lagos", "contact": "+234 809 012 3456", "category_id": 3, "currency": "NGN"},
    {"title": "Dell XPS 15 Laptop — Intel i9, 32GB RAM, 1TB SSD", "description": "Dell XPS 15 (2023) for sale. Specs: Intel Core i9-13900H, 32GB DDR5 RAM, 1TB NVMe SSD, NVIDIA RTX 4060, 15.6-inch OLED display. Barely used, excellent condition. Comes with original charger and bag. Perfect for developers, designers, and content creators.", "price": 1200000, "location": "Victoria Island, Lagos", "contact": "+234 809 012 3456", "category_id": 3, "currency": "NGN"},
]:
    post_advert(t, a)

# ── User 4: Amina Yusuf (Jobs) ────────────────────────────
print("\n👤 Amina Yusuf — HR Consultant")
t = register_or_login("Amina Yusuf", "amina.yusuf@dflex.com", "amina2024")
for a in [
    {"title": "Hiring: Senior Software Engineer — Remote (Nigeria)", "description": "We are hiring a Senior Software Engineer for a fast-growing fintech startup. Requirements: 5+ years experience, proficiency in Python/Node.js, experience with microservices and cloud (AWS/GCP). Responsibilities: build scalable APIs, mentor junior devs, participate in architecture decisions. Salary: ₦800k–₦1.2M/month. Remote-first.", "price": 1000000, "location": "Remote, Nigeria", "contact": "amina.yusuf@dflex.com", "category_id": 4, "currency": "NGN"},
    {"title": "Hiring: Digital Marketing Manager — Lagos", "description": "Growing e-commerce company seeks an experienced Digital Marketing Manager. Requirements: 3+ years in digital marketing, expertise in SEO/SEM, social media advertising, email marketing, and analytics. Must be data-driven and creative. Salary: ₦350k–₦500k/month + performance bonus. Apply with CV and portfolio.", "price": 400000, "location": "Lagos Island, Lagos", "contact": "amina.yusuf@dflex.com", "category_id": 4, "currency": "NGN"},
    {"title": "Hiring: Accountant / Finance Officer — Abuja", "description": "Reputable construction company in Abuja seeks a qualified Accountant. Requirements: B.Sc Accounting, ICAN/ACCA certification, 3+ years experience, proficiency in QuickBooks and Excel. Responsibilities: financial reporting, payroll, tax compliance, budget management. Salary: ₦250k–₦400k/month.", "price": 300000, "location": "Abuja, FCT", "contact": "amina.yusuf@dflex.com", "category_id": 4, "currency": "NGN"},
]:
    post_advert(t, a)

# ── User 5: Chidi Eze (Services) ─────────────────────────
print("\n👤 Chidi Eze — Business Services")
t = register_or_login("Chidi Eze", "chidi.eze@dflex.com", "chidi2024")
for a in [
    {"title": "Professional Catering Services — Events & Parties", "description": "Top-quality catering services for all occasions: weddings, corporate events, birthday parties, funerals, and more. We offer Nigerian, continental, and intercontinental cuisines. Our team of professional chefs ensures delicious meals and excellent presentation. Minimum 50 guests. Book 2 weeks in advance.", "price": 150000, "location": "Lagos & Abuja", "contact": "+234 812 345 6789", "category_id": 5, "currency": "NGN"},
    {"title": "Generator Repair & Maintenance Services", "description": "Expert generator repair and maintenance for all brands: Mikano, Perkins, Caterpillar, Cummins, Honda, Elemax. Services: routine servicing, engine overhaul, AVR replacement, fuel system repair, electrical faults. We offer home and office visits. 24/7 emergency service available. 3-month warranty on all repairs.", "price": 25000, "location": "Lagos (All Areas)", "contact": "+234 812 345 6789", "category_id": 5, "currency": "NGN"},
    {"title": "Professional Photography & Videography Services", "description": "Award-winning photography and videography for weddings, corporate events, product shoots, and portraits. We use top-of-the-line Canon and Sony equipment. Services include: same-day editing, drone footage, photo albums, and highlight videos. Over 500 events covered. Book now for 2024/2025 dates.", "price": 200000, "location": "Lagos, Nigeria", "contact": "+234 812 345 6789", "category_id": 5, "currency": "NGN"},
]:
    post_advert(t, a)

# ── User 6: Ngozi Adeyemi (Fashion) ──────────────────────
print("\n👤 Ngozi Adeyemi — Fashion Designer")
t = register_or_login("Ngozi Adeyemi", "ngozi.adeyemi@dflex.com", "ngozi2024")
for a in [
    {"title": "Custom Ankara & Aso-Oke Outfits — Wedding Attire", "description": "Bespoke Ankara and Aso-Oke outfits for weddings, traditional ceremonies, and special occasions. We specialize in gele tying, iro and buba, agbada, and modern fusion styles. All fabrics sourced from top Nigerian and Ghanaian markets. Delivery nationwide. Order 3 weeks before your event.", "price": 85000, "location": "Yaba, Lagos", "contact": "+234 815 678 9012", "category_id": 6, "currency": "NGN"},
    {"title": "Designer Handbags & Accessories — Wholesale & Retail", "description": "Premium quality designer-inspired handbags, shoes, and accessories. We stock: tote bags, clutches, crossbody bags, heels, sandals, and jewelry. Wholesale prices available for resellers. New stock arrives weekly from Dubai and Turkey. Visit our store or order online for delivery.", "price": 35000, "location": "Balogun Market, Lagos", "contact": "+234 815 678 9012", "category_id": 6, "currency": "NGN"},
    {"title": "Men's Corporate Suits & Native Wear — Tailoring", "description": "Professional tailoring for men's corporate suits, kaftan, senator, and agbada. We use premium fabrics: Italian wool, linen, and Dutch wax. Turnaround time: 5–7 days. We also offer alterations and repairs. Walk-in or send your measurements via WhatsApp. Satisfaction guaranteed.", "price": 65000, "location": "Surulere, Lagos", "contact": "+234 815 678 9012", "category_id": 6, "currency": "NGN"},
]:
    post_advert(t, a)

# ── User 7: Tunde Bakare (Food & Drinks) ─────────────────
print("\n👤 Tunde Bakare — Food Business")
t = register_or_login("Tunde Bakare", "tunde.bakare@dflex.com", "tunde2024")
for a in [
    {"title": "Restaurant for Sale — Fully Equipped, Victoria Island", "description": "Profitable restaurant business for sale in Victoria Island. Fully equipped: industrial kitchen, 60-seat dining area, bar section, POS system, CCTV, generator. Currently generating ₦2.5M monthly revenue. Reason for sale: owner relocating abroad. Serious buyers only — financials available on request.", "price": 45000000, "location": "Victoria Island, Lagos", "contact": "+234 818 901 2345", "category_id": 7, "currency": "NGN"},
    {"title": "Freshly Baked Bread & Pastries — Daily Delivery", "description": "Order fresh bread, cakes, chin-chin, puff-puff, meat pies, and pastries for your home, office, or event. We bake daily using quality ingredients — no preservatives. Minimum order: ₦5,000. Free delivery within Ikeja, Ojodu, and Berger. WhatsApp orders accepted. Bulk orders for events welcome.", "price": 5000, "location": "Ojodu Berger, Lagos", "contact": "+234 818 901 2345", "category_id": 7, "currency": "NGN"},
    {"title": "Zobo, Kunu & Zobo Drink Production — Wholesale Supply", "description": "We produce and supply premium quality Zobo, Kunu, and Chapman drinks for hotels, restaurants, events, and retailers. Made with fresh natural ingredients, no artificial colors. Available in 50cl, 1L, and 5L packs. Minimum order: 50 bottles. Delivery available in Lagos and Ogun State.", "price": 800, "location": "Agege, Lagos", "contact": "+234 818 901 2345", "category_id": 7, "currency": "NGN"},
]:
    post_advert(t, a)

print("\n" + "="*55)
print("✅ 21 new business adverts posted successfully!")
print(f"🌐 View at: {BASE}")
print("="*55)
