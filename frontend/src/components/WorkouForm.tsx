import { useState } from "react";

type Props = {
  onWorkoutAdded: () => void;
};

export default function WorkoutForm({ onWorkoutAdded }: Props) {
  const [type, setType] = useState("");
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState("");
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
        workout_id: Date.now().toString(),
        type,
        sets,
        reps,
        weight
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add workout");
        return res.json();
      })
      .then(() => {
        setType("");
        setSets(0);
        setReps(0);
        setWeight("");
        onWorkoutAdded();
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
      <input
        type="number"
        placeholder="Sets"
        value={sets}
        onChange={(e) => setSets(Number(e.target.value))}
        style={{ marginRight: "0.5rem" }}
      />
      <input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(Number(e.target.value))}
        style={{ marginRight: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Weight (e.g., 15 kg or 20 lb)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        style={{ marginRight: "0.5rem" }}
      />
      <button type="submit">Add</button>
    </form>
  );
}
