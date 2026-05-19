function Dashboard({ transactions }) {

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  /* Format Indian currency */
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(n));

  const cards = [
    {
      id: "balance",
      label: "Net Balance",
      value: (balance < 0 ? "−" : "") + fmt(balance),
      sub: `${savingsRate}% savings rate`,
      positive: balance >= 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
      accent: balance >= 0 ? "#c8a97e" : "#e07070",
      accentBg: balance >= 0 ? "rgba(200,169,126,.1)" : "rgba(224,112,112,.08)",
      accentBorder: balance >= 0 ? "rgba(200,169,126,.22)" : "rgba(224,112,112,.2)",
    },
    {
      id: "income",
      label: "Total Income",
      value: fmt(income),
      sub: `${transactions.filter((t) => t.type === "income").length} transactions`,
      positive: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      ),
      accent: "#6fcf6f",
      accentBg: "rgba(111,207,111,.08)",
      accentBorder: "rgba(111,207,111,.2)",
    },
    {
      id: "expense",
      label: "Total Expenses",
      value: fmt(expense),
      sub: `${transactions.filter((t) => t.type === "expense").length} transactions`,
      positive: false,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
          <polyline points="17 18 23 18 23 12"/>
        </svg>
      ),
      accent: "#e07070",
      accentBg: "rgba(224,112,112,.08)",
      accentBorder: "rgba(224,112,112,.2)",
    },
  ];

  return (
    <>
      <style>{`
        .db-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
          gap: clamp(10px, 2vw, 16px);
          margin-bottom: clamp(1.25rem, 3vw, 2rem);
        }

        .db-card {
          position: relative;
          border-radius: 14px;
          padding: clamp(16px, 2.5vw, 22px) clamp(18px, 3vw, 24px);
          background: var(--bg-card, rgba(22,20,14,0.75));
          border: 1px solid var(--border, rgba(200,169,126,0.14));
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          overflow: hidden;
          cursor: default;
          transition: transform .3s cubic-bezier(.22,1,.36,1),
                      border-color .3s ease,
                      box-shadow .3s ease;
        }
        .db-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(0,0,0,.35);
        }

        /* Shimmer bar at top of card */
        .db-card-bar {
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          border-radius: 14px 14px 0 0;
          opacity: .7;
        }

        /* Faint watermark circle */
        .db-card-bg-circle {
          position: absolute;
          bottom: -28px; right: -28px;
          width: 100px; height: 100px;
          border-radius: 50%;
          opacity: .06;
          pointer-events: none;
        }

        .db-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .db-label {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--text-muted, #8a8070);
        }

        .db-icon-wrap {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: transform .25s ease;
        }
        .db-card:hover .db-icon-wrap { transform: scale(1.08); }

        .db-value {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(1.4rem, 3.5vw, 2rem);
          font-weight: 700;
          line-height: 1.1;
          color: var(--text-primary, #e8e0d0);
          margin: 0 0 6px;
          letter-spacing: -.01em;
        }

        .db-sub {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 11px;
          font-weight: 400;
          color: var(--text-faint, #5a5040);
          letter-spacing: .03em;
        }

        /* Progress bar (income vs expense) */
        .db-progress-wrap {
          margin-top: clamp(12px, 2vw, 16px);
          padding: clamp(12px, 2vw, 16px) clamp(16px, 2.5vw, 20px);
          background: var(--bg-card, rgba(22,20,14,0.75));
          border: 1px solid var(--border, rgba(200,169,126,0.14));
          border-radius: 12px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          margin-bottom: clamp(1.25rem, 3vw, 2rem);
        }
        .db-progress-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 10px;
        }
        .db-progress-label {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 11px; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--text-muted, #8a8070);
        }
        .db-progress-pct {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: 12px; font-weight: 600;
          color: var(--text-primary, #e8e0d0);
        }
        .db-progress-track {
          height: 6px; border-radius: 99px;
          background: rgba(255,255,255,.06);
          overflow: hidden;
          position: relative;
        }
        .db-progress-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(to right, #6fcf6f, #c8a97e, #e07070);
          transition: width .8s cubic-bezier(.22,1,.36,1);
        }
        .db-progress-labels {
          display: flex; justify-content: space-between; margin-top: 6px;
        }
        .db-progress-side {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 10px; color: var(--text-faint, #5a5040);
        }
      `}</style>

      {/* ── Cards ── */}
      <div className="db-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="db-card"
            style={{ borderColor: card.accentBorder }}
          >
            {/* Top accent bar */}
            <div
              className="db-card-bar"
              style={{ background: `linear-gradient(to right, ${card.accent}, transparent)` }}
            />

            {/* BG watermark */}
            <div
              className="db-card-bg-circle"
              style={{ background: card.accent }}
            />

            {/* Header: label + icon */}
            <div className="db-card-header">
              <span className="db-label">{card.label}</span>
              <div
                className="db-icon-wrap"
                style={{ background: card.accentBg, color: card.accent }}
              >
                {card.icon}
              </div>
            </div>

            {/* Value */}
            <p
              className="db-value"
              style={{ color: card.id === "balance" ? card.accent : "var(--text-primary)" }}
            >
              {card.value}
            </p>

            {/* Sub label */}
            <p className="db-sub">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Spend ratio bar ── */}
      {income > 0 && (
        <div className="db-progress-wrap">
          <div className="db-progress-header">
            <span className="db-progress-label">Spend Ratio</span>
            <span className="db-progress-pct">
              {Math.min(Math.round((expense / income) * 100), 100)}% spent
            </span>
          </div>
          <div className="db-progress-track">
            <div
              className="db-progress-fill"
              style={{ width: `${Math.min((expense / income) * 100, 100)}%` }}
            />
          </div>
          <div className="db-progress-labels">
            <span className="db-progress-side">₹0</span>
            <span className="db-progress-side">{fmt(income)}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;