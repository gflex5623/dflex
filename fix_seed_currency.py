import re

for fname in ["seed_adverts.py", "seed_more_adverts.py"]:
    with open(fname, "r", encoding="utf-8") as f:
        content = f.read()
    # Add currency NGN to all advert dicts that have category_id but no currency
    updated = re.sub(
        r'("category_id":\s*\d+)\s*\}',
        r'\1, "currency": "NGN"}',
        content
    )
    with open(fname, "w", encoding="utf-8") as f:
        f.write(updated)
    print(f"Updated {fname}")
