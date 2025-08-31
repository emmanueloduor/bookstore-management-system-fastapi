from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from database import db

# --- Application Setup ---
app = FastAPI(
    title="BookVault API",
    description="A modern bookstore management API",
    version="1.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routes
app.include_router(router)

# --- Event Handlers ---
@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print("BookVault API is starting up...")
    print(f"Loaded {len(db.books)} books")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("BookVault API is shutting down...")
    db.save_books()
    print("Books saved to file successfully!")