import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from database import engine, Base
from routes import auth, adverts, categories

Base.metadata.create_all(bind=engine)

app = FastAPI(title="dFlex Advert API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(adverts.router, prefix="/api/adverts", tags=["adverts"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
INDEX_FILE = os.path.join(STATIC_DIR, "index.html")

if os.path.exists(INDEX_FILE):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(INDEX_FILE)
else:
    @app.get("/")
    async def root():
        return HTMLResponse("<h1>dFlex API is running</h1><p>Visit <a href='/docs'>/docs</a></p>")
