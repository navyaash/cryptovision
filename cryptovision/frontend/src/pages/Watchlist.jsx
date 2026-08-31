import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { coins, watchlist } from "../api";

export default function Watchlist() {
  const [coinsData, setCoinsData] = useState([]);
  const [watchedIds, setWatchedIds] = useState([]);
  const [addCoinId, setAddCoinId] = useState("");

  function refreshWatchlist() {
    watchlist.list().then((res) => setWatchedIds(res.data.map((w) => w.coin_id))).catch(() => {});
  }

  useEffect(() => {
    coins.list(100).then((res) => setCoinsData(res.data)).catch(() => {});
    refreshWatchlist();
  }, []);

  async function handleAdd() {
    if (!addCoinId) return;
    try {
      await watchlist.add(addCoinId);
      refreshWatchlist();
      setAddCoinId("");
    } catch {
      // likely "already in watchlist" -- ignore, list will just stay as-is
    }
  }

  async function handleRemove(coinId) {
    await watchlist.remove(coinId);
    refreshWatchlist();
  }

  const watchedCoins = coinsData.filter((c) => watchedIds.includes(c.id));
  const availableToAdd = coinsData.filter((c) => !watchedIds.includes(c.id));

  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <h1>Watchlist</h1>
        <p className="page-subtitle">Coins you're keeping an eye on.</p>

        <div className="panel" style={{ marginTop: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Add a coin</label>
              <select
                value={addCoinId}
                onChange={(e) => setAddCoinId(e.target.value)}
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  color: "var(--text-primary)",
                  fontSize: 14,
                }}
              >
                <option value="">Select a coin...</option>
                {availableToAdd.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleAdd} disabled={!addCoinId}>
              Add
            </button>
          </div>
        </div>

        <div className="panel">
          {watchedCoins.length === 0 ? (
            <div className="empty-state">Your watchlist is empty -- add a coin above.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Price</th>
                  <th>24h</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {watchedCoins.map((coin) => {
                  const change = coin.price_change_percentage_24h;
                  const isPositive = change >= 0;
                  return (
                    <tr key={coin.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={coin.image} alt="" width={20} height={20} style={{ borderRadius: "50%" }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{coin.name}</div>
                            <div className="text-muted" style={{ fontSize: 12, textTransform: "uppercase" }}>
                              {coin.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="mono">${coin.current_price?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${isPositive ? "badge-positive" : "badge-negative"}`}>
                          {isPositive ? "+" : ""}
                          {change?.toFixed(2)}%
                        </span>
                      </td>
                      <td>
                        <button className="btn" onClick={() => handleRemove(coin.id)} style={{ fontSize: 12, padding: "6px 10px" }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
