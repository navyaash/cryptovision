function lastValid(arr) {
  if (!arr) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i];
  }
  return null;
}

export default function IndicatorPanel({ indicators, prediction }) {
  if (!indicators) {
    return <div className="loading-state">Loading indicators...</div>;
  }

  const rsi = lastValid(indicators.rsi_14);
  const macdLine = lastValid(indicators.macd_line);
  const macdSignal = lastValid(indicators.macd_signal);
  const bbUpper = lastValid(indicators.bollinger_upper);
  const bbLower = lastValid(indicators.bollinger_lower);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Indicators</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <IndicatorRow
          label="RSI (14)"
          value={rsi?.toFixed(1)}
          hint={rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}
        />
        <IndicatorRow
          label="MACD"
          value={macdLine?.toFixed(2)}
          hint={macdLine > macdSignal ? "Bullish crossover" : "Bearish crossover"}
        />
        <IndicatorRow label="Bollinger Upper" value={bbUpper ? `$${bbUpper.toLocaleString()}` : "--"} />
        <IndicatorRow label="Bollinger Lower" value={bbLower ? `$${bbLower.toLocaleString()}` : "--"} />
      </div>

      {prediction && (
        <div style={{ borderTop: "1px solid var(--border-soft)", marginTop: 16, paddingTop: 16 }}>
          <div className="text-muted" style={{ fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            LSTM Next-Day Forecast
          </div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 500 }}>
            ${prediction.predicted_price?.toLocaleString()}
          </div>
          <div className={prediction.change_pct >= 0 ? "text-positive" : "text-negative"} style={{ fontSize: 13, marginTop: 2 }}>
            {prediction.change_pct >= 0 ? "+" : ""}
            {prediction.change_pct}% vs current
          </div>
          <div className="text-faint" style={{ fontSize: 11, marginTop: 6 }}>
            method: {prediction.method}
          </div>
        </div>
      )}
    </div>
  );
}

function IndicatorRow({ label, value, hint }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="text-muted" style={{ fontSize: 13 }}>
        {label}
      </span>
      <div style={{ textAlign: "right" }}>
        <span className="mono" style={{ fontSize: 14 }}>
          {value ?? "--"}
        </span>
        {hint && (
          <div className="text-faint" style={{ fontSize: 11 }}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
