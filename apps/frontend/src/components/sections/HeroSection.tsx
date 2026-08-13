import DashboardDemo from "../dashboard/DashboardDemo";

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="eyebrow">
          <i className="pulse"></i> All systems operational
        </div>
        <h1>Know before your users do.</h1>
        <p>
          Fast, reliable website and API monitoring with instant email alerts.
          Set up a monitor in minutes and watch it from a clean, dependable
          dashboard.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#start">
            Start monitoring free
          </a>
          <a className="button outline" href="#product">
            Explore the platform →
          </a>
        </div>

        <DashboardDemo />
      </div>
    </section>
  );
}
