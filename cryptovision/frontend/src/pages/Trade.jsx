import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PortfolioSummary from "../components/PortfolioSummary";
import { coins, trade } from "../api";

export default function Trade() {
  const [coinsData, setCoinsData] = useState([]);
  const [coinId, setCoinId] = useState("bitcoin");
  const [quantity, setQuantity] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [submitting, setSubmitting] = useState(false);

  function refreshPortfolio() {
    trade.portfolio().then((res) => setPortfolio(res.data)).catch(() => {});
    trade.history().then((res) => setHistory(res.data)).catch(() => {});
  }

  useEffect(() => {
    coins.list(50).then((res) => setCoinsData(res.data)).catch(() => {});
    refreshPortfolio();
  }, []);

  const selectedCoin = coinsData.find((c) => c.id === coinId);

  async function handleTrade(side) {
    setMessage(null);
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setMessage({ type: "error", text: "Enter a valid quantity." });
      return;
    }

    setSubmitting(true);
    try {
      const action = side === "buy" ? trade.buy : trade.sell;
      const res = await action(coinId, qty);
      setMessage({
        type: "success",
        text: `${side === "buy" ? "Bought" : "Sold"} ${qty} ${coinId} at $${res.data.price_usd.toLocaleString()}`,
      });
      setQuantity("");
      refreshPortfolio();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.detail || "Trade failed." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <h1>Trade</h1>
        <p className="page-subtitle">Buy and sell with your virtual $10,000 balance.</p>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <div>
            <div className="panel">
              <div className="panel-header">
                <h2>Place an order</h2>
              </div>

              {message && (
                <div
                  className={message.type === "error" ? "auth-error" : "auth-error"}
                  style={
                    message.type === "success"
                      ? {
                          background: "rgba(52, 211, 153, 0.1)",
                          borderColor: "rgba(52, 211, 153, 0.3)",
                          color: "var(--positive)",
                        }
                      : undefined
                  }
                >
                  {message.text}
                </div>
              )}

              <div className="field">
                <label>Coin</label>
                <select
                  value={coinId}
                  onChange={(e) => setCoinId(e.target.value)}
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "10px 12px",
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                >
                  {coinsData.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCoin && (
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
                  Current price:{" "}
                  <span className="mono" style={{ color: "var(--text-primary)" }}>
                    ${selectedCoin.current_price?.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="field">
                <label>Quantity</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {quantity && selectedCoin && (
                <div className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
                  Est. total:{" "}
                  <span className="mono" style={{ color: "var(--text-primary)" }}>
                    ${(parseFloat(quantity || 0) * selectedCoin.current_price).toLocaleString()}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={submitting} onClick={() => handleTrade("buy")}>
                  Buy
                </button>
                <button className="btn btn-negative" style={{ flex: 1 }} disabled={submitting} onClick={() => handleTrade("sell")}>
                  Sell
                </button>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
              <div className="panel-header">
                <h2>Transaction History</h2>
              </div>
              {history.length === 0 ? (
                <div className="empty-state">No transactions yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Coin</th>
                      <th>Side</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((t) => (
                      <tr key={t.id}>
                        <td style={{ textTransform: "capitalize" }}>{t.coin_id.replace(/-/g, " ")}</td>
                        <td className={t.side === "buy" ? "text-positive" : "text-negative"}>{t.side}</td>
                        <td className="mono">{t.quantity}</td>
                        <td className="mono">${t.price_usd.toLocaleString()}</td>
                        <td className="mono">${t.total_usd.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div>
            <PortfolioSummary portfolio={portfolio} />
          </div>
        </div>
      </div>
    </div>
  );
}
