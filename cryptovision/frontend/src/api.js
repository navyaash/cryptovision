import axios from "axios";

// Set VITE_API_URL in a .env file when deploying (points at your live backend).
// Falls back to localhost for local development.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE });

// Attach the JWT to every request automatically, if we have one stored.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cryptovision_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token expires/becomes invalid, boot the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cryptovision_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (email, password) => api.post("/auth/register", { email, password }),
  login: (email, password) => {
    // FastAPI's OAuth2PasswordRequestForm expects form-encoded data, not JSON
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  me: () => api.get("/auth/me"),
};

export const coins = {
  list: (limit = 50) => api.get(`/coins?limit=${limit}`),
  ohlc: (coinId, days = 30) => api.get(`/coins/${coinId}/ohlc?days=${days}`),
  indicators: (coinId, days = 90) => api.get(`/coins/${coinId}/indicators?days=${days}`),
};

export const predict = {
  forCoin: (coinId) => api.get(`/predict/${coinId}`),
};

export const trade = {
  buy: (coinId, quantity) => api.post("/trade/buy", { coin_id: coinId, quantity }),
  sell: (coinId, quantity) => api.post("/trade/sell", { coin_id: coinId, quantity }),
  history: () => api.get("/trade/history"),
  portfolio: () => api.get("/trade/portfolio"),
};

export const watchlist = {
  list: () => api.get("/watchlist"),
  add: (coinId) => api.post("/watchlist", { coin_id: coinId }),
  remove: (coinId) => api.delete(`/watchlist/${coinId}`),
};

export const sentiment = {
  fearGreed: () => api.get("/sentiment/fear-greed"),
  news: (limit = 8) => api.get(`/sentiment/news?limit=${limit}`),
};

export default api;
