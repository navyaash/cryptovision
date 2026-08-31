function formatPrice(price) {
  if (price == null) return "--";
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function CoinTable({ coinsData, onSelectCoin, selectedCoinId }) {
  if (!coinsData || coinsData.length === 0) {
    return <div className="loading-state">Loading coin prices...</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Coin</th>
          <th>Price</th>
          <th>24h</th>
          <th>Market Cap</th>
        </tr>
      </thead>
      <tbody>
        {coinsData.map((coin) => {
          const change = coin.price_change_percentage_24h;
          const isPositive = change >= 0;
          const isSelected = coin.id === selectedCoinId;
          return (
            <tr
              key={coin.id}
              onClick={() => onSelectCoin(coin.id)}
              style={isSelected ? { background: "var(--bg-panel-raised)" } : undefined}
            >
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
              <td className="mono">{formatPrice(coin.current_price)}</td>
              <td>
                <span className={`badge ${isPositive ? "badge-positive" : "badge-negative"}`}>
                  {isPositive ? "+" : ""}
                  {change?.toFixed(2)}%
                </span>
              </td>
              <td className="mono text-muted">
                ${coin.market_cap?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
