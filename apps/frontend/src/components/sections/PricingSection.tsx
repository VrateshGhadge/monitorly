import { pricingPlans } from "../../data/pricingPlans";

export default function PricingSection() {
  return (
    <section id="pricing">
      <div className="wrap">
        <div className="pricing-head">
          <div className="kicker">Simple, predictable pricing</div>
          <h2 className="section-title">Start monitoring for free.</h2>
          <p className="section-copy">
            Monitorly is currently free to use while we build out the product.
            No credit card required.
          </p>
        </div>
        <div className="pricing">
          {pricingPlans.map((plan) => (
            <article
              className={`price${plan.featured ? " featured" : ""}`}
              key={plan.id}
            >
              {plan.tag && <span className="tag">{plan.tag}</span>}
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="amount">
                {plan.price}
                {plan.price !== "—" && <small> / month</small>}
              </div>
              <a
                className={`button ${plan.ctaVariant}`}
                href={
                  plan.disabled
                    ? "mailto:hello@monitorly.dev?subject=Notify%20me"
                    : "#start"
                }
              >
                {plan.cta}
              </a>
              <ul>
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
