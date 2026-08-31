import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

/**
 * Bar chart comparing your profit/loss across each coin you hold.
 * One bar per coin -- green if it's in profit, red if it's at a loss.
 *
 * Like PriceLineChart, this uses recharts' simple declarative style:
 * pass in an array of objects, map each field to a chart element with
 * dataKey, done. Good to know cold for an interview walkthrough.
 */
export default function PortfolioBarChart({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return <div className="empty-state">Buy a coin to see your P&amp;L chart here.</div>;
  }

  const data = holdings.map((h) => ({
    name: h.coin_id.slice(0, 3).toUpperCase(),
    profit_loss: h.profit_loss,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid stroke="#1B1F29" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#565B6B"
          fontSize={11}
          fontFamily="IBM Plex Mono, monospace"
          tickLine={false}
          axisLine={{ stroke: "#232733" }}
        />
        <YAxis
          stroke="#565B6B"
          fontSize={11}
          fontFamily="IBM Plex Mono, monospace"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
          width={60}
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
          formatter={(value) => [`$${value.toLocaleString()}`, "P&L"]}
        />
        <Bar dataKey="profit_loss" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.profit_loss >= 0 ? "#34D399" : "#F87171"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
