import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";

import { useEffect, useState, useCallback } from "react";
import API from "./api/api";

import Dashboard from "./components/Dashboard";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import Charts from "./components/Charts";

/* ─────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────── */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const ExportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const RupeeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4h12" />
    <path d="M6 8h12" />
    <path d="M9 12c4 0 6-2 6-4s-2-4-6-4" />
    <path d="M9 12l6 8" />
    <path d="M6 12h3" />
  </svg>
);
/* ─────────────────────────────────────────
   CSV EXPORT UTILITY
───────────────────────────────────────── */
function exportToCSV(transactions) {
  if (!transactions.length) {
    alert("No transactions to export.");
    return;
  }
  const headers = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.map((t) => [
    new Date(t.date || t.createdAt).toLocaleDateString(),
    `"${(t.description || t.title || "").replace(/"/g, '""')}"`,
    t.category || "",
    t.type || "",
    t.amount,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
export default function App() {
  const { getToken, isSignedIn } = useAuth();
  const { user }                 = useUser();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(false);

  /* ── Theme: persisted in localStorage ── */
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("ft-theme");
    return stored ? stored === "dark" : true; // default dark
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("ft-theme", dark ? "dark" : "light");
  }, [dark]);

  /* ── Shared request helpers ── */
  const getHeaders = useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error("No auth token");
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  /* ── Fetch all transactions ── */
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const headers     = await getHeaders();
      const { data }    = await API.get(`/transactions?userId=${user.id}`, { headers });
      setTransactions(data);
    } catch (err) {
      console.error("fetchTransactions:", err);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, user?.id]);

  useEffect(() => {
    if (isSignedIn) fetchTransactions();
  }, [isSignedIn, fetchTransactions]);

  /* ── Add ── */
  const addTransaction = async (formData) => {
    try {
      const headers = await getHeaders();
      await API.post("/transactions", { ...formData, userId: user.id }, { headers });
      await fetchTransactions();
    } catch (err) {
      console.error("addTransaction:", err);
    }
  };

  /* ── Delete ── */
  const deleteTransaction = async (id) => {
    try {
      const headers = await getHeaders();
      await API.delete(`/transactions/${id}`, { headers });
      await fetchTransactions();
    } catch (err) {
      console.error("deleteTransaction:", err);
    }
  };

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */
  return (
    <>
      {/* ── CSS design system ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');

        /* ── Design tokens ── */
        :root {
          --bg:           #0a0a0c;
          --bg-surface:   rgba(18,16,12,0.82);
          --bg-card:      rgba(22,20,14,0.75);
          --border:       rgba(200,169,126,0.14);
          --border-hover: rgba(200,169,126,0.32);
          --gold:         #c8a97e;
          --gold-glow:    rgba(200,169,126,0.18);
          --text-primary: #e8e0d0;
          --text-muted:   #8a8070;
          --text-faint:   #5a5040;
          --radius:       14px;
          --font-body:    'Inter', sans-serif;
          --font-display: 'Syne', sans-serif;
          color-scheme: dark;
        }
        [data-theme="light"] {
          --bg:           #f4efe6;
          --bg-surface:   rgba(255,251,243,0.92);
          --bg-card:      rgba(255,253,247,0.97);
          --border:       rgba(160,120,64,0.16);
          --border-hover: rgba(160,120,64,0.38);
          --gold-glow:    rgba(160,120,64,0.12);
          --text-primary: #1a1610;
          --text-muted:   #6a5c40;
          --text-faint:   #a09070;
          color-scheme: light;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          transition: background .4s ease, color .4s ease;
        }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--gold-glow); border-radius: 4px; }

        /* ── Loading bar ── */
        @keyframes ftLoad {
          0%   { left: -45%; width: 45%; }
          50%  { left: 25%;  width: 60%; }
          100% { left: 100%; width: 45%; }
        }
        .ft-loading-bar {
          position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 9999;
          background: rgba(200,169,126,.1); overflow: hidden;
        }
        .ft-loading-bar::after {
          content: ''; position: absolute; top: 0; height: 100%;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
          animation: ftLoad 1.5s ease-in-out infinite;
        }

        /* ── Auth page ── */
        .ft-auth {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 1.5rem; padding: 2rem;
          background: var(--bg);
        }
        .ft-auth-logo {
          display: flex; align-items: center; gap: 12px;
          font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 700; color: var(--text-primary);
        }
        .ft-auth-logo-icon {
          width: 48px; height: 48px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, #c8a97e, #a07840);
          display: flex; align-items: center; justify-content: center;
          color: #0a0a0c;
          box-shadow: 0 6px 20px rgba(200,169,126,.3);
        }
        .ft-auth-logo span {
          background: linear-gradient(135deg, var(--text-primary) 20%, var(--gold) 80%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ft-auth-sub {
          font-size: 13px; color: var(--text-muted); letter-spacing: .04em;
        }

        /* ── App shell ── */
        .ft-shell {
          max-width: 1100px;
          margin: 0 auto;
          padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem);
        }

        /* ── Topbar ── */
        .ft-topbar {
          position: sticky; top: 12px; z-index: 40;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
          padding: clamp(10px,1.8vw,14px) clamp(14px,2.5vw,22px);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(0,0,0,.28);
          margin-bottom: clamp(1.25rem, 3vw, 2rem);
          transition: background .4s ease, border-color .4s ease;
        }

        /* ── Brand ── */
        .ft-brand {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-display); font-size: clamp(.95rem, 2vw, 1.15rem);
          font-weight: 700; text-decoration: none;
          user-select: none;
        }
        .ft-brand-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #c8a97e, #a07840);
          display: flex; align-items: center; justify-content: center;
          color: #0a0a0c;
        }
        .ft-brand-label {
          background: linear-gradient(135deg, var(--text-primary) 20%, var(--gold) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* ── Topbar action row ── */
        .ft-actions { display: flex; align-items: center; gap: 8px; }

        /* ── Icon button ── */
        .ft-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; height: 34px; padding: 0 13px; border-radius: 9px;
          font-family: var(--font-body); font-size: 12px; font-weight: 500;
          letter-spacing: .04em; text-transform: uppercase;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          transition: all .22s ease;
          white-space: nowrap;
        }
        .ft-btn:hover {
          background: var(--gold-glow);
          border-color: var(--border-hover);
          color: var(--gold);
          transform: translateY(-1px);
        }
        .ft-btn:active { transform: scale(.96); }

        /* ── Theme toggle icon only ── */
        .ft-btn-icon { padding: 0 9px; min-width: 34px; }

        /* ── Clerk overrides ── */
        // .cl-card {
        //   background: var(--bg-card) !important;
        //   border: 1px solid var(--border) !important;
        //   border-radius: 18px !important;
        //   box-shadow: 0 20px 60px rgba(0,0,0,.45) !important;
        //   backdrop-filter: blur(16px) !important;
        // }
        // [data-theme="light"] .cl-card {
        //   box-shadow: 0 10px 40px rgba(0,0,0,.1) !important;
        // }

        /* ── Grid background (light only) ── */
        [data-theme="light"] body::before {
          content: '';
          position: fixed; inset: 0; z-index: -1; pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(160,120,64,.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(160,120,64,.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        [data-theme="dark"] body::before {
          content: '';
          position: fixed; inset: 0; z-index: -1; pointer-events: none;
          background-image:
            linear-gradient(to right, rgba(200,169,126,.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(200,169,126,.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
          @media (max-width: 640px) {
  .ft-hide-mobile {
    display: none;
  }
}
      `}</style>

      {/* Loading bar */}
      {loading && <div className="ft-loading-bar" aria-hidden="true" />}

      {/* ══════════ SIGNED OUT ══════════ */}
      <SignedOut>
        <div className="ft-auth">
          <div className="ft-auth-logo">
            <div className="ft-auth-logo-icon"><RupeeIcon/></div>
            <span>Finance Tracker</span>
          </div>
          <p className="ft-auth-sub">Sign in to track your personal finances</p>
          <SignIn />
        </div>
      </SignedOut>

      {/* ══════════ SIGNED IN ══════════ */}
      <SignedIn>
        <div className="ft-shell">

          {/* Topbar */}
          <div className="ft-topbar">
            <div className="ft-brand">
              <div className="ft-brand-icon">< RupeeIcon /></div>
             <span className="ft-brand-label ft-hide-mobile">
  Finance Tracker
</span>
            </div>

            <div className="ft-actions">
              {/* CSV Export */}
              <button
                className="ft-btn"
                onClick={() => exportToCSV(transactions)}
                title="Export transactions as CSV"
              >
                <ExportIcon />
                <span>Export</span>
              </button>

              {/* Theme toggle */}
              <button
                className="ft-btn ft-btn-icon"
                onClick={() => setDark((d) => !d)}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle theme"
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>

              {/* Clerk avatar */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: 32, height: 32, borderRadius: 8,
                      border: "1px solid rgba(200,169,126,.25)",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Sections */}
          <Dashboard transactions={transactions} />
          <TransactionForm addTransaction={addTransaction} />
          <Charts transactions={transactions} />
          <TransactionList
            transactions={transactions}
            deleteTransaction={deleteTransaction}
          />

        </div>
      </SignedIn>
    </>
  );
}