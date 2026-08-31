"""
Technical indicators, computed from a plain list of closing prices.

These are standard formulas -- nothing here is CoinGecko-specific.
Given any list of prices (oldest first), each function returns a matching
list of indicator values (with early values as None where there isn't
enough history yet to compute them, e.g. a 20-day SMA needs 20 days).
"""
import pandas as pd


def sma(prices: list[float], window: int = 20) -> list[float | None]:
    """Simple Moving Average -- the average price over the last `window` periods."""
    series = pd.Series(prices)
    result = series.rolling(window=window).mean()
    return [None if pd.isna(v) else round(v, 2) for v in result]


def rsi(prices: list[float], window: int = 14) -> list[float | None]:
    """
    Relative Strength Index -- momentum indicator, 0-100.
    Above 70 is generally considered 'overbought', below 30 'oversold'.
    """
    series = pd.Series(prices)
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=window).mean()
    avg_loss = loss.rolling(window=window).mean()

    rs = avg_gain / avg_loss.replace(0, 1e-10)  # avoid divide-by-zero
    result = 100 - (100 / (1 + rs))
    return [None if pd.isna(v) else round(v, 2) for v in result]


def macd(prices: list[float], fast: int = 12, slow: int = 26, signal: int = 9):
    """
    MACD (Moving Average Convergence Divergence).
    Returns three lists: macd_line, signal_line, histogram.
    """
    series = pd.Series(prices)
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line

    clean = lambda s: [None if pd.isna(v) else round(v, 2) for v in s]
    return clean(macd_line), clean(signal_line), clean(histogram)


def bollinger_bands(prices: list[float], window: int = 20, num_std: int = 2):
    """
    Bollinger Bands -- a middle SMA line with upper/lower bands
    `num_std` standard deviations away. Price near the bands suggests
    the asset is relatively over/under-extended.
    """
    series = pd.Series(prices)
    middle = series.rolling(window=window).mean()
    std = series.rolling(window=window).std()
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)

    clean = lambda s: [None if pd.isna(v) else round(v, 2) for v in s]
    return clean(upper), clean(middle), clean(lower)


def all_indicators(prices: list[float]) -> dict:
    """Convenience function: compute everything at once for the /indicators endpoint."""
    macd_line, signal_line, hist = macd(prices)
    upper, middle, lower = bollinger_bands(prices)
    return {
        "sma_20": sma(prices, 20),
        "rsi_14": rsi(prices, 14),
        "macd_line": macd_line,
        "macd_signal": signal_line,
        "macd_histogram": hist,
        "bollinger_upper": upper,
        "bollinger_middle": middle,
        "bollinger_lower": lower,
    }
