# dFlex — Business Advert Platform

**dflex.com** | A full-stack advert platform built with React + FastAPI + SQLite.

## Project Structure

```
├── backend/        # Python FastAPI backend
└── client/         # React frontend
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on http://localhost:8000

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs on http://localhost:5173

## Features

- Browse and search adverts
- Filter by category, price range
- User registration & login (JWT)
- Post, edit, delete your own adverts
- 8 built-in categories (auto-seeded)
- Responsive UI
