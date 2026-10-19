import { uptimeBarHeights } from "../../data/uptimeBars";

export default function AnalyticsSection() {
  return (
    <section className="py-14 [@media(min-width:561px)]:py-[76px] [@media(min-width:861px)]:py-28" style={{ paddingTop: 0 }}>
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)] grid grid-cols-2 items-center gap-16 [@media(max-width:1080px)]:grid-cols-1 [@media(max-width:1080px)]:gap-10">
        <div className="rounded-[10px] border border-line bg-panel p-[22px] [@media(max-width:1080px)]:order-2">
          <div className="text-[48px] font-extrabold tracking-[-3px] [&>span]:text-[14px] [&>span]:tracking-normal [&>span]:text-brand">
            99.997<span>%</span>
          </div>
          <p className="mx-0 mt-1 mb-5 text-[12px] text-muted">Average uptime across all Monitorly customers this month.</p>
          <div className="flex h-[82px] items-end gap-1 [&>i]:flex-1 [&>i]:rounded-t-[2px] [&>i]:bg-[#266544] [&>i:nth-child(3n)]:!h-[60%] [&>i:nth-child(7n)]:bg-[#5c4a25]">
            {uptimeBarHeights.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }}></i>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-[13px] font-code text-[11px] leading-[normal] tracking-[0.1em] text-brand uppercase">Evidence, not guesses</div>
          <h2 className="m-0 max-w-[650px] text-[clamp(29px,4vw,46px)] leading-[1.12] tracking-[-2px] [@media(max-width:560px)]:text-[clamp(26px,7.5vw,32px)] [@media(max-width:560px)]:tracking-[-1.2px]">
            Turn your operations data into confidence.
          </h2>
          <p className="mt-4 mb-0 max-w-[520px] text-[16px] text-muted [@media(max-width:560px)]:mt-3 [@media(max-width:560px)]:text-[14.5px]">
            Response-time trends and availability history give your team the
            context to make better decisions—and prove reliability to customers.
          </p>
        </div>
      </div>
    </section>
  );
}
