import { features } from "../../data/features";

export default function FeaturesSection() {
  return (
    <section id="product">
      <div className="wrap">
        <div className="feature-head">
          <div>
            <div className="kicker">Built for production</div>
            <h2 className="section-title">
              A clearer view of every critical system.
            </h2>
          </div>
          <p className="section-copy">
            Monitorly brings website and API monitoring into one calm,
            dependable control room.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <article className="feature" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
