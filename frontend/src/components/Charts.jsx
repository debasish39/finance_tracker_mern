import { useMemo } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);

/* ── Palette ── */
const GREEN  = "#6fcf6f";
const RED    = "#e07070";
const GOLD   = "#c8a97e";
const MUTED  = "rgba(255,255,255,0.08)";

const CATEGORY_COLORS = [
  "#c8a97e","#6fcf6f","#7eb8c8","#c87eb8","#c8c07e",
  "#7ec8b8","#e07070","#909cf0","#e0a070","#70b0e0",
  "#b070e0","#70e0a0",
];

/* ── Shared tooltip / legend defaults ── */
const tooltipDefaults = {
  backgroundColor: "rgba(18,16,12,0.95)",
  titleColor: "#e8e0d0",
  bodyColor: "#a09880",
  borderColor: "rgba(200,169,126,0.25)",
  borderWidth: 1,
  padding: 12,
  cornerRadius: 10,
  titleFont: { family: "'Syne',sans-serif", size: 13, weight: "600" },
  bodyFont:  { family: "'Inter',sans-serif", size: 12 },
  callbacks: {
    label: (ctx) => {
      const val = ctx.parsed ?? ctx.raw ?? 0;
      const num = typeof val === "object" ? val.y ?? val : val;
      return ` ₹${new Intl.NumberFormat("en-IN").format(Math.round(num))}`;
    },
  },
};

const legendDefaults = {
  labels: {
    color: "#8a8070",
    font: { family: "'Inter',sans-serif", size: 11 },
    boxWidth: 10, boxHeight: 10, borderRadius: 3,
    padding: 16,
  },
};

/* ── Helpers ── */
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(n);

