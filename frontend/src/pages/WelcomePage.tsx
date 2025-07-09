import { Link } from "react-router-dom";
import "../styles/WelcomePage.css";

export default function WelcomePage() {
  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Welcome to Workout Tracker</h1>
      <div className="welcome-buttons">
        <Link to="/login">
          <button className="welcome-button login">Log In</button>
        </Link>
        <Link to="/signup">
          <button className="welcome-button signup">Sign Up</button>
        </Link>
      </div>
    </div>
  );
}
