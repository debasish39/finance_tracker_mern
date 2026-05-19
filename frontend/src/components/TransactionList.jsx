import { useState, useMemo } from "react";

/* ── Helpers ── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(Number(n)));

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ── SVGs ── */
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const SortIcon = ({ dir }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: dir === "asc" ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const EmptyIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: "var(--text-faint, #5a5040)", margin: "0 auto 12px", display: "block" }}>
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20M7 15h.01M12 15h.01"/>
  </svg>
);

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function TransactionList({ transactions, deleteTransaction }) {
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("all");
  const [sortKey,   setSortKey]   = useState("date");
  const [sortDir,   setSortDir]   = useState("desc");
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(10);
  const [confirmId, setConfirmId] = useState(null);

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = [...transactions];

    if (typeFilter !== "all")
      list = list.filter((t) => t.type === typeFilter);

    if (search.trim())
      list = list.filter((t) =>
        [t.title, t.category, t.type, String(t.amount)]
          .join(" ").toLowerCase()
          .includes(search.toLowerCase())
      );

    list.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "amount") { av = Number(av); bv = Number(bv); }
      else if (sortKey === "date") { av = new Date(av); bv = new Date(bv); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [transactions, search, typeFilter, sortKey, sortDir]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleType   = (v) => { setTypeFilter(v); setPage(1); };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    setConfirmId(null);
  };

  /* ── Totals for footer ── */
  const filteredIncome  = filtered.filter((t) => t.type === "income").reduce((a, t) => a + Number(t.amount), 0);
  const filteredExpense = filtered.filter((t) => t.type === "expense").reduce((a, t) => a + Number(t.amount), 0);

  const COLS = [
    { key: "title",    label: "Title",    sortable: true  },
    { key: "amount",   label: "Amount",   sortable: true  },
    { key: "type",     label: "Type",     sortable: true  },
    { key: "category", label: "Category", sortable: false },
    { key: "date",     label: "Date",     sortable: true  },
    { key: "action",   label: "",         sortable: false },
  ];

  return (
    <>
      <style>{`
        .tl-wrap {
          background: var(--bg-card, rgba(22,20,14,0.75));
          border: 1px solid var(--border, rgba(200,169,126,0.14));
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          margin-bottom: clamp(1.25rem,3vw,2rem);
        }

        /* ── Header bar ── */
        .tl-header {
          display: flex; flex-wrap: wrap; align-items: center;
          gap: 10px; padding: clamp(14px,2.5vw,20px) clamp(16px,3vw,24px);
          border-bottom: 1px solid var(--border, rgba(200,169,126,0.14));
        }
        .tl-title {
          font-family: var(--font-display,'Syne',sans-serif);
          font-size: clamp(.9rem,2vw,1.05rem); font-weight: 700;
          color: var(--text-primary,#e8e0d0);
          margin-right: auto;
        }
        .tl-count {
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 10px; font-weight: 500; letter-spacing:.06em;
          text-transform: uppercase; color: var(--text-faint,#5a5040);
          background: rgba(200,169,126,.07);
          border: 1px solid rgba(200,169,126,.15);
          border-radius: 20px; padding: 2px 10px;
        }

        /* ── Controls row ── */
        .tl-controls {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: clamp(10px,2vw,14px) clamp(16px,3vw,24px);
          border-bottom: 1px solid var(--border, rgba(200,169,126,0.14));
        }

        /* Search */
        .tl-search-wrap {
          position: relative; flex: 1; min-width: 160px;
        }
        .tl-search-wrap svg {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: var(--text-faint,#5a5040); pointer-events: none;
        }
        .tl-search {
          width: 100%; height: 36px; padding: 0 12px 0 32px;
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 12px; color: var(--text-primary,#e8e0d0);
          background: rgba(255,255,255,.03);
          border: 1px solid var(--border,rgba(200,169,126,0.14));
          border-radius: 9px; outline: none;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .tl-search::placeholder { color: var(--text-faint,#5a5040); }
        .tl-search:focus {
          border-color: var(--gold,#c8a97e);
          box-shadow: 0 0 0 3px rgba(200,169,126,.1);
        }

        /* Filter pills */
        .tl-filter-group { display: flex; gap: 6px; }
        .tl-pill {
          height: 36px; padding: 0 14px; border-radius: 9px;
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; font-weight: 500; letter-spacing:.05em; text-transform: uppercase;
          border: 1px solid var(--border,rgba(200,169,126,0.14));
          background: transparent; color: var(--text-muted,#8a8070);
          cursor: pointer; transition: all .2s ease; white-space: nowrap;
        }
        .tl-pill:hover {
          border-color: var(--border-hover,rgba(200,169,126,0.32));
          color: var(--text-primary,#e8e0d0);
        }
        .tl-pill.tl-pill-active-all   { background:rgba(200,169,126,.1); border-color:rgba(200,169,126,.32); color:var(--gold,#c8a97e); }
        .tl-pill.tl-pill-active-income  { background:rgba(111,207,111,.08); border-color:rgba(111,207,111,.3); color:#6fcf6f; }
        .tl-pill.tl-pill-active-expense { background:rgba(224,112,112,.08); border-color:rgba(224,112,112,.3); color:#e07070; }

        /* Page size select */
        .tl-page-size-wrap { position: relative; }
        .tl-page-size {
          height: 36px; padding: 0 28px 0 11px;
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; color: var(--text-muted,#8a8070);
          background: rgba(255,255,255,.03);
          border: 1px solid var(--border,rgba(200,169,126,0.14));
          border-radius: 9px; outline: none; cursor: pointer;
          appearance: none; -webkit-appearance: none;
          transition: border-color .2s;
        }
        .tl-page-size:focus { border-color: var(--gold,#c8a97e); }
        .tl-page-size option { background: #1a1810; color: #e8e0d0; }
        .tl-page-size-wrap svg {
          position: absolute; right: 8px; top: 50%;
          transform: translateY(-50%); pointer-events: none;
          color: var(--text-faint,#5a5040);
        }

        /* ── Table ── */
        .tl-table-wrap { overflow-x: auto; }
        .tl-table {
          width: 100%; border-collapse: collapse;
          font-family: var(--font-body,'Inter',sans-serif);
        }
        .tl-table thead tr {
          border-bottom: 1px solid var(--border,rgba(200,169,126,0.14));
        }
        .tl-table th {
          padding: 11px clamp(12px,2vw,18px);
          font-size: 10px; font-weight: 500; letter-spacing:.1em; text-transform: uppercase;
          color: white; text-align: left; white-space: nowrap;
        }
        .tl-th-btn {
          display: inline-flex; align-items: center; gap: 5px;
          background: none; border: none; padding: 0; cursor: pointer;
          font-size: 10px; font-weight: 500; letter-spacing:.1em; text-transform: uppercase;
          color: white;
          transition: color .2s ease;
        }
        .tl-th-btn:hover,
        .tl-th-btn.tl-th-active { color: white; }

        .tl-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,.04);
          transition: background .18s ease;
        }
        .tl-table tbody tr:last-child { border-bottom: none; }
        .tl-table tbody tr:hover { background: rgba(200,169,126,.04); }

        .tl-table td {
          padding: 12px clamp(12px,2vw,18px);
          font-size: clamp(12px,1.6vw,13px);
          color: var(--text-primary,#e8e0d0);
          vertical-align: middle; white-space: nowrap;
        }

        /* Amount cell */
        .tl-amount-income  { color: #6fcf6f; font-weight: 500; }
        .tl-amount-expense { color: #e07070; font-weight: 500; }

        /* Type badge */
        .tl-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 20px;
          font-size: 10px; font-weight: 500; letter-spacing:.05em; text-transform: uppercase;
        }
        .tl-badge-income  { background:rgba(111,207,111,.1); color:#6fcf6f; border:1px solid rgba(111,207,111,.22); }
        .tl-badge-expense { background:rgba(224,112,112,.1); color:#e07070; border:1px solid rgba(224,112,112,.22); }
        .tl-badge-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }

        /* Category chip */
        .tl-cat {
          display: inline-block;
          padding: 2px 9px; border-radius: 5px;
          font-size: 11px; color: var(--text-muted,#8a8070);
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          white-space: nowrap;
        }

        /* ── Delete / confirm ── */
        .tl-del-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 5px; height: 30px; padding: 0 12px; border-radius: 7px;
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; font-weight: 500; letter-spacing:.03em;
          background: transparent;
          border: 1px solid rgba(224,112,112,.25);
          color: #e07070; cursor: pointer;
          transition: all .2s ease;
        }
        .tl-del-btn:hover { background:rgba(224,112,112,.12); border-color:rgba(224,112,112,.45); }
        .tl-del-btn:active { transform: scale(.96); }

        .tl-confirm-row td {
          padding: 10px clamp(12px,2vw,18px) !important;
        }
        .tl-confirm-inner {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding: 10px 14px; border-radius: 9px;
          background: rgba(224,112,112,.07);
          border: 1px solid rgba(224,112,112,.2);
        }
        .tl-confirm-text {
          font-size: 12px; color: #e07070; flex: 1; min-width: 140px;
        }
        .tl-confirm-btns { display: flex; gap: 7px; }
        .tl-confirm-yes, .tl-confirm-no {
          height: 28px; padding: 0 13px; border-radius: 7px;
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; font-weight: 500; cursor: pointer;
          transition: all .18s ease; border: 1px solid transparent;
        }
        .tl-confirm-yes {
          background: rgba(224,112,112,.18); color: #e07070;
          border-color: rgba(224,112,112,.3);
        }
        .tl-confirm-yes:hover { background: rgba(224,112,112,.3); }
        .tl-confirm-no {
          background: rgba(255,255,255,.05); color: var(--text-muted,#8a8070);
          border-color: var(--border,rgba(200,169,126,0.14));
        }
        .tl-confirm-no:hover { color: var(--text-primary,#e8e0d0); }

        /* ── Empty state ── */
        .tl-empty {
          padding: clamp(2.5rem,5vw,4rem) 1rem; text-align: center;
        }
        .tl-empty-title {
          font-family: var(--font-display,'Syne',sans-serif);
          font-size: 14px; font-weight: 600;
          color: var(--text-muted,#8a8070); margin-bottom: 6px;
        }
        .tl-empty-sub {
          font-size: 12px; color: var(--text-faint,#5a5040);
        }

        /* ── Footer: totals + pagination ── */
        .tl-footer {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
          gap: 10px; padding: clamp(12px,2vw,16px) clamp(16px,3vw,24px);
          border-top: 1px solid var(--border,rgba(200,169,126,0.14));
        }
        .tl-totals {
          display: flex; gap: 16px; flex-wrap: wrap;
        }
        .tl-total-item {
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; display: flex; align-items: center; gap: 6px;
        }
        .tl-total-dot {
          width:6px; height:6px; border-radius:50%; flex-shrink:0;
        }
        .tl-total-label { color: var(--text-faint,#5a5040); }
        .tl-total-val { font-weight:500; }

        /* Pagination */
        .tl-pagination { display: flex; align-items: center; gap: 6px; }
        .tl-page-info {
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; color: var(--text-faint,#5a5040);
          white-space: nowrap;
        }
        .tl-page-btn {
          width: 30px; height: 30px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-body,'Inter',sans-serif);
          font-size: 11px; font-weight: 500;
          border: 1px solid var(--border,rgba(200,169,126,0.14));
          background: transparent; color: var(--text-muted,#8a8070);
          cursor: pointer; transition: all .18s ease;
        }
        .tl-page-btn:hover:not(:disabled) {
          border-color: var(--border-hover,rgba(200,169,126,0.32));
          color: var(--gold,#c8a97e);
          background: rgba(200,169,126,.06);
        }
        .tl-page-btn:disabled { opacity:.35; cursor:not-allowed; }
        .tl-page-btn.tl-page-active {
          background: rgba(200,169,126,.12);
          border-color: rgba(200,169,126,.32);
          color: var(--gold,#c8a97e);
        }
      `}</style>

      <div className="tl-wrap">

        {/* ── Header ── */}
        <div className="tl-header">
          <span className="tl-title">Transactions</span>
          <span className="tl-count">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* ── Controls ── */}
        <div className="tl-controls">
          {/* Search */}
          <div className="tl-search-wrap">
            <SearchIcon />
            <input
              type="text"
              className="tl-search"
              placeholder="Search title, category…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <div className="tl-filter-group">
            {[
              { val: "all",     label: "All"     },
              { val: "income",  label: "Income"  },
              { val: "expense", label: "Expense" },
            ].map(({ val, label }) => (
              <button
                key={val}
                className={`tl-pill${typeFilter === val ? ` tl-pill-active-${val}` : ""}`}
                onClick={() => handleType(val)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Rows per page */}
          <div className="tl-page-size-wrap">
            <select
              className="tl-page-size"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="tl-table-wrap">
          <table className="tl-table">
            <thead>
              <tr>
                {COLS.map((col) => (
                  <th key={col.key}>
                    {col.sortable ? (
                      <button
                        className={`tl-th-btn${sortKey === col.key ? " tl-th-active" : ""}`}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                        <SortIcon dir={sortKey === col.key ? sortDir : null} />
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length}>
                    <div className="tl-empty">
                      <EmptyIcon />
                      <p className="tl-empty-title">
                        {search || typeFilter !== "all" ? "No matching transactions" : "No transactions yet"}
                      </p>
                      <p className="tl-empty-sub">
                        {search || typeFilter !== "all"
                          ? "Try adjusting your search or filter."
                          : "Add your first transaction using the form above."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item) =>
                  confirmId === item._id ? (
                    /* Confirm row */
                    <tr key={item._id} className="tl-confirm-row">
                      <td colSpan={COLS.length}>
                        <div className="tl-confirm-inner">
                          <span className="tl-confirm-text">
                            Delete <strong>{item.title}</strong>? This cannot be undone.
                          </span>
                          <div className="tl-confirm-btns">
                            <button className="tl-confirm-yes" onClick={() => handleDelete(item._id)}>
                              Yes, Delete
                            </button>
                            <button className="tl-confirm-no" onClick={() => setConfirmId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={item._id}>
                      <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </td>

                      <td className={`tl-amount-${item.type}`}>
                        {item.type === "income" ? "+" : "−"}{fmt(item.amount)}
                      </td>

                      <td>
                        <span className={`tl-badge tl-badge-${item.type}`}>
                          <span className="tl-badge-dot" />
                          {item.type}
                        </span>
                      </td>

                      <td>
                        <span className="tl-cat">{item.category || "—"}</span>
                      </td>

                      <td style={{ color: "var(--text-muted)" }}>{fmtDate(item.date)}</td>

                      <td>
                        <button
                          className="tl-del-btn"
                          onClick={() => setConfirmId(item._id)}
                        >
                          <TrashIcon /> Delete
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer: totals + pagination ── */}
        <div className="tl-footer">
          {/* Filtered totals */}
          <div className="tl-totals">
            <div className="tl-total-item">
              <span className="tl-total-dot" style={{ background: "#6fcf6f" }} />
              <span className="tl-total-label">Income</span>
              <span className="tl-total-val" style={{ color: "#6fcf6f" }}>{fmt(filteredIncome)}</span>
            </div>
            <div className="tl-total-item">
              <span className="tl-total-dot" style={{ background: "#e07070" }} />
              <span className="tl-total-label">Expenses</span>
              <span className="tl-total-val" style={{ color: "#e07070" }}>{fmt(filteredExpense)}</span>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="tl-pagination">
              <span className="tl-page-info">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </span>

              <button className="tl-page-btn" onClick={() => setPage(1)}    disabled={page === 1}>«</button>
              <button className="tl-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    className={`tl-page-btn${page === p ? " tl-page-active" : ""}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                );
              })}

              <button className="tl-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
              <button className="tl-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TransactionList;