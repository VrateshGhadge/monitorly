import { whyPoints } from "../../data/whyPoints";

export default function WhySection() {
  return (
    <section id="why">
      <div className="wrap integration-area">
        <div>
          <div className="kicker">Why choose Monitorly</div>
          <h2 className="section-title">
            Just the monitoring you need, nothing you don't.
          </h2>
          <p className="section-copy">
            No bloated setup, no features you'll never use. Monitorly watches
            your websites and APIs and emails you the moment something changes.
          </p>
          <a className="all-link" href="#pricing">
            See pricing →
          </a>
        </div>
        <div className="integration-grid">
          {whyPoints.map((item) => (
            <div className="integration" key={item.name}>
              <span className="iconbox">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
