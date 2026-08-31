# CryptoVision

Real-time cryptocurrency analytics and price prediction platform. React frontend,
FastAPI backend, LSTM price prediction, PostgreSQL-ready database, virtual trading
engine, JWT auth, and live market sentiment.

## What's actually in here

- **Live prices & charts** for 50+ coins (CoinGecko API). Two chart types on the
  dashboard, toggleable: a simple line chart (`PriceLineChart.jsx`, built with
  `recharts` — easy to explain) and a candlestick chart (`CandlestickChart.jsx`,
  built with TradingView's `lightweight-charts` — more advanced, matches the
  resume claim). Start explanations with the line chart if you're newer to this.
- **Technical indicators**: SMA, RSI, MACD, Bollinger Bands -- computed server-side
  with pandas from real price history.
- **LSTM price prediction**: a small PyTorch LSTM trains fresh on each request using
  the last 90 days of a coin's price history, then predicts the next day's close.
  See `backend/app/lstm_model.py` -- it's heavily commented, read that file to
  understand exactly what it's doing.
- **Virtual trading engine**: JWT-authenticated users get a $10,000 virtual balance,
  can buy/sell any coin at its live price, and see real-time profit & loss based on
  average cost basis.
- **Market sentiment**: Fear & Greed Index + live crypto news headlines.
- **Watchlist**: star coins to track them separately from the main list.

## Project structure

```
cryptovision/
├── backend/               FastAPI app
│   ├── app/
│   │   ├── main.py        entrypoint, wires everything together
│   │   ├── models.py      database tables (SQLAlchemy)
│   │   ├── schemas.py     API request/response shapes (Pydantic)
│   │   ├── auth.py        JWT + password hashing
│   │   ├── coingecko.py   external API wrapper, with caching
│   │   ├── indicators.py  SMA/RSI/MACD/Bollinger math
│   │   ├── lstm_model.py  the LSTM prediction model
│   │   └── routers/       one file per API resource (auth, coins, trade, ...)
│   └── requirements.txt
├── frontend/               React app (Vite)
│   └── src/
│       ├── pages/          Login, Register, Dashboard, Trade, Watchlist
│       ├── components/     Navbar, CoinTable, CandlestickChart, etc.
│       └── api.js          all backend calls live here
└── DEPLOY.md               step-by-step deployment guide
```

## Running it locally

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

**Frontend** (separate terminal):
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend runs at `http://localhost:5173`.

Register an account, and you're in.

## Understanding the codebase (do this before your interview)

Read files in this order -- each one is commented to explain *why*, not just *what*:

1. `backend/app/models.py` -- the 4 database tables. Understand these first;
   everything else builds on them.
2. `backend/app/auth.py` -- how JWT login actually works end to end.
3. `backend/app/routers/trade.py` -- the trading engine, especially
   `_compute_holdings()`, which replays transaction history to figure out
   P&L. This is the most "interview-able" piece of logic in the project.
4. `backend/app/indicators.py` -- straightforward math, good to be able to
   explain what RSI/MACD/Bollinger actually mean.
5. `backend/app/lstm_model.py` -- read the module docstring at the top first,
   it explains the whole training process in plain English before you look
   at the PyTorch code.
6. `frontend/src/api.js` -- how the frontend talks to the backend (every API
   call in the app goes through this one file).

## Likely interview questions and where to look

- **"Walk me through what happens when I click Buy."**
  `Trade.jsx` → `handleTrade()` → `api.js` → `trade.buy()` → hits `POST /trade/buy`
  → `routers/trade.py` → `buy_coin()` fetches the live price from CoinGecko,
  checks the wallet balance, deducts it, logs a `Transaction` row.

- **"How do you calculate profit and loss?"**
  `_compute_holdings()` in `routers/trade.py` replays every transaction in
  order and tracks an *average cost basis* per coin -- the standard way to
  handle P&L when someone buys the same asset at different prices over time.

- **"Why LSTM instead of a simpler model?"**
  LSTMs are designed for sequences (time-series) -- they carry a "memory" of
  recent price movement forward, which a plain linear regression can't do.
  Be honest that this is a small, fast-training demo model (30 epochs, 10-day
  window) — not a production trading signal.

- **"How does the JWT auth work?"**
  Password is hashed with bcrypt at registration (never stored in plain
  text). On login, we verify the hash and issue a signed token containing
  the user's id + expiry. Every protected request sends that token in the
  `Authorization` header; `get_current_user()` in `auth.py` decodes and
  verifies it.

- **"What if PyTorch fails to install on your host?"**
  `lstm_model.py` catches the import and falls back to a simple linear-trend
  estimate instead of crashing -- the `/predict` endpoint always returns
  something, and the response tells you which method actually ran.

## Deployment

See `DEPLOY.md` for exact steps to deploy the backend to Render and the
frontend to Vercel, both on free tiers.
