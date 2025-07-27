import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkoutForm from "../components/WorkouForm";
import "../styles/DashboardPage.css";
import { filterWorkouts, downloadReport } from "../api/workouts";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

type Workout = {
  workout_id: string;
  type: string;
  sets: number;
  reps: number;
  weight: string;
};

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedType, setEditedType] = useState("");
  const [editedSets, setEditedSets] = useState("");
  const [editedReps, setEditedReps] = useState("");
  const [editedWeight, setEditedWeight] = useState("");
  const [filterType, setFilterType] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchWorkouts = () => {
    if (!token) return;
    fetch(`${API}/workouts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setWorkouts(d.workouts || []))
      .catch(() => setMessage("Failed to fetch workouts"));
  };

  const handleUpdate = (id: string) => {
    if (!token) return;
    fetch(`${API}/workouts/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: editedType,
        sets: Number(editedSets),
        reps: Number(editedReps),
        weight: editedWeight,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        setEditingId(null);
        fetchWorkouts();
      })
      .catch(() => setMessage("Failed to update workout"));
  };

  const handleDelete = (id: string) => {
    if (!token) return;
    fetch(`${API}/workouts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        fetchWorkouts();
      })
      .catch(() => setMessage("Failed to delete workout"));
  };

  const handleFilter = () => {
    if (!token) return;
    filterWorkouts(token, filterType)
      .then((res) => setWorkouts(res.data.workouts))
      .catch(() => setMessage("Failed to filter workouts"));
  };

  const handleReport = () => {
    if (!token) return;
    downloadReport(token)
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "workout_report.csv");
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => setMessage("Failed to download report"));
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWorkouts();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="header-bar">
        <h1>Workout Dashboard</h1>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Filter by type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        />
        <button className="primary-btn half" onClick={handleFilter}>
          Filter
        </button>
        <button className="primary-btn half" onClick={fetchWorkouts}>
          Reset
        </button>
        <button className="primary-btn half" onClick={handleReport}>
          Generate Report
        </button>
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
                  <input value={editedType} onChange={(e) => setEditedType(e.target.value)} placeholder="Type" />
                  <input type="number" value={editedSets} onChange={(e) => setEditedSets(e.target.value)} placeholder="Sets" />
                  <input type="number" value={editedReps} onChange={(e) => setEditedReps(e.target.value)} placeholder="Reps" />
                </div>
                <div className="column center">
                  <input value={editedWeight} onChange={(e) => setEditedWeight(e.target.value)} placeholder="Weight" />
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
                  <button className="primary-btn half" onClick={() => {
                    setEditingId(w.workout_id);
                    setEditedType(w.type);
                    setEditedSets(String(w.sets));
                    setEditedReps(String(w.reps));
                    setEditedWeight(w.weight);
                  }}>Edit</button>
                  <button className="primary-btn half" onClick={() => handleDelete(w.workout_id)}>Delete</button>
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
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}
