import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PRODUCTION_ORIGIN = "https://monitorly.live";
const HOME_TITLE = "Monitorly — Website & API Monitoring with Instant Alerts";

/**
 * Keeps the document head correct for the current route.
 *
 * index.html ships the homepage's title/canonical/robots/Open Graph tags so a
 * crawler that does not execute JavaScript still sees the right values. This
 * component then corrects them per route:
 *
 *   /                     index, follow  (self-canonical)
 *   /signin, /signup      noindex, nofollow
 *   /dashboard…           noindex, nofollow
 *   anything else (404)   noindex, nofollow
 *
 * Without this, every SPA route would inherit the homepage's canonical and
 * tell Google it is a duplicate of `/`.
 */
export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    const robots = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );

    const isHome = pathname === "/";
    const isAuth = pathname === "/signin" || pathname === "/signup";
    const isDashboard = pathname.startsWith("/dashboard");

    if (canonical) {
      canonical.href = isHome
        ? `${PRODUCTION_ORIGIN}/`
        : `${PRODUCTION_ORIGIN}${pathname}`;
    }

    if (robots) {
      robots.content = isHome ? "index, follow" : "noindex, nofollow";
    }

    document.title = isHome
      ? HOME_TITLE
      : isAuth
        ? `${pathname === "/signin" ? "Sign in" : "Create your account"} — Monitorly`
        : isDashboard
          ? "Dashboard — Monitorly"
          : "Page not found — Monitorly";
  }, [pathname]);

  return null;
}
