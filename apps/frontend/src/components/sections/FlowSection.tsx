import { Fragment } from "react";
import { flowSteps } from "../../data/flowSteps";

export default function FlowSection() {
  return (
    <section className="border-y border-line bg-[#0e1115] py-14 [@media(min-width:561px)]:py-[76px] [@media(min-width:861px)]:py-28">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)]">
        <div className="mb-[13px] font-code text-[11px] leading-[normal] tracking-[0.1em] text-brand uppercase">Less noise, faster resolution</div>
        <h2 className="m-0 max-w-[650px] text-[clamp(29px,4vw,46px)] leading-[1.12] tracking-[-2px] [@media(max-width:560px)]:text-[clamp(26px,7.5vw,32px)] [@media(max-width:560px)]:tracking-[-1.2px]">
          The moment something breaks, everyone knows what to do.
        </h2>
        <div className="mt-[42px] grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-[15px] [@media(max-width:960px)]:grid-cols-1 [@media(max-width:960px)]:gap-3 [@media(max-width:560px)]:mt-7">
          {flowSteps.map((step, i) => (
            <Fragment key={step.num}>
              {i > 0 && <span className="text-[19px] text-[#53606b] [@media(max-width:960px)]:hidden">→</span>}
              <div className="min-h-[150px] rounded-[8px] border border-line bg-panel p-[19px] [@media(max-width:560px)]:min-h-0">
                <span className="font-code text-[10px] leading-[normal] text-brand">{step.num}</span>
                <h3 className="mx-0 mt-[19px] mb-1 text-[15px]">{step.title}</h3>
                <p className="m-0 text-[12px] text-muted">{step.description}</p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
