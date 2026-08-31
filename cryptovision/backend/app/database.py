"""
Database connection setup.

Uses SQLite by default so you can run this locally with zero setup.
On deployment (Render/Railway), set the DATABASE_URL environment variable
to a PostgreSQL connection string and it switches automatically --
no code changes needed. This is the standard way to keep dev simple
while matching production (Postgres).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cryptovision.db")

# Render/Heroku hand out URLs starting with "postgres://", but SQLAlchemy 2.x
# only recognises the "postgresql://" scheme and raises NoSuchModuleError on the
# old one. Normalise it so pasting Render's URL straight in just works.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs this extra arg when used with FastAPI (multiple threads access it)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency: gives each request its own DB session, closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
