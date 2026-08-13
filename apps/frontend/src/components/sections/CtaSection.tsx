import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section className="cta" id="start">
      <div className="wrap">
        <div className="cta-box">
          <div className="eyebrow">
            <i className="pulse"></i> 14 days free · no card required
          </div>
          <h2>
            Production is too important
            <br />
            to leave unobserved.
          </h2>
          <p>Set up your first monitor in minutes. Keep it that way.</p>
          <Link className="button primary" to="/signup">
            Start monitoring free
          </Link>
        </div>
      </div>
    </section>
  );
}
