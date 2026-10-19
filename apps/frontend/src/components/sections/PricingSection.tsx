import { pricingPlans } from "../../data/pricingPlans";
import { cn } from "../../lib/utils";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-14 [@media(min-width:561px)]:py-[76px] [@media(min-width:861px)]:py-28">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)]">
        <div className="text-center">
          <div className="mb-[13px] font-code text-[11px] leading-[normal] tracking-[0.1em] text-brand uppercase">Simple, predictable pricing</div>
          <h2 className="m-auto max-w-[650px] text-[clamp(29px,4vw,46px)] leading-[1.12] tracking-[-2px] [@media(max-width:560px)]:text-[clamp(26px,7.5vw,32px)] [@media(max-width:560px)]:tracking-[-1.2px]">Start monitoring for free.</h2>
          <p className="mx-auto my-[15px] max-w-[520px] text-[16px] text-muted [@media(max-width:560px)]:mt-3 [@media(max-width:560px)]:text-[14.5px]">
            Monitorly is currently free to use while we build out the product.
            No credit card required.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-[640px] grid-cols-2 items-stretch gap-[13px] [@media(max-width:860px)]:max-w-[480px] [@media(max-width:860px)]:grid-cols-1">
          {pricingPlans.map((plan) => (
            <article
              className={cn("relative rounded-[9px] border border-line bg-panel p-[25px]", plan.featured && "border-[#3c7755] bg-[#131916]")}
              key={plan.id}
            >
              {plan.tag && <span className="absolute top-4 right-4 rounded-[4px] border border-[#28543b] bg-[#173526] px-1.5 py-1 font-code text-[9px] leading-[normal] text-[#b9ebce]">{plan.tag}</span>}
              <h3 className="m-0 text-[16px]">{plan.name}</h3>
              <p className="m-0 h-[35px] text-[12px] text-muted [@media(max-width:560px)]:h-auto [@media(max-width:560px)]:min-h-0 [@media(max-width:560px)]:mt-1"> {plan.description}</p>
              <div className="my-[19px] text-[32px] font-extrabold tracking-[-1.5px] [&>small]:text-[11px] [&>small]:font-normal [&>small]:tracking-normal [&>small]:text-muted [@media(max-width:560px)]:my-3.5 [@media(max-width:560px)]:text-[28px]">
                {plan.price}
                {plan.price !== "—" && <small> / month</small>}
              </div>
              <a
                className={cn(
                  "mb-[18px] w-full cursor-pointer rounded-[7px] border-0 px-[15px] py-[9px] font-bold transition-[0.2s] [@media(max-width:860px)]:flex-1 [@media(max-width:860px)]:text-center",
                  plan.ctaVariant === "primary" ? "bg-[#e9edf0] text-[#111] hover:-translate-y-px hover:bg-white [@media(max-width:560px)]:px-3 [@media(max-width:560px)]:py-2 [@media(max-width:560px)]:text-[12.5px] [@media(max-width:560px)]:whitespace-nowrap [@media(max-width:380px)]:px-2.5 [@media(max-width:380px)]:text-[12px]" : "bg-panel text-[#dce0e5]",
                )}
                href={
                  plan.disabled
                    ? "mailto:hello@monitorly.dev?subject=Notify%20me"
                    : "#start"
                }
              >
                {plan.cta}
              </a>
              <ul className="m-0 list-none border-t border-line p-0 pt-[15px] [&>li]:relative [&>li]:my-[9px] [&>li]:pl-0 [&>li]:text-[11px] [&>li]:text-[#b9c0c8] [&>li]:before:mr-[7px] [&>li]:before:text-brand [&>li]:before:content-['✓']">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
