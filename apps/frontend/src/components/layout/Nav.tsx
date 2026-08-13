import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="wrap">
        <a className="brand" href="#top">
          <span className="mark">
            <i></i>
          </span>
          monitorly
        </a>
        <div className="links">
          <a href="#product">Product</a>
          <a href="#why">Why Monitorly</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <Link className="ghost" to="/signin">
            Sign in
          </Link>
          <Link className="button primary" to="/signup">
            Start monitoring
          </Link>
        </div>
      </div>
    </nav>
  );
}
