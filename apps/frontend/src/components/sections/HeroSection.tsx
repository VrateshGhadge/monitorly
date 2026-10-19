import DashboardDemo from "../dashboard/DashboardDemo";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-14 pb-11 text-center [@media(min-width:561px)]:pt-[76px] [@media(min-width:561px)]:pb-14 [@media(min-width:861px)]:pt-28 [@media(min-width:861px)]:pb-[78px]">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-[5px] font-code text-[12px] leading-[normal] text-[#bec4cc]">
          <i className="size-1.5 rounded-full bg-brand shadow-[0_0_0_3px_rgba(80,216,144,0.12)]"></i> All systems operational
        </div>
        <h1 className="mx-auto mt-5 mb-[19px] max-w-[800px] text-[clamp(30px,9vw,40px)] leading-[1.08] tracking-[-1.6px] [@media(min-width:561px)]:tracking-[-2.6px] [@media(min-width:861px)]:text-[clamp(42px,6vw,72px)] [@media(min-width:861px)]:leading-[1.06] [@media(min-width:861px)]:tracking-[-3.8px]">Know before your users do.</h1>
        <p className="mx-auto max-w-[570px] text-[15px] leading-[1.6] text-muted [@media(min-width:561px)]:text-[17px] [@media(min-width:561px)]:leading-[1.65]">
          Fast, reliable website and API monitoring with instant email alerts.
          Set up a monitor in minutes and watch it from a clean, dependable
          dashboard.
        </p>
        <div className="mt-[26px] flex flex-col items-stretch justify-center gap-2.5 [@media(min-width:561px)]:mt-[31px] [@media(min-width:561px)]:flex-row [@media(min-width:561px)]:gap-3">
          <a className="flex justify-center bg-[#e9edf0] px-[18px] py-[13px] text-[14px] whitespace-normal text-[#111] hover:-translate-y-px hover:bg-white [@media(min-width:561px)]:inline-flex [@media(min-width:561px)]:py-3 [@media(min-width:561px)]:text-[15px] [@media(min-width:561px)]:whitespace-nowrap" href="#start">
            Start monitoring free
          </a>
          <a className="flex justify-center bg-panel px-[18px] py-[13px] text-[14px] whitespace-normal text-[#dce0e5] [outline:1px_solid_currentColor] [@media(min-width:561px)]:inline-flex [@media(min-width:561px)]:py-3 [@media(min-width:561px)]:text-[15px] [@media(min-width:561px)]:whitespace-nowrap" href="#product">
            Explore the platform →
          </a>
        </div>

        <DashboardDemo />
      </div>
    </section>
  );
}
