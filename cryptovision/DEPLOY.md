# Deploying CryptoVision

Backend on **Render**, frontend on **Vercel**. Do the backend first -- the
frontend needs its live URL.

> **Important:** this repo has a nested folder. The app lives in
> `cryptovision/` *inside* the repo, so every "Root Directory" below is
> `cryptovision/backend` or `cryptovision/frontend`, **not** `backend`/`frontend`.
> Getting this wrong is what produces `sh: line 1: vite: command not found`.

---

## 1. Push to GitHub

```bash
git add .
git commit -m "ready to deploy"
git push
```

Never commit `node_modules/` or `venv/`. The repo's `.gitignore` covers both.
A committed `node_modules` is platform-specific and **will** break Vercel's
Linux build even though it works on your machine.

---

## 2. Deploy the backend (Render)

1. [render.com](https://render.com) -> sign in with GitHub.
2. **New +** -> **Web Service** -> connect the `cryptovision` repo.
3. Configure:
   - **Root Directory**: `cryptovision/backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
4. Environment variables:
   - `JWT_SECRET_KEY` -> a long random string. Generate one with:
     `python -c "import secrets; print(secrets.token_urlsafe(48))"`
   - `FRONTEND_ORIGIN` -> leave blank for now; set it in step 4.
5. **Create Web Service**. You get a URL like
   `https://cryptovision-backend.onrender.com` -- save it.

### Add Postgres (recommended)

Render's free filesystem is ephemeral -- with SQLite, every user account and
trade is wiped on each deploy and each cold start.

1. **New +** -> **PostgreSQL** -> Free -> Create.
2. Copy the **Internal Database URL**.
3. Web service -> Environment -> add `DATABASE_URL` with that value.
4. Redeploy.

The app normalises Render's `postgres://` scheme to the `postgresql://` form
SQLAlchemy 2.x requires, and `psycopg2-binary` is already in
`requirements.txt`, so this needs no code changes.

> Free tier: services sleep after 15 minutes idle and take 30-60s to wake.
> Worth mentioning to an interviewer if the first load is slow.

---

## 3. Deploy the frontend (Vercel)

1. [vercel.com](https://vercel.com) -> sign in with GitHub.
2. **Add New** -> **Project** -> import the `cryptovision` repo.
3. Configure:
   - **Root Directory**: `cryptovision/frontend`  <- **must include the `cryptovision/` prefix**
   - **Framework Preset**: Vite (auto-detected)
4. Environment variable:
   - `VITE_API_URL` -> your Render backend URL, no trailing slash
     (e.g. `https://cryptovision-backend.onrender.com`)
5. **Deploy**.

`vercel.json` adds an SPA rewrite so refreshing on `/trade` or `/watchlist`
serves `index.html` instead of 404ing.

> `VITE_API_URL` is baked in at **build** time, not read at runtime. If you
> change it later you must redeploy for it to take effect.

---

## 4. Connect them (CORS)

Render -> web service -> Environment -> set `FRONTEND_ORIGIN` to your exact
Vercel URL, scheme included and **no trailing slash**:

```
https://cryptovision.vercel.app
```

Redeploy the backend. `main.py` passes this straight into
`allow_origins`, so a trailing slash or a missing `https://` silently breaks
every request with a CORS error.

---

## 5. Test it

Visit the Vercel URL, register, and confirm prices load, a buy works, and the
dashboard renders. Slow first load = Render waking up.

---

## Notes on two features

**LSTM predictions.** `torch` is intentionally *not* in `requirements.txt`:
it is ~530 MB installed and will not fit Render's 512 MB free tier. Deployed
on the free tier, `/predict` returns `"method": "trend_fallback"` (a linear
trend estimate) rather than crashing. To run the genuine LSTM:

- **Locally** (recommended for demos):
  `pip install -r requirements-ml.txt --index-url https://download.pytorch.org/whl/cpu`
- **Deployed:** needs an instance with >= 2 GB RAM (Render Standard, or
  Fly.io / Railway). Note the free tier's 0.1 CPU would also make per-request
  training very slow.

Check which one ran via the `method` field in the `/predict` response.

**News headlines.** CryptoCompare's news feed now requires an API key. Without
one the widget shows "No news available" and everything else works. To enable
it, get a free key at cryptocompare.com and set `CRYPTOCOMPARE_API_KEY` on the
backend.

---

## Links for your resume

- **GitHub**: `https://github.com/navyaash/cryptovision`
- **Live**: your Vercel URL
