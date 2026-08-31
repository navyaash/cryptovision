"""
Pydantic schemas -- these define the shape of JSON going in/out of the API.
Models (models.py) define the DATABASE. Schemas define the API CONTRACT.
Keeping them separate means you can change your DB without breaking the API.
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Trading ----------
class TradeRequest(BaseModel):
    coin_id: str        # e.g. "bitcoin"
    quantity: float


class TransactionOut(BaseModel):
    id: int
    coin_id: str
    side: str
    quantity: float
    price_usd: float
    total_usd: float
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioHolding(BaseModel):
    coin_id: str
    quantity: float
    avg_buy_price: float
    current_price: float
    current_value: float
    profit_loss: float
    profit_loss_pct: float


class PortfolioOut(BaseModel):
    usd_balance: float
    holdings: list[PortfolioHolding]
    total_portfolio_value: float


# ---------- Watchlist ----------
class WatchlistAdd(BaseModel):
    coin_id: str


class WatchlistOut(BaseModel):
    id: int
    coin_id: str

    class Config:
        from_attributes = True
