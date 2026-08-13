import { Fragment } from "react";
import { flowSteps } from "../../data/flowSteps";

export default function FlowSection() {
  return (
    <section className="flow-section">
      <div className="wrap">
        <div className="kicker">Less noise, faster resolution</div>
        <h2 className="section-title">
          The moment something breaks, everyone knows what to do.
        </h2>
        <div className="flow">
          {flowSteps.map((step, i) => (
            <Fragment key={step.num}>
              {i > 0 && <span className="arrow">→</span>}
              <div className="flow-card">
                <span className="num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
