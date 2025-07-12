import { useState } from "react";
import "../styles/DashboardPage.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

type Props = {
  onWorkoutAdded: () => void;
  onCancel: () => void;
};

export default function WorkoutForm({ onWorkoutAdded, onCancel }: Props) {
  const [type, setType] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const getUsername = (tok: string | null) => {
    if (!tok) return null;
    try {
      return JSON.parse(atob(tok.split(".")[1])).sub;
    } catch {
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      setError("Workout type is required");
      return;
    }

    const username = getUsername(token);
    if (!token || !username) {
      setError("You must be logged in");
      return;
    }

    fetch(`${API}/workouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: username,
        workout_id: Date.now().toString(),
        type,
        sets: Number(sets),
        reps: Number(reps),
        weight
      })
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        setType("");
        setSets("");
        setReps("");
        setWeight("");
        onWorkoutAdded();
      })
      .catch(() => setError("Something went wrong"));
  };

  return (
    <form className="workout-form" onSubmit={handleSubmit}>
      {error && <p className="msg">{error}</p>}
      <input
        type="text"
        placeholder="Workout type"
        value={type}
        onChange={(e) => setType(e.target.value)}
      />
      <input
        type="number"
        placeholder="Sets"
        value={sets}
        onChange={(e) => setSets(e.target.value)}
        min="0"
      />
      <input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        min="0"
      />
      <input
        type="text"
        placeholder="Weight (e.g., 15 kg or 20 lb)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <div className="row">
        <button className="primary-btn half" type="submit">
          Add
        </button>
        <button
          type="button"
          className="primary-btn half"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
