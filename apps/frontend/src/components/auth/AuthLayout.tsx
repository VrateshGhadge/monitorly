import { Link } from "react-router-dom";
import { useEffect, type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <Link className="brand auth-brand" to="/">
          <span className="mark">
            <i></i>
          </span>
          monitorly
        </Link>

        <div className="auth-marketing">
          <div className="eyebrow">
            <i className="pulse"></i> All systems operational
          </div>
          <h2>Know before your users do.</h2>
          <p>
            Fast, reliable uptime monitoring with instant email alerts — set up
            in minutes.
          </p>

          <div className="auth-preview" aria-hidden="true">
            <div className="auth-preview-head">
              <span className="live">● LIVE</span>
              <span>Acme Engineering</span>
            </div>
            <div className="auth-preview-metrics">
              <div>
                <label>Monitors up</label>
                <strong>
                  7 <small>/ 8</small>
                </strong>
              </div>
              <div>
                <label>Uptime · 30d</label>
                <strong>
                  99.94<small>%</small>
                </strong>
              </div>
              <div>
                <label>Avg response</label>
                <strong>
                  84<small>ms</small>
                </strong>
              </div>
            </div>
            <div className="auth-preview-rows">
              <div className="row-line">
                <div>
                  <b>api.acme.dev</b>
                  <div className="row-sub">HTTPS · 142ms</div>
                </div>
                <span className="status-dot" />
              </div>
              <div className="row-line">
                <div>
                  <b>payments.acme.dev</b>
                  <div className="row-sub">HTTPS · alert sent</div>
                </div>
                <span
                  className="status-dot"
                  style={{ background: "var(--red)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="auth-copyright">© 2026 Monitorly, Inc.</p>
      </div>

      <div className="auth-form-panel">
        <Link className="brand auth-brand-mobile" to="/">
          <span className="mark">
            <i></i>
          </span>
          monitorly
        </Link>
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
