import { footerLinkGroups } from "../../data/footerLinks";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <a className="brand" href="#top">
              <span className="mark">
                <i></i>
              </span>
              monitorly
            </a>
            <p className="footer-copy">
              Dependable uptime monitoring for the people responsible for
              production.
            </p>
          </div>
          <div className="footer-links">
            {footerLinkGroups.map((group) => (
              <div key={group.heading}>
                <b>{group.heading}</b>
                {group.links.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Monitorly, Inc.</span>
          <span>Made for teams on call.</span>
        </div>
      </div>
    </footer>
  );
}
