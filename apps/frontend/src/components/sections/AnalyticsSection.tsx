import { uptimeBarHeights } from "../../data/uptimeBars";

export default function AnalyticsSection() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap analytics">
        <div className="analytics-card">
          <div className="bigstat">
            99.997<span>%</span>
          </div>
          <p>Average uptime across all Monitorly customers this month.</p>
          <div className="uptime-bars">
            {uptimeBarHeights.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }}></i>
            ))}
          </div>
        </div>
        <div>
          <div className="kicker">Evidence, not guesses</div>
          <h2 className="section-title">
            Turn your operations data into confidence.
          </h2>
          <p className="section-copy">
            Response-time trends and availability history give your team the
            context to make better decisions—and prove reliability to customers.
          </p>
        </div>
      </div>
    </section>
  );
}
