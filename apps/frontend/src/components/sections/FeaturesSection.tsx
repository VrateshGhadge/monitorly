import { features } from "../../data/features";

export default function FeaturesSection() {
  return (
    <section id="product" className="py-14 [@media(min-width:561px)]:py-[76px] [@media(min-width:861px)]:py-28">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)]">
        <div className="flex items-end justify-between [@media(max-width:860px)]:block">
          <div>
            <div className="mb-[13px] font-code text-[11px] leading-[normal] tracking-[0.1em] text-brand uppercase">Built for production</div>
            <h2 className="m-0 max-w-[650px] text-[clamp(29px,4vw,46px)] leading-[1.12] tracking-[-2px] [@media(max-width:560px)]:text-[clamp(26px,7.5vw,32px)] [@media(max-width:560px)]:tracking-[-1.2px]">
              A clearer view of every critical system.
            </h2>
          </div>
          <p className="mt-4 mb-0 max-w-[520px] text-[16px] text-muted [@media(max-width:860px)]:mt-3.5 [@media(max-width:860px)]:mb-0 [@media(max-width:560px)]:mt-3 [@media(max-width:560px)]:text-[14.5px]">
            Monitorly brings website and API monitoring into one calm,
            dependable control room.
          </p>
        </div>
        <div className="mt-[42px] grid grid-cols-3 gap-3 [@media(min-width:561px)_and_(max-width:860px)]:grid-cols-2 [@media(max-width:560px)]:mt-7 [@media(max-width:560px)]:grid-cols-1 [@media(max-width:560px)]:gap-2.5">
          {features.map((f) => (
            <article className="min-h-[205px] rounded-[9px] border border-line bg-panel p-[25px] [@media(max-width:560px)]:min-h-0 [@media(max-width:560px)]:p-5" key={f.title}>
              <div className="mb-5 grid size-[30px] place-items-center rounded-[6px] bg-[#1a2320] text-brand [&_svg]:w-4 [@media(max-width:560px)]:mb-3.5">{f.icon}</div>
              <h3 className="mt-0 mb-2 text-[15px] tracking-[-0.4px]">{f.title}</h3>
              <p className="m-0 text-[13px] leading-[1.65] text-muted">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
