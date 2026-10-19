import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section className="py-10 pt-10 pb-7 text-center" id="start">
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)]">
        <div className="rounded-[12px] border border-[#294635] bg-[#101713] px-[22px] py-10 [background-image:radial-gradient(ellipse_at_center,rgba(43,112,71,0.14),transparent_64%)] [@media(max-width:560px)]:px-5 [@media(max-width:560px)]:py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-[5px] font-code text-[12px] leading-[normal] text-[#bec4cc]">
            <i className="size-1.5 rounded-full bg-brand shadow-[0_0_0_3px_rgba(80,216,144,0.12)]"></i> 14 days free · no card required
          </div>
          <h2 className="m-0 text-[clamp(29px,4vw,45px)] tracking-[-2px] [@media(max-width:560px)]:text-[clamp(26px,7.5vw,32px)] [@media(max-width:560px)]:leading-[1.15] [@media(max-width:560px)]:tracking-[-1.2px]">
            Production is too important
            <br />
            to leave unobserved.
          </h2>
          <p className="mx-auto mt-3 mb-6 max-w-[490px] text-muted">Set up your first monitor in minutes. Keep it that way.</p>
          <Link className="bg-[#e9edf0] text-[#111] hover:-translate-y-px hover:bg-white [@media(max-width:560px)]:px-3 [@media(max-width:560px)]:py-2 [@media(max-width:560px)]:text-[12.5px] [@media(max-width:560px)]:whitespace-nowrap [@media(max-width:380px)]:px-2.5 [@media(max-width:380px)]:text-[12px]" to="/signup">
            Start monitoring free
          </Link>
        </div>
      </div>
    </section>
  );
}
