import { useState } from "react";

/* ── Category options by type ── */
const CATEGORIES = {
  income: [
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Rental Income",
    "Gift / Bonus",
    "Refund",
    "Other Income",
  ],
  expense: [
    "Food & Dining",
    "Rent / Housing",
    "Transport",
    "Shopping",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Education",
    "Travel",
    "Subscriptions",
    "Insurance",
    "Savings / Investment",
    "Other Expense",
  ],
};

const EMPTY = { title: "", amount: "", type: "", category: "", date: "" };

/* ── Inline SVG icons ── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function TransactionForm({ addTransaction }) {
  const [formData, setFormData] = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  /* ── Validation ── */
  const validate = (data) => {
    const e = {};
    if (!data.title.trim())           e.title    = "Title is required.";
    else if (data.title.trim().length < 2) e.title = "Title must be at least 2 characters.";

    if (!data.amount)                 e.amount   = "Amount is required.";
    else if (isNaN(Number(data.amount))) e.amount = "Amount must be a number.";
    else if (Number(data.amount) <= 0)   e.amount = "Amount must be greater than ₹0.";
    else if (Number(data.amount) > 10_000_000) e.amount = "Amount seems too large.";

    if (!data.type)                   e.type     = "Please select a type.";
    if (!data.category)               e.category = "Please select a category.";

    if (!data.date)                   e.date     = "Date is required.";
    else {
      const chosen = new Date(data.date);
      const today  = new Date();
      today.setHours(23, 59, 59, 999);
      if (chosen > today)             e.date     = "Date cannot be in the future.";
    }
    return e;
  };

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    // Reset category when type changes
    if (name === "type") next.category = "";
    setFormData(next);
    // Clear error on edit
    if (errors[name]) setErrors((prev) => { const c = { ...prev }; delete c[name]; return c; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await addTransaction({ ...formData, amount: Number(formData.amount) });
      setFormData(EMPTY);
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setErrors({ submit: "Failed to add transaction. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isIncome  = formData.type === "income";
  const isExpense = formData.type === "expense";
  const typeColor = isIncome ? "#6fcf6f" : isExpense ? "#e07070" : "var(--gold)";

  return (
    <>
      <style>{`
        /* ── Form wrapper ── */
        .tf-wrap {
          background: var(--bg-card, rgba(22,20,14,0.75));
          border: 1px solid var(--border, rgba(200,169,126,0.14));
          border-radius: 16px;
          padding: clamp(18px,3vw,28px) clamp(18px,3.5vw,32px);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          margin-bottom: clamp(1.25rem,3vw,2rem);
          transition: border-color .3s ease;
        }

        /* ── Section heading ── */
        .tf-heading {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: clamp(18px,3vw,24px);
        }
        .tf-heading-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(200,169,126,.1);
          border: 1px solid rgba(200,169,126,.22);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold, #c8a97e);
        }
        .tf-heading h2 {
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: clamp(.95rem,2vw,1.1rem);
          font-weight: 700;
          color: var(--text-primary, #e8e0d0);
        }

        /* ── Grid ── */
        .tf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
          gap: clamp(10px,2vw,14px);
        }
        .tf-field { display: flex; flex-direction: column; gap: 5px; }
        .tf-field-full { grid-column: 1 / -1; }

        /* ── Labels ── */
        .tf-label {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 10px; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--text-muted, #8a8070);
        }

        /* ── Inputs & selects ── */
        .tf-input, .tf-select {
          width: 100%; height: 42px;
          padding: 0 12px;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 13px; font-weight: 400;
          color: var(--text-primary, #e8e0d0);
          background: rgba(255,255,255,.03);
          border: 1px solid var(--border, rgba(200,169,126,0.14));
          border-radius: 9px;
          outline: none;
          transition: border-color .22s ease, background .22s ease, box-shadow .22s ease;
          appearance: none;
          -webkit-appearance: none;
        }
        .tf-input::placeholder { color: var(--text-faint, #5a5040); }
        .tf-input:focus, .tf-select:focus {
          border-color: var(--gold, #c8a97e);
          background: rgba(200,169,126,.04);
          box-shadow: 0 0 0 3px rgba(200,169,126,.1);
        }
        .tf-input.tf-err, .tf-select.tf-err {
          border-color: #e07070 !important;
          box-shadow: 0 0 0 3px rgba(224,112,112,.1) !important;
        }

        /* Chromium date picker icon tint */
        .tf-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(.6) sepia(.5) saturate(.8) hue-rotate(10deg);
          cursor: pointer;
        }

        /* ── Select wrapper (for arrow icon) ── */
        .tf-select-wrap {
          position: relative;
        }
        .tf-select-wrap .tf-chevron {
          position: absolute; right: 11px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted, #8a8070);
          pointer-events: none;
        }
        .tf-select { padding-right: 32px; cursor: pointer; }
        .tf-select option {
          background: #1a1810; color: #e8e0d0;
        }

        /* ── Type toggle pills ── */
        .tf-type-group {
          display: flex; gap: 8px;
        }
        .tf-type-pill {
          flex: 1; height: 42px; border-radius: 9px;
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 12px; font-weight: 500; letter-spacing: .05em; text-transform: uppercase;
          border: 1px solid var(--border, rgba(200,169,126,0.14));
          background: transparent;
          color: var(--text-muted, #8a8070);
          cursor: pointer;
          transition: all .22s ease;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .tf-type-pill:hover {
          border-color: var(--border-hover, rgba(200,169,126,0.32));
          color: var(--text-primary, #e8e0d0);
        }
        .tf-type-pill.income-active {
          background: rgba(111,207,111,.1);
          border-color: rgba(111,207,111,.35);
          color: #6fcf6f;
        }
        .tf-type-pill.expense-active {
          background: rgba(224,112,112,.1);
          border-color: rgba(224,112,112,.35);
          color: #e07070;
        }
        .tf-type-pill.tf-err-pill {
          border-color: #e07070 !important;
          box-shadow: 0 0 0 3px rgba(224,112,112,.1);
        }

        /* ── Error text ── */
        .tf-error-msg {
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 10px; font-weight: 400;
          color: #e07070; letter-spacing: .03em;
          margin-top: 1px;
        }

        /* ── Submit button ── */
        .tf-submit {
          width: 100%; height: 44px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #c8a97e, #a07840);
          color: #0a0a0c;
          font-family: var(--font-display, 'Syne', sans-serif);
          font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
          cursor: pointer; position: relative; overflow: hidden;
          transition: opacity .22s ease, transform .22s ease, box-shadow .22s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .tf-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #e8c898, #c8a97e);
          opacity: 0; transition: opacity .22s ease;
          color:black;
        }
        .tf-submit:hover::after { opacity: 1; }
        .tf-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(200,169,126,.28); }
        .tf-submit:active { transform: scale(.98); }
        .tf-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; }
        .tf-submit > * { position: relative; z-index: 1; }

        /* ── Success banner ── */
        @keyframes tfSuccess { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .tf-success {
          margin-bottom: 14px; padding: 10px 14px; border-radius: 9px;
          background: rgba(111,207,111,.08); border: 1px solid rgba(111,207,111,.25);
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 12px; color: #6fcf6f; letter-spacing: .03em;
          display: flex; align-items: center; gap: 8px;
          animation: tfSuccess .3s ease;
        }

        /* ── Submit error ── */
        .tf-submit-err {
          margin-bottom: 12px; padding: 10px 14px; border-radius: 9px;
          background: rgba(224,112,112,.08); border: 1px solid rgba(224,112,112,.25);
          font-family: var(--font-body, 'Inter', sans-serif);
          font-size: 12px; color: #e07070;
        }

        /* ── Loading spinner ── */
        @keyframes tfSpin { to { transform: rotate(360deg); } }
        .tf-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(10,10,12,.3);
          border-top-color: #0a0a0c;
          animation: tfSpin .7s linear infinite;
        }
      `}</style>

      <div className="tf-wrap">
        {/* Heading */}
        <div className="tf-heading">
          <div className="tf-heading-icon"><PlusIcon /></div>
          <h2>Add Transaction</h2>
        </div>

        {/* Success / Error banners */}
        {success && (
          <div className="tf-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Transaction added successfully!
          </div>
        )}
        {errors.submit && <div className="tf-submit-err">{errors.submit}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="tf-grid">

            {/* Title */}
            <div className="tf-field tf-field-full">
              <label className="tf-label">Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Monthly Salary, Grocery Run…"
                value={formData.title}
                onChange={handleChange}
                className={`tf-input${errors.title ? " tf-err" : ""}`}
              />
              {errors.title && <span className="tf-error-msg">{errors.title}</span>}
            </div>

            {/* Amount */}
            <div className="tf-field">
              <label className="tf-label">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className={`tf-input${errors.amount ? " tf-err" : ""}`}
              />
              {errors.amount && <span className="tf-error-msg">{errors.amount}</span>}
            </div>

            {/* Date */}
            <div className="tf-field">
              <label className="tf-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                className={`tf-input${errors.date ? " tf-err" : ""}`}
              />
              {errors.date && <span className="tf-error-msg">{errors.date}</span>}
            </div>

            {/* Type toggle pills */}
            <div className="tf-field tf-field-full">
              <label className="tf-label">Type</label>
              <div className="tf-type-group">
                {["income", "expense"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleChange({ target: { name: "type", value: t } })}
                    className={`tf-type-pill${errors.type ? " tf-err-pill" : ""}${
                      formData.type === t ? ` ${t}-active` : ""
                    }`}
                  >
                    {t === "income" ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                      </svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
                      </svg>
                    )}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              {errors.type && <span className="tf-error-msg">{errors.type}</span>}
            </div>

            {/* Category */}
            <div className="tf-field tf-field-full">
              <label className="tf-label">Category</label>
              <div className="tf-select-wrap">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={!formData.type}
                  className={`tf-select${errors.category ? " tf-err" : ""}`}
                  style={{ opacity: formData.type ? 1 : 0.45 }}
                >
                  <option value="">
                    {formData.type ? "Select a category" : "Select a type first"}
                  </option>
                  {(CATEGORIES[formData.type] || []).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <span className="tf-chevron"><ChevronIcon /></span>
              </div>
              {errors.category && <span className="tf-error-msg">{errors.category}</span>}
            </div>

            {/* Submit */}
            <div className="tf-field tf-field-full" >
   <button type="submit" className="tf-submit" disabled={loading}>
  {loading ? (
    <>
      <div className="tf-spinner" />
      Adding…
    </>
  ) : (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
     <PlusIcon  size={30} />
      <span>Add Transaction</span>
    </div>
  )}
</button>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

export default TransactionForm;