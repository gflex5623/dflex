import os
import sys

port = int(os.environ.get("PORT", 8000))
print(f"Starting on port {port}", flush=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

print("FastAPI imported", flush=True)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def root():
    return {"status": "dFlex API running"}

@app.get("/health")
def health():
    return {"ok": True}

print("App created, starting uvicorn...", flush=True)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=port, loop="asyncio")
