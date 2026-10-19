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
    // The `[@media(max-width:...)]:` variants are raw because Tailwind's
    // `max-[Npx]:` compiles to `not all and (min-width:Npx)`, which excludes
    // exactly Npx, while the CSS being replaced used inclusive max-width.
    <div className="fixed inset-0 grid h-dvh min-h-dvh grid-cols-2 overflow-hidden bg-background [@media(max-width:1080px)]:grid-cols-1">
      <div className="relative flex flex-col justify-between overflow-hidden border-r border-r-line [background:radial-gradient(ellipse_at_top_left,rgba(80,216,144,0.08),transparent_55%),#0d1014] px-12 py-9 [@media(max-width:1080px)]:hidden">
        <Link className="flex shrink-0 items-center gap-[10px] text-[16px] font-extrabold tracking-[-0.6px]" to="/">
          <span className="grid size-[23px] place-items-center rounded-[7px] border-2 border-brand [&>i]:block [&>i]:size-[7px] [&>i]:rounded-full [&>i]:bg-brand">
            <i></i>
          </span>
          monitorly
        </Link>

        <div className="my-auto max-w-[420px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-[5px] font-code text-[12px] leading-[normal] text-[#bec4cc]">
            <i className="size-1.5 rounded-full bg-brand shadow-[0_0_0_3px_rgba(80,216,144,0.12)]"></i> All systems operational
          </div>
          <h2 className="mt-3.5 mb-2.5 text-[clamp(26px,2.6vw,32px)] leading-[1.14] tracking-[-1.4px]">
            Know before your users do.
          </h2>
          <p className="mt-0 mb-5 text-[13.5px] leading-[1.6] text-muted">
            Fast, reliable uptime monitoring with instant email alerts — set up
            in minutes.
          </p>

          <div
            className="rounded-[11px] border border-[#2b3038] bg-[#0e1115] p-[15px] [box-shadow:0_20px_50px_rgba(0,0,0,0.32)]"
            aria-hidden="true"
          >
            <div className="mb-3 flex items-center justify-between text-[11px] text-muted">
              <span className="rounded-[4px] border border-[#254d3a] px-[7px] py-[5px] font-code text-[10px] leading-[normal] text-brand">● LIVE</span>
              <span>Acme Engineering</span>
            </div>
            <div className="mb-3 grid grid-cols-[repeat(3,1fr)] gap-2">
              <div className="rounded-[7px] border border-line bg-[#11151a] p-[9px]">
                <label className="mb-1.5 block text-[9.5px] text-[#818994]">
                  Monitors up
                </label>
                <strong className="text-[15px] tracking-[-0.5px]">
                  7{" "}
                  <small className="ml-[3px] text-[9.5px] text-brand">
                    / 8
                  </small>
                </strong>
              </div>
              <div className="rounded-[7px] border border-line bg-[#11151a] p-[9px]">
                <label className="mb-1.5 block text-[9.5px] text-[#818994]">
                  Uptime · 30d
                </label>
                <strong className="text-[15px] tracking-[-0.5px]">
                  99.94
                  <small className="ml-[3px] text-[9.5px] text-brand">%</small>
                </strong>
              </div>
              <div className="rounded-[7px] border border-line bg-[#11151a] p-[9px]">
                <label className="mb-1.5 block text-[9.5px] text-[#818994]">
                  Avg response
                </label>
                <strong className="text-[15px] tracking-[-0.5px]">
                  84
                  <small className="ml-[3px] text-[9.5px] text-brand">
                    ms
                  </small>
                </strong>
              </div>
            </div>
            <div className="auth-preview-rows">
              <div className="flex items-center justify-between border-t border-[#222830] px-0.5 py-[7px] text-[11px] first:border-t-0">
                <div>
                  <b className="text-[11px]">api.acme.dev</b>
                  <div className="mt-0.5 text-[10px] text-[#818994]">HTTPS · 142ms</div>
                </div>
                <span className="mr-1 inline-block size-1.5 rounded-full bg-brand" />
              </div>
              <div className="flex items-center justify-between border-t border-[#222830] px-0.5 py-[7px] text-[11px] first:border-t-0">
                <div>
                  <b className="text-[11px]">payments.acme.dev</b>
                  <div className="mt-0.5 text-[10px] text-[#818994]">HTTPS · alert sent</div>
                </div>
                <span
                  className="mr-1 inline-block size-1.5 rounded-full bg-brand"
                  style={{ background: "var(--red)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="m-0 shrink-0 text-[11.5px] text-[#5b6169]">
          © 2026 Monitorly, Inc.
        </p>
      </div>

      <div className="flex min-h-full flex-col items-center justify-center overflow-hidden p-6 [@media(max-width:520px)]:px-[18px] [@media(max-width:520px)]:py-8">
        <Link className="mb-6 hidden items-center gap-[10px] text-[16px] font-extrabold tracking-[-0.6px] [@media(max-width:1080px)]:flex" to="/">
          <span className="grid size-[23px] place-items-center rounded-[7px] border-2 border-brand [&>i]:block [&>i]:size-[7px] [&>i]:rounded-full [&>i]:bg-brand">
            <i></i>
          </span>
          monitorly
        </Link>
        <div className="w-full max-w-[376px]">{children}</div>
      </div>
    </div>
  );
}
