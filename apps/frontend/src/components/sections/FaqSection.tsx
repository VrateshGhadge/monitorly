import { useState } from "react";
import { cn } from "../../lib/utils";
import { faqs } from "../../data/faqs";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-14 [@media(min-width:561px)]:py-[76px] [@media(min-width:861px)]:py-28" style={{ paddingTop: 0 }}>
      <div className="mx-auto w-[min(calc(100%-44px),1180px)] [@media(max-width:560px)]:w-[calc(100%-40px)]">
        <div className="text-center">
          <div className="mb-[13px] font-code text-[11px] leading-[normal] tracking-[0.1em] text-brand uppercase">Questions, answered</div>
          <h2 className="m-auto max-w-[650px] text-[clamp(29px,4vw,46px)] leading-[1.12] tracking-[-2px] [@media(max-width:560px)]:text-[clamp(26px,7.5vw,32px)] [@media(max-width:560px)]:tracking-[-1.2px]">Everything you need to know.</h2>
        </div>
        <div className="mx-auto mt-10 max-w-[760px] [@media(max-width:560px)]:mt-7">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                className="border-b border-line"
                key={faq.question}
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-none p-0 py-[17px] text-left text-[14px] font-semibold text-ink transition-colors duration-150 hover:text-brand focus-visible:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand [@media(max-width:560px)]:text-[13.5px] [@media(max-width:560px)]:leading-[1.4]"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {faq.question}
                  <span className={cn(
                    "shrink-0 text-[18px] leading-none font-normal text-brand transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isOpen && "rotate-[135deg]",
                  )} aria-hidden="true">
                    +
                  </span>
                </button>
                <div className={cn(
                  "grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  isOpen && "grid-rows-[1fr]",
                )}>
                  <div className="overflow-hidden [&_p]:mb-[17px] [&_p]:max-w-[620px] [&_p]:text-[13px] [&_p]:text-muted">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
