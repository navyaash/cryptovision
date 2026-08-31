from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import defaultdict

from .. import models, schemas, auth, coingecko
from ..database import get_db

router = APIRouter(prefix="/trade", tags=["trade"])


@router.post("/buy", response_model=schemas.TransactionOut)
def buy_coin(
    trade: schemas.TradeRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    price = coingecko.get_coin_price(trade.coin_id)
    if price is None:
        raise HTTPException(status_code=400, detail="Unknown coin_id")

    total_cost = price * trade.quantity
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user.id).first()

    if wallet.usd_balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient virtual balance")

    wallet.usd_balance -= total_cost
    txn = models.Transaction(
        user_id=user.id,
        coin_id=trade.coin_id,
        side="buy",
        quantity=trade.quantity,
        price_usd=price,
        total_usd=total_cost,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.post("/sell", response_model=schemas.TransactionOut)
def sell_coin(
    trade: schemas.TradeRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    price = coingecko.get_coin_price(trade.coin_id)
    if price is None:
        raise HTTPException(status_code=400, detail="Unknown coin_id")

    # figure out how much of this coin the user currently holds
    holdings = _compute_holdings(db, user.id)
    current_qty = holdings.get(trade.coin_id, {}).get("quantity", 0)

    if current_qty < trade.quantity:
        raise HTTPException(status_code=400, detail="You don't own enough of this coin to sell")

    proceeds = price * trade.quantity
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user.id).first()
    wallet.usd_balance += proceeds

    txn = models.Transaction(
        user_id=user.id,
        coin_id=trade.coin_id,
        side="sell",
        quantity=trade.quantity,
        price_usd=price,
        total_usd=proceeds,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.get("/history", response_model=list[schemas.TransactionOut])
def transaction_history(
    db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)
):
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user.id)
        .order_by(models.Transaction.created_at.desc())
        .all()
    )


@router.get("/portfolio", response_model=schemas.PortfolioOut)
def portfolio(
    db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)
):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user.id).first()
    holdings_map = _compute_holdings(db, user.id)

    holdings_out = []
    total_value = wallet.usd_balance

    for coin_id, h in holdings_map.items():
        if h["quantity"] <= 0:
            continue
        current_price = coingecko.get_coin_price(coin_id) or h["avg_buy_price"]
        current_value = current_price * h["quantity"]
        cost_basis = h["avg_buy_price"] * h["quantity"]
        profit_loss = current_value - cost_basis
        profit_loss_pct = (profit_loss / cost_basis * 100) if cost_basis > 0 else 0

        holdings_out.append(
            schemas.PortfolioHolding(
                coin_id=coin_id,
                quantity=round(h["quantity"], 8),
                avg_buy_price=round(h["avg_buy_price"], 4),
                current_price=round(current_price, 4),
                current_value=round(current_value, 2),
                profit_loss=round(profit_loss, 2),
                profit_loss_pct=round(profit_loss_pct, 2),
            )
        )
        total_value += current_value

    return schemas.PortfolioOut(
        usd_balance=round(wallet.usd_balance, 2),
        holdings=holdings_out,
        total_portfolio_value=round(total_value, 2),
    )


def _compute_holdings(db: Session, user_id: int) -> dict:
    """
    Replays a user's full transaction history to figure out, per coin:
    how much they currently hold, and their average buy price (cost basis).
    This average-cost method is the simplest standard way to track P&L
    when someone buys the same coin multiple times at different prices.
    """
    txns = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == user_id)
        .order_by(models.Transaction.created_at.asc())
        .all()
    )

    holdings = defaultdict(lambda: {"quantity": 0.0, "total_cost": 0.0, "avg_buy_price": 0.0})

    for t in txns:
        h = holdings[t.coin_id]
        if t.side == "buy":
            h["total_cost"] += t.total_usd
            h["quantity"] += t.quantity
            h["avg_buy_price"] = h["total_cost"] / h["quantity"] if h["quantity"] else 0
        else:  # sell -- reduce quantity, keep the same average cost basis
            h["quantity"] -= t.quantity
            h["total_cost"] = h["avg_buy_price"] * h["quantity"]

    return holdings
