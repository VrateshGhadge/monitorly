import { Link } from "react-router-dom";

import Nav from "../components/layout/Nav";
import Footer from "../components/layout/Footer";

const PRIMARY =
  "inline-flex cursor-pointer items-center justify-center rounded-[7px] border-0 bg-[#e9edf0] px-[18px] py-3 text-[15px] font-bold whitespace-nowrap text-[#111] transition-[0.2s] hover:-translate-y-px hover:bg-white";
const OUTLINE =
  "inline-flex cursor-pointer items-center justify-center rounded-[7px] border-0 bg-panel px-[18px] py-3 text-[15px] font-bold whitespace-nowrap text-[#dce0e5] transition-[0.2s] [outline:1px_solid_currentColor]";

/**
 * Catch-all for unmatched routes.
 *
 * The Worker is configured with `not_found_handling: "single-page-application"`,
 * so unknown paths return index.html with HTTP 200 — required so a hard refresh
 * on /dashboard still boots the SPA. This page gives those responses real
 * content (instead of a blank screen) and SeoManager marks them noindex, which
 * is what stops them being treated as indexable pages.
 */
export default function NotFoundPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[62vh] w-[min(calc(100%-44px),1180px)] flex-col items-center justify-center py-24 text-center">
        <div className="mb-3 font-code text-[11px] leading-[normal] tracking-[0.1em] text-brand uppercase">
          404
        </div>
        <h1 className="m-0 text-[clamp(32px,5vw,52px)] leading-[1.1] tracking-[-2px]">
          Page not found
        </h1>
        <p className="mt-4 mb-8 max-w-[460px] text-[15px] leading-[1.65] text-muted">
          The page you're looking for doesn't exist or may have moved. Head back
          to the homepage to keep exploring Monitorly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link className={PRIMARY} to="/">
            Back to home
          </Link>
          <Link className={OUTLINE} to="/signin">
            Sign in
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
