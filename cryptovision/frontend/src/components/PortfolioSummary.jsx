import PortfolioBarChart from "./PortfolioBarChart";

export default function PortfolioSummary({ portfolio }) {
  if (!portfolio) {
    return <div className="loading-state">Loading portfolio...</div>;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Portfolio</h2>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value">${portfolio.usd_balance.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Value</div>
          <div className="stat-value">${portfolio.total_portfolio_value.toLocaleString()}</div>
        </div>
      </div>

      {portfolio.holdings.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="text-muted" style={{ fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Profit / Loss by Coin
          </div>
          <PortfolioBarChart holdings={portfolio.holdings} />
        </div>
      )}

      {portfolio.holdings.length === 0 ? (
        <div className="empty-state">No holdings yet -- head to the Trade page to buy your first coin.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Coin</th>
              <th>Qty</th>
              <th>Avg Cost</th>
              <th>Value</th>
              <th>P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings.map((h) => (
              <tr key={h.coin_id}>
                <td style={{ textTransform: "capitalize" }}>{h.coin_id.replace(/-/g, " ")}</td>
                <td className="mono">{h.quantity}</td>
                <td className="mono">${h.avg_buy_price.toLocaleString()}</td>
                <td className="mono">${h.current_value.toLocaleString()}</td>
                <td className={h.profit_loss >= 0 ? "text-positive" : "text-negative"}>
                  <span className="mono">
                    {h.profit_loss >= 0 ? "+" : ""}${h.profit_loss.toLocaleString()}
                  </span>
                  <div style={{ fontSize: 11 }}>
                    ({h.profit_loss_pct >= 0 ? "+" : ""}
                    {h.profit_loss_pct}%)
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
