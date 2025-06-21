import { useState } from "react";

type Props = {
  onWorkoutAdded: () => void;
};

export default function WorkoutForm({ onWorkoutAdded }: Props) {
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  function getUsernameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      setError("Workout type is required");
      return;
    }

    const username = getUsernameFromToken(token);
    if (!token || !username) {
      setError("You must be logged in");
      return;
    }

    fetch("http://localhost:8000/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: username,
        workout_id: Date.now().toString(), // unique ID using timestamp
        type: type
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add workout");
        return res.json();
      })
      .then(() => {
        setType("");
        onWorkoutAdded(); // refresh the dashboard
      })
      .catch(() => setError("Something went wrong"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add a Workout</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Workout type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <button type="submit">Add</button>
    </form>
  );
}
