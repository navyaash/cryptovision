from fastapi import APIRouter, HTTPException

from .. import coingecko, indicators

router = APIRouter(prefix="/coins", tags=["coins"])


@router.get("")
def list_coins(limit: int = 50):
    """Top coins by market cap -- powers the main dashboard table."""
    try:
        return coingecko.get_top_coins(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CoinGecko request failed: {e}")


@router.get("/{coin_id}/ohlc")
def coin_ohlc(coin_id: str, days: int = 30):
    """Candlestick data for the chart: [timestamp, open, high, low, close]."""
    try:
        return coingecko.get_ohlc(coin_id, days=days)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CoinGecko request failed: {e}")


@router.get("/{coin_id}/indicators")
def coin_indicators(coin_id: str, days: int = 90):
    """SMA, RSI, MACD, Bollinger Bands, computed from daily closing prices."""
    try:
        prices = coingecko.get_market_chart(coin_id, days=days)
        if len(prices) < 20:
            raise HTTPException(status_code=400, detail="Not enough price history for this coin.")
        return indicators.all_indicators(prices)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"CoinGecko request failed: {e}")
