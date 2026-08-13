import { useState } from "react";
import { faqs } from "../../data/faqs";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="pricing-head">
          <div className="kicker">Questions, answered</div>
          <h2 className="section-title">Everything you need to know.</h2>
        </div>
        <div className="faq">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                className={`faq-item${isOpen ? " open" : ""}`}
                key={faq.question}
              >
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {faq.question}
                  <span className="faq-icon" aria-hidden="true">
                    +
                  </span>
                </button>
                <div className="faq-answer-wrap">
                  <div className="faq-answer-inner">
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
