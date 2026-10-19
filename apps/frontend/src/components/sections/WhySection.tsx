import { whyPoints } from "../../data/whyPoints";

export default function WhySection() {
  return (
    <section id="why" className="py-14 [@media(min-width:561px)]:py-[76px] [@media(min-width:861px)]:py-28">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)] grid grid-cols-[0.8fr_1.2fr] items-center gap-20 [@media(max-width:1080px)]:grid-cols-1 [@media(max-width:1080px)]:gap-12">
        <div>
          <div className="mb-[13px] font-code text-[11px] leading-[normal] tracking-[0.1em] text-brand uppercase">Why choose Monitorly</div>
          <h2 className="m-0 max-w-[650px] text-[clamp(29px,4vw,46px)] leading-[1.12] tracking-[-2px] [@media(max-width:560px)]:text-[clamp(26px,7.5vw,32px)] [@media(max-width:560px)]:tracking-[-1.2px]">
            Just the monitoring you need, nothing you don't.
          </h2>
          <p className="mt-4 mb-0 max-w-[520px] text-[16px] text-muted [@media(max-width:560px)]:mt-3 [@media(max-width:560px)]:text-[14.5px]">
            No bloated setup, no features you'll never use. Monitorly watches
            your websites and APIs and emails you the moment something changes.
          </p>
          <a className="mt-[23px] inline-block text-[13px] text-[#c7e9d6]" href="#pricing">
            See pricing →
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2 [@media(min-width:381px)]:gap-2.5 [@media(min-width:561px)]:grid-cols-3 [@media(min-width:561px)_and_(max-width:1080px)]:max-w-[560px]">
          {whyPoints.map((item) => (
            <div className="flex h-[102px] flex-col items-center justify-center gap-2 rounded-[8px] border border-line bg-panel text-[11px] font-semibold text-[#cdd2d8] [@media(max-width:560px)]:h-[90px] [@media(max-width:380px)]:text-[10.5px]" key={item.name}>
              <span className="grid size-[29px] place-items-center rounded-[6px] bg-[#202631] text-[15px]">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
