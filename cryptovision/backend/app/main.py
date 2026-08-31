"""
App entrypoint. Run locally with:  uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import Base, engine
from .routers import auth_routes, coins, predict, trade, watchlist, sentiment

# create all tables on startup if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CryptoVision API", version="1.0.0")

# allow the React frontend (running on a different origin) to call this API
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN] if FRONTEND_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(coins.router)
app.include_router(predict.router)
app.include_router(trade.router)
app.include_router(watchlist.router)
app.include_router(sentiment.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "CryptoVision API"}
