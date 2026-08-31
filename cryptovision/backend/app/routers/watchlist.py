from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=list[schemas.WatchlistOut])
def get_watchlist(
    db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.WatchlistItem).filter(models.WatchlistItem.user_id == user.id).all()


@router.post("", response_model=schemas.WatchlistOut, status_code=201)
def add_to_watchlist(
    item: schemas.WatchlistAdd,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    existing = (
        db.query(models.WatchlistItem)
        .filter(models.WatchlistItem.user_id == user.id, models.WatchlistItem.coin_id == item.coin_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already in watchlist")

    entry = models.WatchlistItem(user_id=user.id, coin_id=item.coin_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{coin_id}", status_code=204)
def remove_from_watchlist(
    coin_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    entry = (
        db.query(models.WatchlistItem)
        .filter(models.WatchlistItem.user_id == user.id, models.WatchlistItem.coin_id == coin_id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Not in watchlist")
    db.delete(entry)
    db.commit()
