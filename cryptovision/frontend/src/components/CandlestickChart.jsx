import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

/**
 * Renders an OHLC candlestick chart with an optional SMA-20 overlay line.
 * ohlcData: array of [timestamp_ms, open, high, low, close] (CoinGecko's format)
 * smaLine: optional array of {time, value} matching the same date range
 */
export default function CandlestickChart({ ohlcData, smaLine }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8B90A0",
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1B1F29" },
        horzLines: { color: "#1B1F29" },
      },
      rightPriceScale: { borderColor: "#232733" },
      timeScale: { borderColor: "#232733" },
      width: containerRef.current.clientWidth,
      height: 340,
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#34D399",
      downColor: "#F87171",
      borderVisible: false,
      wickUpColor: "#34D399",
      wickDownColor: "#F87171",
    });

    if (ohlcData && ohlcData.length > 0) {
      const formatted = ohlcData.map(([ts, open, high, low, close]) => ({
        time: Math.floor(ts / 1000),
        open,
        high,
        low,
        close,
      }));
      candleSeries.setData(formatted);
    }

    if (smaLine && smaLine.length > 0) {
      const smaSeries = chart.addLineSeries({
        color: "#5EEAD4",
        lineWidth: 1,
        priceLineVisible: false,
      });
      smaSeries.setData(smaLine);
    }

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [ohlcData, smaLine]);

  return <div ref={containerRef} style={{ width: "100%" }} />;
}
