"""
Database tables, defined as SQLAlchemy models.

Four tables:
  User        -- login credentials
  Wallet      -- one virtual USD balance per user (starts at $10,000)
  Transaction -- every buy/sell a user makes (this is the trade history)
  Watchlist   -- coins a user has starred
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

STARTING_BALANCE = 10000.0  # every new user gets $10,000 in play money


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="owner", uselist=False)
    transactions = relationship("Transaction", back_populates="owner")
    watchlist = relationship("WatchlistItem", back_populates="owner")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    usd_balance = Column(Float, default=STARTING_BALANCE)

    owner = relationship("User", back_populates="wallet")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    coin_id = Column(String, index=True)       # e.g. "bitcoin"
    side = Column(String)                       # "buy" or "sell"
    quantity = Column(Float)                    # how many coins
    price_usd = Column(Float)                   # price per coin at execution
    total_usd = Column(Float)                   # quantity * price_usd
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="transactions")


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    coin_id = Column(String, index=True)

    owner = relationship("User", back_populates="watchlist")
