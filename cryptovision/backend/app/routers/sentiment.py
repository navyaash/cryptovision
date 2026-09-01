import os
import requests
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


@router.get("/fear-greed")
def fear_greed_index():
    """
    The Fear & Greed Index (0-100) -- a well-known crypto sentiment gauge.
    Free public API, no key required.
    """
    try:
        resp = requests.get("https://api.alternative.me/fng/?limit=1", timeout=10)
        resp.raise_for_status()
        data = resp.json()["data"][0]
        return {
            "value": int(data["value"]),
            "classification": data["value_classification"],
            "timestamp": data["timestamp"],
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Fear & Greed API failed: {e}")


@router.get("/news")
def latest_news(limit: int = 8):
    """Recent crypto news headlines, from CryptoCompare's free news feed."""
    # CryptoCompare made this feed key-only in 2025. Without a key the request
    # 401s, so we return an empty list instead of a 502 -- the dashboard then
    # shows "No news available" rather than spinning on "Loading news..." forever.
    # Set CRYPTOCOMPARE_API_KEY (free tier at cryptocompare.com) to re-enable it.
    api_key = os.getenv("CRYPTOCOMPARE_API_KEY", "").strip()
    params = {"lang": "EN"}
    if api_key:
        params["api_key"] = api_key

    try:
        resp = requests.get(
            "https://min-api.cryptocompare.com/data/v2/news/",
            params=params,
            timeout=10,
        )
        if resp.status_code == 401:
            return []
        resp.raise_for_status()
        articles = resp.json().get("Data", [])[:limit]
        return [
            {
                "title": a.get("title"),
                "source": a.get("source"),
                "url": a.get("url"),
                "published_on": a.get("published_on"),
            }
            for a in articles
        ]
    except Exception:
        # Never let a flaky third-party news feed break the dashboard.
        return []
