import { Link } from "react-router-dom";
import Lead from "../../components/atoms/Lead";
import "../../components/atoms/Button/Button.css";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <main className="not-found">
      <div className="not-found__content">
        <span className="not-found__code">404</span>
        <h1 className="not-found__title">Page not found</h1>
        <Lead size="large" className="not-found__lead">
          The route you requested does not exist. Try returning to the main scene.
        </Lead>
        <div className="not-found__actions">
          <Link className="button button--primary" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
