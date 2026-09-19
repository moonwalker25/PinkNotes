import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.ai import router as ai_router
from routes.notes import router as notes_router
from routes.validation import router as validation_router
from routes.quiz import router as quiz_router


app = FastAPI(
    title="PinkNotes API",
    description="Backend API for PinkNotes AI Learning Platform",
    version="1.0.0"
)


frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000"
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pink-notes-nine.vercel.app",
    frontend_url,
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(origins)),
    allow_origin_regex=r"^https://pink-notes.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ai_router)
app.include_router(notes_router)
app.include_router(validation_router)
app.include_router(quiz_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to PinkNotes API 🚀"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }