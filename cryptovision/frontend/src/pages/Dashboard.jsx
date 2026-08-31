import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CoinTable from "../components/CoinTable";
import CandlestickChart from "../components/CandlestickChart";
import PriceLineChart from "../components/PriceLineChart";
import IndicatorPanel from "../components/IndicatorPanel";
import SentimentWidget from "../components/SentimentWidget";
import { coins, predict, sentiment } from "../api";

export default function Dashboard() {
  const [coinsData, setCoinsData] = useState([]);
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
  const [ohlcData, setOhlcData] = useState(null);
  const [indicatorsData, setIndicatorsData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [news, setNews] = useState(null);
  const [chartView, setChartView] = useState("line"); // "line" | "candlestick"

  // load the coin list + sentiment once on mount
  useEffect(() => {
    coins.list(50).then((res) => setCoinsData(res.data)).catch(() => {});
    sentiment.fearGreed().then((res) => setFearGreed(res.data)).catch(() => {});
    sentiment.news(6).then((res) => setNews(res.data)).catch(() => {});
  }, []);

  // reload chart + indicators + prediction whenever the selected coin changes
  useEffect(() => {
    if (!selectedCoinId) return;
    setOhlcData(null);
    setIndicatorsData(null);
    setPrediction(null);

    coins.ohlc(selectedCoinId, 30).then((res) => setOhlcData(res.data)).catch(() => {});
    coins.indicators(selectedCoinId, 90).then((res) => setIndicatorsData(res.data)).catch(() => {});
    predict.forCoin(selectedCoinId).then((res) => setPrediction(res.data)).catch(() => {});
  }, [selectedCoinId]);

  const selectedCoin = coinsData.find((c) => c.id === selectedCoinId);

  // build the SMA overlay line in the {time, value} shape the chart expects,
  // aligned against the same day range as the OHLC candles
  const smaLine =
    ohlcData && indicatorsData
      ? ohlcData
          .map(([ts], i) => {
            const smaSlice = indicatorsData.sma_20.slice(-ohlcData.length);
            const value = smaSlice[i];
            return value != null ? { time: Math.floor(ts / 1000), value } : null;
          })
          .filter(Boolean)
      : [];

  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Real-time prices, charts, and market sentiment.</p>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <div>
            <div className="panel">
              <div className="panel-header">
                <h2>
                  {selectedCoin ? `${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()})` : "Select a coin"}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      className="btn"
                      style={{
                        fontSize: 12,
                        padding: "5px 10px",
                        background: chartView === "line" ? "var(--accent)" : "var(--bg-panel-raised)",
                        color: chartView === "line" ? "#0B0D12" : "var(--text-primary)",
                        borderColor: chartView === "line" ? "var(--accent)" : "var(--border)",
                      }}
                      onClick={() => setChartView("line")}
                    >
                      Line
                    </button>
                    <button
                      className="btn"
                      style={{
                        fontSize: 12,
                        padding: "5px 10px",
                        background: chartView === "candlestick" ? "var(--accent)" : "var(--bg-panel-raised)",
                        color: chartView === "candlestick" ? "#0B0D12" : "var(--text-primary)",
                        borderColor: chartView === "candlestick" ? "var(--accent)" : "var(--border)",
                      }}
                      onClick={() => setChartView("candlestick")}
                    >
                      Candlestick
                    </button>
                  </div>
                  {selectedCoin && (
                    <span className="mono" style={{ fontSize: 18 }}>
                      ${selectedCoin.current_price?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {ohlcData ? (
                chartView === "line" ? (
                  <PriceLineChart ohlcData={ohlcData} />
                ) : (
                  <CandlestickChart ohlcData={ohlcData} smaLine={smaLine} />
                )
              ) : (
                <div className="loading-state">Loading chart...</div>
              )}
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
              <div className="panel-header">
                <h2>Top Coins</h2>
              </div>
              <CoinTable coinsData={coinsData} onSelectCoin={setSelectedCoinId} selectedCoinId={selectedCoinId} />
            </div>
          </div>

          <div>
            <IndicatorPanel indicators={indicatorsData} prediction={prediction} />
            <SentimentWidget fearGreed={fearGreed} news={news} />
          </div>
        </div>
      </div>
    </div>
  );
}
