"""
LSTM price prediction.

How it works, in plain terms:
  1. Take the last N days of closing prices for a coin.
  2. Normalize them to a 0-1 range (neural nets train better on small numbers).
  3. Slide a window of size WINDOW across that history: each window of
     WINDOW days becomes one training example, and the price right after
     the window is the "label" the model tries to predict.
  4. Train a small LSTM (1 layer, HIDDEN_SIZE units) for a handful of
     epochs on those examples.
  5. Feed it the most recent WINDOW days to predict tomorrow's price.

This trains fresh, per request, on real CoinGecko history -- there's no
pre-trained model file. That keeps the project simple to deploy (nothing
to version or store) at the cost of a ~1-2 second delay per prediction,
which is a fine trade-off for a demo.

If PyTorch isn't installed (e.g. a constrained free hosting tier refused
the install), we fall back to a simple linear-trend estimate instead of
crashing the endpoint. The API response tells you which one ran, via
the "method" field, so this is never silently misleading.
"""
import numpy as np

WINDOW = 10        # how many past days the model looks at to predict the next one
HIDDEN_SIZE = 32
EPOCHS = 30

try:
    import torch
    import torch.nn as nn

    TORCH_AVAILABLE = True

    class PricePredictorLSTM(nn.Module):
        def __init__(self, hidden_size: int = HIDDEN_SIZE):
            super().__init__()
            self.lstm = nn.LSTM(input_size=1, hidden_size=hidden_size, num_layers=1, batch_first=True)
            self.linear = nn.Linear(hidden_size, 1)

        def forward(self, x):
            # x shape: (batch, WINDOW, 1)
            out, _ = self.lstm(x)
            last_step = out[:, -1, :]     # only care about the final time step
            return self.linear(last_step)  # -> (batch, 1) predicted next price

except ImportError:
    TORCH_AVAILABLE = False


def _make_windows(normalized: np.ndarray, window: int):
    X, y = [], []
    for i in range(len(normalized) - window):
        X.append(normalized[i:i + window])
        y.append(normalized[i + window])
    return np.array(X), np.array(y)


def predict_next_price(prices: list[float]) -> dict:
    """
    Returns: {"predicted_price": float, "last_price": float,
              "change_pct": float, "method": "lstm" | "trend_fallback"}
    """
    if len(prices) < WINDOW + 5:
        raise ValueError(f"Need at least {WINDOW + 5} days of price history to predict.")

    prices_arr = np.array(prices, dtype=np.float32)
    last_price = float(prices_arr[-1])

    if not TORCH_AVAILABLE:
        return _trend_fallback(prices_arr, last_price)

    # --- normalize ---
    min_p, max_p = prices_arr.min(), prices_arr.max()
    span = max(max_p - min_p, 1e-8)
    normalized = (prices_arr - min_p) / span

    X, y = _make_windows(normalized, WINDOW)
    X = torch.tensor(X, dtype=torch.float32).unsqueeze(-1)  # (samples, WINDOW, 1)
    y = torch.tensor(y, dtype=torch.float32).unsqueeze(-1)  # (samples, 1)

    model = PricePredictorLSTM()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.MSELoss()

    model.train()
    for _ in range(EPOCHS):
        optimizer.zero_grad()
        pred = model(X)
        loss = loss_fn(pred, y)
        loss.backward()
        optimizer.step()

    # predict the day after the most recent WINDOW days
    model.eval()
    with torch.no_grad():
        last_window = torch.tensor(
            normalized[-WINDOW:], dtype=torch.float32
        ).reshape(1, WINDOW, 1)
        predicted_normalized = model(last_window).item()

    predicted_price = predicted_normalized * span + min_p
    change_pct = ((predicted_price - last_price) / last_price) * 100

    return {
        "predicted_price": round(float(predicted_price), 4),
        "last_price": round(last_price, 4),
        "change_pct": round(float(change_pct), 2),
        "method": "lstm",
    }


def _trend_fallback(prices_arr: np.ndarray, last_price: float) -> dict:
    """Simple linear-trend estimate, used only if PyTorch can't be imported."""
    recent = prices_arr[-WINDOW:]
    trend = np.polyfit(range(len(recent)), recent, 1)[0]  # slope of best-fit line
    predicted_price = last_price + trend
    change_pct = ((predicted_price - last_price) / last_price) * 100
    return {
        "predicted_price": round(float(predicted_price), 4),
        "last_price": round(last_price, 4),
        "change_pct": round(float(change_pct), 2),
        "method": "trend_fallback",
    }
