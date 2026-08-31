function classificationColor(classification) {
  if (!classification) return "var(--text-muted)";
  const c = classification.toLowerCase();
  if (c.includes("extreme fear") || c.includes("fear")) return "var(--negative)";
  if (c.includes("extreme greed") || c.includes("greed")) return "var(--positive)";
  return "var(--warning)";
}

export default function SentimentWidget({ fearGreed, news }) {
  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <div className="panel-header">
        <h2>Market Sentiment</h2>
      </div>

      {fearGreed ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <div
            className="mono"
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: classificationColor(fearGreed.classification),
            }}
          >
            {fearGreed.value}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: classificationColor(fearGreed.classification) }}>
              {fearGreed.classification}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Fear &amp; Greed Index
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-state">Loading sentiment...</div>
      )}

      <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 14 }}>
        <div className="text-muted" style={{ fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Latest News
        </div>
        {news && news.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {news.slice(0, 5).map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, lineHeight: 1.4, display: "block" }}
              >
                <div style={{ color: "var(--text-primary)" }}>{article.title}</div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                  {article.source}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="loading-state">Loading news...</div>
        )}
      </div>
    </div>
  );
}
