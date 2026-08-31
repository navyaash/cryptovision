# Deploying CryptoVision

Two parts: backend on **Render** (free tier), frontend on **Vercel** (free tier).
Do the backend first -- the frontend needs its live URL.

---

## 1. Push to GitHub

```bash
cd cryptovision
git init
git add .
git commit -m "initial commit"
```
Create a new repo on github.com (e.g. `cryptovision`), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/cryptovision.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy the backend (Render)

1. Go to [render.com](https://render.com) → sign in with GitHub.
2. **New +** → **Web Service** → connect your `cryptovision` repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
4. Add environment variables (Render dashboard → Environment):
   - `JWT_SECRET_KEY` → any long random string
   - `FRONTEND_ORIGIN` → leave blank for now, you'll set it after step 3
5. Click **Create Web Service**. First deploy takes a few minutes (PyTorch is
   a large dependency). Render gives you a URL like
   `https://cryptovision-backend.onrender.com` -- save it.

**Optional but recommended -- add a real Postgres database** (matches your
resume claim exactly, and free-tier SQLite on Render doesn't persist between
deploys):
1. Render dashboard → **New +** → **PostgreSQL** → Free tier → Create.
2. Copy the **Internal Database URL** it gives you.
3. Go back to your web service → Environment → add `DATABASE_URL` with that value.
4. Redeploy. Your app now uses real PostgreSQL, exactly as the resume states.

> Free tier note: Render's free web services spin down after 15 minutes of
> inactivity and take ~30-60 seconds to wake back up on the next request.
> This is normal and worth mentioning if an interviewer notices a slow first load.

---

## 3. Deploy the frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New** → **Project** → import your `cryptovision` repo.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
4. Add environment variable:
   - `VITE_API_URL` → your Render backend URL from step 2 (e.g.
     `https://cryptovision-backend.onrender.com`)
5. Click **Deploy**. Vercel gives you a URL like
   `https://cryptovision.vercel.app`.

---

## 4. Connect them (CORS)

Go back to Render → your web service → Environment → set:
- `FRONTEND_ORIGIN` → your Vercel URL (e.g. `https://cryptovision.vercel.app`)

Redeploy the backend. This tells it to only accept requests from your actual
frontend, not just anyone.

---

## 5. Test it

Visit your Vercel URL, register an account, and confirm you can see live
prices, buy a coin, and check the dashboard. If the first load is slow,
that's Render's free tier waking up -- refresh after ~30 seconds.

---

## Put these links on your resume

- **GitHub**: `https://github.com/YOUR_USERNAME/cryptovision`
- **Live**: your Vercel URL
