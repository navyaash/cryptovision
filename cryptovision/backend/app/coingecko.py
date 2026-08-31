"""
Thin wrapper around the free CoinGecko API (no API key needed for this tier).

We cache responses in memory for a short time because CoinGecko's free tier
rate-limits aggressively (roughly 10-30 calls/minute). Without caching, a
dashboard with several users refreshing would get blocked constantly.
"""
import time
import requests

BASE_URL = "https://api.coingecko.com/api/v3"

# very small in-memory cache: {cache_key: (timestamp, data)}
_cache: dict = {}
CACHE_SECONDS = 30


def _cached_get(url: str, params: dict = None, cache_key: str = None, ttl: int = CACHE_SECONDS):
    key = cache_key or url + str(params)
    now = time.time()
    if key in _cache:
        cached_time, cached_data = _cache[key]
        if now - cached_time < ttl:
            return cached_data

    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    _cache[key] = (now, data)
    return data


def get_top_coins(limit: int = 50, page: int = 1):
    """List of top coins by market cap, with current price, 24h change, etc."""
    return _cached_get(
        f"{BASE_URL}/coins/markets",
        params={
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": limit,
            "page": page,
            "sparkline": "false",
            "price_change_percentage": "24h",
        },
        cache_key=f"top_coins_{limit}_{page}",
    )


def get_coin_price(coin_id: str) -> float:
    """Current USD price for a single coin, e.g. 'bitcoin'."""
    data = _cached_get(
        f"{BASE_URL}/simple/price",
        params={"ids": coin_id, "vs_currencies": "usd"},
        cache_key=f"price_{coin_id}",
        ttl=15,
    )
    return data.get(coin_id, {}).get("usd")


def get_ohlc(coin_id: str, days: int = 30):
    """
    OHLC candlestick data: list of [timestamp, open, high, low, close].
    CoinGecko only allows specific 'days' values (1, 7, 14, 30, 90, 180, 365).
    """
    return _cached_get(
        f"{BASE_URL}/coins/{coin_id}/ohlc",
        params={"vs_currency": "usd", "days": days},
        cache_key=f"ohlc_{coin_id}_{days}",
        ttl=60,
    )


def get_market_chart(coin_id: str, days: int = 90):
    """Daily closing prices for a coin -- used as training data for the LSTM."""
    data = _cached_get(
        f"{BASE_URL}/coins/{coin_id}/market_chart",
        params={"vs_currency": "usd", "days": days, "interval": "daily"},
        cache_key=f"chart_{coin_id}_{days}",
        ttl=300,
    )
    # data["prices"] is a list of [timestamp_ms, price]
    return [p[1] for p in data.get("prices", [])]
