import { useEffect, useState } from "react";
import WorkoutForm from "../components/WorkouForm";
import "../styles/DashboardPage.css";

type Workout = {
  user_id: string;
  workout_id: string;
  type: string;
  sets: number;
  reps: number;
  weight: string;
};

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedType, setEditedType] = useState("");
  const [editedSets, setEditedSets] = useState("");
  const [editedReps, setEditedReps] = useState("");
  const [editedWeight, setEditedWeight] = useState("");

  const token = localStorage.getItem("token");
  const username = getUsernameFromToken(token);

  function getUsernameFromToken(tok: string | null): string | null {
    if (!tok) return null;
    try {
      return JSON.parse(atob(tok.split(".")[1])).sub;
    } catch {
      return null;
    }
  }

  const fetchWorkouts = () => {
    if (!token || !username) return;
    fetch(`http://localhost:8000/workouts/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => setWorkouts(d.workouts || []))
      .catch(() => setMessage("Failed to fetch workouts"));
  };

  const handleUpdate = (id: string) => {
    if (!token || !username) return;
    fetch(`http://localhost:8000/workouts/${username}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        new_type: editedType,
        new_sets: Number(editedSets),
        new_reps: Number(editedReps),
        new_weight: editedWeight
      })
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        setEditingId(null);
        fetchWorkouts();
      })
      .catch(() => setMessage("Failed to update workout"));
  };

  const handleDelete = (id: string) => {
    if (!token || !username) return;
    fetch(`http://localhost:8000/workouts/${username}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        fetchWorkouts();
      })
      .catch(() => setMessage("Failed to delete workout"));
  };

  useEffect(() => {
    if (!token || !username) {
      setRedirect(true);
      return;
    }
    fetchWorkouts();
  }, []);

  if (redirect) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="header-bar">
        <h1>Workout Dashboard</h1>
      </div>

      {!showForm && (
        <button className="primary-btn full" onClick={() => setShowForm(true)}>
          Add
        </button>
      )}

      {showForm && (
        <WorkoutForm
          onWorkoutAdded={() => {
            setShowForm(false);
            fetchWorkouts();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {message && <p className="msg">{message}</p>}

      <ul className="workout-list">
        {workouts.map((w) => (
          <li key={w.workout_id} className="workout-box">
            {editingId === w.workout_id ? (
              <div className="row">
                <div className="column left">
                  <input
                    value={editedType}
                    onChange={(e) => setEditedType(e.target.value)}
                    placeholder="Type"
                  />
                  <input
                    type="number"
                    value={editedSets}
                    onChange={(e) => setEditedSets(e.target.value)}
                    placeholder="Sets"
                  />
                  <input
                    type="number"
                    value={editedReps}
                    onChange={(e) => setEditedReps(e.target.value)}
                    placeholder="Reps"
                  />
                </div>
                <div className="column center">
                  <input
                    value={editedWeight}
                    onChange={(e) => setEditedWeight(e.target.value)}
                    placeholder="Weight"
                  />
                </div>
                <div className="column right">
                  <button className="primary-btn half" onClick={() => handleUpdate(w.workout_id)}>Save</button>
                  <button className="primary-btn half" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="column left">
                  <div className="label">{w.type}</div>
                  <div className="label">{w.sets} sets</div>
                  <div className="label">{w.reps} reps</div>
                </div>
                <div className="column center">
                  <div className="weight">{w.weight}</div>
                </div>
                <div className="column right">
                  <button
                    className="primary-btn half"
                    onClick={() => {
                      setEditingId(w.workout_id);
                      setEditedType(w.type);
                      setEditedSets(String(w.sets));
                      setEditedReps(String(w.reps));
                      setEditedWeight(w.weight);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="primary-btn half"
                    onClick={() => handleDelete(w.workout_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <button
        className="primary-btn full logout"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}
