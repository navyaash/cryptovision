import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/**
 * A plain line chart of closing price over time.
 *
 * This is intentionally simple -- compare it to CandlestickChart.jsx. This one
 * uses recharts: you just hand it an array of {date, price} objects and it
 * draws the line for you. Good one to lead with in an interview if you're
 * asked "walk me through your charting code" -- it's much easier to explain
 * line-by-line than the candlestick chart.
 *
 * ohlcData: same [timestamp, open, high, low, close] array the candlestick
 * chart uses -- we just pull out the closing price and the date here.
 */
export default function PriceLineChart({ ohlcData }) {
  if (!ohlcData || ohlcData.length === 0) {
    return <div className="loading-state">Loading price history...</div>;
  }

  // Turn CoinGecko's [timestamp, open, high, low, close] rows into
  // {date, price} objects, which is the shape recharts wants.
  const data = ohlcData.map(([timestamp, open, high, low, close]) => ({
    date: new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    price: close,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="#1B1F29" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#565B6B"
          fontSize={11}
          fontFamily="IBM Plex Mono, monospace"
          tickLine={false}
          axisLine={{ stroke: "#232733" }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#565B6B"
          fontSize={11}
          fontFamily="IBM Plex Mono, monospace"
          tickLine={false}
          axisLine={false}
          domain={["auto", "auto"]}
          tickFormatter={(v) => `$${v.toLocaleString()}`}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: "#171B24",
            border: "1px solid #232733",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "IBM Plex Mono, monospace",
          }}
          labelStyle={{ color: "#8B90A0" }}
          formatter={(value) => [`$${value.toLocaleString()}`, "Price"]}
        />
        <Line type="monotone" dataKey="price" stroke="#5EEAD4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
