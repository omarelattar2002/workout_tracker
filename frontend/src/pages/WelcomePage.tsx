import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-6">Welcome to Workout Tracker</h1>
      <div className="space-x-4">
        <Link to="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">Log In</button>
        </Link>
        <Link to="/signup">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg">Sign Up</button>
        </Link>
      </div>
    </div>
  );
}
