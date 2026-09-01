import { useState } from "react";
import { Link } from "react-router-dom";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="wrap">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <span className="mark">
            <i></i>
          </span>
          monitorly
        </a>

        <div className={`nav-links-wrap${open ? " open" : ""}`}>
          <div className="links">
            <a href="#product" onClick={() => setOpen(false)}>
              Product
            </a>
            <a href="#why" onClick={() => setOpen(false)}>
              Why Monitorly
            </a>
            <a href="#pricing" onClick={() => setOpen(false)}>
              Pricing
            </a>
            <a href="#faq" onClick={() => setOpen(false)}>
              FAQ
            </a>
          </div>
          <div className="nav-actions">
            <Link className="ghost" to="/signin">
              Sign in
            </Link>
            <Link className="button primary" to="/signup">
              Start monitoring
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {open ? (
              <path d="M4 4l10 10M14 4L4 14" />
            ) : (
              <path d="M2 4.5h14M2 9h14M2 13.5h14" />
            )}
          </svg>
        </button>
      </div>
    </nav>
  );
}