function Charts({ transactions }) {
  const income  = useMemo(() => transactions.filter(t => t.type === "income").reduce((a, t) => a + Number(t.amount), 0), [transactions]);
  const expense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((a, t) => a + Number(t.amount), 0), [transactions]);

  /* ── Category breakdown ── */
  const categoryData = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (!t.category) return;
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      labels: entries.map(([k]) => k),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length] + "cc"),
        borderColor:     entries.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]),
        borderWidth: 1.5,
        hoverOffset: 10,
      }],
    };
  }, [transactions]);

  /* ── Monthly trend (last 6 months) ── */
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        income: 0, expense: 0,
      });
    }
    transactions.forEach((t) => {
      if (!t.date) return;
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = months.find((x) => x.key === key);
      if (!m) return;
      if (t.type === "income")  m.income  += Number(t.amount);
      if (t.type === "expense") m.expense += Number(t.amount);
    });
    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Income",
          data: months.map((m) => m.income),
          borderColor: GREEN,
          backgroundColor: "rgba(111,207,111,0.08)",
          pointBackgroundColor: GREEN,
          pointRadius: 4, pointHoverRadius: 6,
          fill: true, tension: 0.4, borderWidth: 2,
        },
        {
          label: "Expense",
          data: months.map((m) => m.expense),
          borderColor: RED,
          backgroundColor: "rgba(224,112,112,0.06)",
          pointBackgroundColor: RED,
          pointRadius: 4, pointHoverRadius: 6,
          fill: true, tension: 0.4, borderWidth: 2,
        },
      ],
    };
  }, [transactions]);

  /* ── Income vs Expense bar ── */
  const barData = {
    labels: ["Income", "Expense"],
    datasets: [{
      label: "Amount",
      data: [income, expense],
      backgroundColor: [`${GREEN}bb`, `${RED}bb`],
      borderColor:     [GREEN, RED],
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  /* ── Overview pie ── */
  const pieData = {
    labels: ["Income", "Expense"],
    datasets: [{
      data: [income, expense],
      backgroundColor: [`${GREEN}bb`, `${RED}bb`],
      borderColor:     [GREEN, RED],
      borderWidth: 1.5,
      hoverOffset: 10,
    }],
  };

  /* ── Axis defaults ── */
  const axisStyle = {
    grid: { color: MUTED },
    ticks: {
      color: "#6a6050",
      font: { family: "'Inter',sans-serif", size: 10 },
      callback: (v) => `₹${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(v)}`,
    },
    border: { color: "transparent" },
  };
  const xAxisStyle = {
    grid: { display: false },
    ticks: { color: "#6a6050", font: { family: "'Inter',sans-serif", size: 10 } },
    border: { color: "transparent" },
  };

  const hasData = income > 0 || expense > 0;

  return (
    <>
      <style>{`
        .ch-section {
          margin-bottom: clamp(1.25rem,3vw,2rem);
        }
        .ch-section-label {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: clamp(10px,2vw,14px);
        }
        .ch-section-label span {
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 10px; font-weight: 500;
          letter-spacing: .15em; text-transform: uppercase;
          color: var(--text-faint,#5a5040);
        }
        .ch-section-label::after {
          content:''; flex:1; height:1px;
          background: linear-gradient(to right,rgba(200,169,126,.18),transparent);
        }

        .ch-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%,280px),1fr));
          gap: clamp(10px,2vw,16px);
        }
        .ch-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%,200px),1fr));
          gap: clamp(10px,2vw,16px);
        }

        .ch-card {
          background: var(--bg-card,rgba(22,20,14,0.75));
          border: 1px solid var(--border,rgba(200,169,126,0.14));
          border-radius: 14px;
          padding: clamp(16px,2.5vw,22px);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: border-color .3s ease, transform .3s ease;
        }
        .ch-card:hover {
          border-color: rgba(200,169,126,.24);
          transform: translateY(-2px);
        }

        .ch-card-title {
          font-family: var(--font-display,'Syne',sans-serif);
          font-size: clamp(.8rem,1.8vw,.9rem); font-weight: 600;
          color: var(--text-muted,#8a8070);
          margin-bottom: clamp(12px,2vw,16px);
          letter-spacing: .04em;
        }
        .ch-chart-wrap {
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .ch-pie-wrap { max-width: 260px; width: 100%; margin: 0 auto; }

        /* ── Stat chips ── */
        .ch-stat-row {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-top: 14px; justify-content: center;
        }
        .ch-stat {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 11px; border-radius: 7px;
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; font-weight: 500;
        }
        .ch-stat-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

        /* ── Empty state ── */
        .ch-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 160px; gap: 8px;
        }
        .ch-empty p {
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 12px; color: var(--text-faint,#5a5040);
          text-align: center;
        }
      `}</style>

      {/* ── Overview row ── */}
      <div className="ch-section">
        <div className="ch-section-label"><span>Overview</span></div>
        <div className="ch-grid-2">

          {/* Pie */}
          <div className="ch-card">
            <p className="ch-card-title">Income vs Expense</p>
            {hasData ? (
              <>
                <div className="ch-pie-wrap">
                  <Pie
                    data={pieData}
                    options={{
                      responsive: true,
                      plugins: {
                        tooltip: { ...tooltipDefaults },
                        legend: { ...legendDefaults, position: "bottom" },
                      },
                    }}
                  />
                </div>
                <div className="ch-stat-row">
                  <div className="ch-stat" style={{ background:"rgba(111,207,111,.08)", color: GREEN }}>
                    <span className="ch-stat-dot" style={{ background: GREEN }} />
                    {fmtINR(income)}
                  </div>
                  <div className="ch-stat" style={{ background:"rgba(224,112,112,.08)", color: RED }}>
                    <span className="ch-stat-dot" style={{ background: RED }} />
                    {fmtINR(expense)}
                  </div>
                </div>
              </>
            ) : (
              <div className="ch-empty"><p>No data yet</p></div>
            )}
          </div>

          {/* Bar: income vs expense */}
          <div className="ch-card">
            <p className="ch-card-title">Comparison</p>
            {hasData ? (
              <div className="ch-chart-wrap">
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: {
                      tooltip: { ...tooltipDefaults },
                      legend: { display: false },
                    },
                    scales: {
                      y: axisStyle,
                      x: xAxisStyle,
                    },
                  }}
                />
              </div>
            ) : (
              <div className="ch-empty"><p>No data yet</p></div>
            )}
          </div>
        </div>
      </div>

      {/* ── Monthly trend ── */}
      <div className="ch-section">
        <div className="ch-section-label"><span>6-Month Trend</span></div>
        <div className="ch-card">
          <p className="ch-card-title">Monthly Income &amp; Expenses</p>
          <Bar
            data={monthlyData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  ...tooltipDefaults,
                  callbacks: {
                    label: (ctx) =>
                      ` ${ctx.dataset.label}: ₹${new Intl.NumberFormat("en-IN").format(Math.round(ctx.raw))}`,
                  },
                },
                legend: { ...legendDefaults, position: "top", align: "end" },
              },
              scales: {
                y: axisStyle,
                x: xAxisStyle,
              },
            }}
          />
        </div>
      </div>

      {/* ── Category breakdown ── */}
      {categoryData.labels.length > 0 && (
        <div className="ch-section">
          <div className="ch-section-label"><span>By Category</span></div>
          <div className="ch-grid-2">

            {/* Pie */}
            <div className="ch-card">
              <p className="ch-card-title">Category Split</p>
              <div className="ch-pie-wrap">
                <Pie
                  data={categoryData}
                  options={{
                    responsive: true,
                    plugins: {
                      tooltip: { ...tooltipDefaults },
                      legend: { ...legendDefaults, position: "bottom" },
                    },
                  }}
                />
              </div>
            </div>

            {/* Horizontal bar */}
            <div className="ch-card">
              <p className="ch-card-title">Category Amounts</p>
              <Bar
                data={{
                  labels: categoryData.labels,
                  datasets: [{
                    label: "Amount",
                    data: categoryData.datasets[0].data,
                    backgroundColor: categoryData.datasets[0].backgroundColor,
                    borderColor:     categoryData.datasets[0].borderColor,
                    borderWidth: 1.5,
                    borderRadius: 5,
                    borderSkipped: false,
                  }],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  plugins: {
                    tooltip: { ...tooltipDefaults },
                    legend: { display: false },
                  },
                  scales: {
                    x: axisStyle,
                    y: {
                      grid: { display: false },
                      ticks: {
                        color: "#8a8070",
                        font: { family: "'Inter',sans-serif", size: 10 },
                      },
                      border: { color: "transparent" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Line: net balance over time ── */}
      {transactions.length > 1 && (
        <div className="ch-section">
          <div className="ch-section-label"><span>Net Balance Trend</span></div>
          <div className="ch-card">
            <p className="ch-card-title">Cumulative Balance Over Time</p>
            <Line
              data={(() => {
                const sorted = [...transactions]
                  .filter((t) => t.date)
                  .sort((a, b) => new Date(a.date) - new Date(b.date));
                let running = 0;
                const points = sorted.map((t) => {
                  running += t.type === "income" ? Number(t.amount) : -Number(t.amount);
                  return { x: new Date(t.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }), y: running };
                });
                return {
                  labels: points.map((p) => p.x),
                  datasets: [{
                    label: "Balance",
                    data: points.map((p) => p.y),
                    borderColor: GOLD,
                    backgroundColor: "rgba(200,169,126,0.07)",
                    pointBackgroundColor: points.map((p) => p.y >= 0 ? GREEN : RED),
                    pointRadius: 3, pointHoverRadius: 5,
                    fill: true, tension: 0.3, borderWidth: 2,
                  }],
                };
              })()}
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    ...tooltipDefaults,
                    callbacks: {
                      label: (ctx) => {
                        const v = ctx.raw;
                        return ` Balance: ${v < 0 ? "−" : ""}₹${new Intl.NumberFormat("en-IN").format(Math.abs(Math.round(v)))}`;
                      },
                    },
                  },
                  legend: { display: false },
                },
                scales: {
                  y: {
                    ...axisStyle,
                    ticks: {
                      ...axisStyle.ticks,
                      callback: (v) =>
                        `${v < 0 ? "−" : ""}₹${new Intl.NumberFormat("en-IN", { notation:"compact", maximumFractionDigits:1 }).format(Math.abs(v))}`,
                    },
                  },
                  x: xAxisStyle,
                },
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Charts;