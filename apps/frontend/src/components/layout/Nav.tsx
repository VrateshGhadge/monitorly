import { useState } from "react";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[rgba(38,43,51,0.8)] bg-[rgba(11,13,16,0.92)] backdrop-blur-[12px] [@media(max-width:860px)]:h-16">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)] flex h-full items-center justify-between [@media(max-width:560px)]:gap-3 [@media(max-width:380px)]:gap-2">
        <a className="flex items-center gap-[10px] text-[17px] font-extrabold tracking-[-0.6px] [@media(max-width:560px)]:text-[16px] [@media(max-width:560px)]:tracking-[-0.5px]" href="#top" onClick={() => setOpen(false)}>
          <span className="grid size-[23px] place-items-center rounded-[7px] border-2 border-brand [&>i]:block [&>i]:size-[7px] [&>i]:rounded-full [&>i]:bg-brand">
            <i></i>
          </span>
          monitorly
        </a>

        <div className={cn(
          "contents [@media(max-width:860px)]:absolute [@media(max-width:860px)]:top-full [@media(max-width:860px)]:right-0 [@media(max-width:860px)]:left-0 [@media(max-width:860px)]:z-[19] [@media(max-width:860px)]:flex [@media(max-width:860px)]:flex-col [@media(max-width:860px)]:gap-0 [@media(max-width:860px)]:border-b [@media(max-width:860px)]:border-line [@media(max-width:860px)]:bg-[#0d1014] [@media(max-width:860px)]:px-[22px] [@media(max-width:860px)]:pt-2 [@media(max-width:860px)]:pb-[18px] [@media(max-width:860px)]:shadow-[0_24px_40px_rgba(0,0,0,0.45)] [@media(max-width:860px)]:[transition:transform_0.18s_ease,opacity_0.18s_ease,visibility_0.18s] [@media(max-width:860px)]:-translate-y-2 [@media(max-width:860px)]:opacity-0 [@media(max-width:860px)]:invisible [@media(max-width:860px)]:pointer-events-none",
          open && "[@media(max-width:860px)]:translate-y-0 [@media(max-width:860px)]:opacity-100 [@media(max-width:860px)]:visible [@media(max-width:860px)]:pointer-events-auto",
        )}>
          <div className="flex gap-7 text-[13px] text-[#b8bec7] [&_a:hover]:text-white [@media(max-width:860px)]:flex-col [@media(max-width:860px)]:gap-0.5 [@media(max-width:860px):&_a]:block [@media(max-width:860px):&_a]:px-0.5 [@media(max-width:860px):&_a]:py-2.5 [@media(max-width:860px):&_a]:text-[14px]">
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
          <div className="flex items-center gap-1.5 text-[13px] [@media(min-width:561px)]:gap-2.5 [@media(min-width:861px)]:gap-5 [@media(max-width:860px)]:mt-2.5 [@media(max-width:860px)]:border-t [@media(max-width:860px)]:border-line [@media(max-width:860px)]:pt-3.5">
            <Link className="[@media(max-width:560px)]:hidden [@media(max-width:860px)]:inline-flex [@media(max-width:860px)]:items-center [@media(max-width:860px)]:justify-center [@media(max-width:860px)]:px-[15px] [@media(max-width:860px)]:py-2.5" to="/signin">
              Sign in
            </Link>
            <Link className="cursor-pointer rounded-[7px] border-0 bg-[#e9edf0] px-[15px] py-[9px] font-bold whitespace-nowrap text-[#111] transition-[0.2s] hover:-translate-y-px hover:bg-white [@media(max-width:860px)]:flex-1 [@media(max-width:860px)]:text-center [@media(max-width:560px)]:px-3 [@media(max-width:560px)]:py-2 [@media(max-width:560px)]:text-[12.5px] [@media(max-width:380px)]:px-2.5 [@media(max-width:380px)]:py-2 [@media(max-width:380px)]:text-[12px]" to="/signup">
              Start monitoring
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="hidden size-[38px] cursor-pointer items-center justify-center rounded-[7px] border border-line bg-transparent text-[#c5cad1] hover:border-[#3a4048] hover:text-white [@media(max-width:860px)]:inline-flex [@media(max-width:560px)]:size-9 [@media(max-width:560px)]:shrink-0"
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
