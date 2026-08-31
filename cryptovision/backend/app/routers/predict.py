from fastapi import APIRouter, HTTPException

from .. import coingecko, lstm_model

router = APIRouter(prefix="/predict", tags=["predict"])


@router.get("/{coin_id}")
def predict_price(coin_id: str, days: int = 90):
    """
    Predicts tomorrow's closing price for a coin using an LSTM trained
    on-the-fly on its recent price history. See lstm_model.py for details.
    """
    try:
        prices = coingecko.get_market_chart(coin_id, days=days)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CoinGecko request failed: {e}")

    try:
        return lstm_model.predict_next_price(prices)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
