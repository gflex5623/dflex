import sys
import os

print("Starting dFlex...", flush=True)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
print("Path set", flush=True)

import uvicorn
print("uvicorn imported", flush=True)

from main import app
print("app imported", flush=True)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port)
