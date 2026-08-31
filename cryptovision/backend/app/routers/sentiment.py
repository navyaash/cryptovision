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
    try:
        resp = requests.get(
            "https://min-api.cryptocompare.com/data/v2/news/",
            params={"lang": "EN"},
            timeout=10,
        )
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
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"News API failed: {e}")
