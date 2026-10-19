import { footerLinkGroups } from "../../data/footerLinks";

export default function Footer() {
  return (
    <footer className="border-t border-line pt-10 pb-20 [@media(max-width:760px)]:pt-8 [@media(max-width:760px)]:pb-[60px]">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)]">
        <div className="flex items-start justify-between gap-8 [@media(max-width:760px)]:block">
          <div>
            <a className="flex items-center gap-[10px] text-[17px] font-extrabold tracking-[-0.6px] [@media(max-width:560px)]:text-[16px] [@media(max-width:560px)]:tracking-[-0.5px]" href="#top">
              <span className="grid size-[23px] place-items-center rounded-[7px] border-2 border-brand [&>i]:block [&>i]:size-[7px] [&>i]:rounded-full [&>i]:bg-brand">
                <i></i>
              </span>
              monitorly
            </a>
            <p className="mt-3 max-w-[300px] text-[14px] leading-[1.7] text-muted [@media(max-width:760px)]:mb-7">
              Dependable uptime monitoring for the people responsible for
              production.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 [@media(min-width:761px)]:mt-0 [@media(min-width:761px)]:grid-cols-[repeat(2,120px)] [@media(min-width:761px)]:gap-7 [&_b]:mb-3 [&_b]:block [&_b]:text-[13px] [&_b]:text-ink [&_a]:mb-2.5 [&_a]:block [&_a]:text-[13px] [&_a]:text-muted [&_a]:transition-colors [&_a:hover]:text-ink">
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
        <div className="mt-7 flex items-center justify-between border-t border-line pt-[18px] font-code text-[11px] leading-[normal] text-[#69727c] [@media(max-width:760px)]:mt-6 [@media(max-width:760px)]:block [@media(max-width:760px)]:leading-[2]">
          <span>© 2026 Monitorly, Inc.</span>
          <span>Made for teams on call.</span>
        </div>
      </div>
    </footer>
  );
}
