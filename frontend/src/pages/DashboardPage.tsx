import { useEffect, useState } from "react";
import WorkoutForm from "../components/WorkouForm";

type Workout = {
  user_id: string;
  workout_id: string;
  type: string;
  sets: number;
  reps: number;
  weight:string;
};


export default function DashboardPage() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [message, setMessage] = useState("");
    const [redirect, setRedirect] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedType, setEditedType] = useState("");
    const [editedSets, setEditedSets] = useState(0);
    const [editedReps, setEditedReps] = useState(0);
    const [editedWeight, setEditedWeight] = useState("");


    const token = localStorage.getItem("token");
    const username = getUsernameFromToken(token);

    function getUsernameFromToken(token: string | null): string | null {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.sub;
        } catch {
            return null;
        }
    }

    const fetchWorkouts = () => {
        if (!token || !username) return;
        fetch(`http://localhost:8000/workouts/${username}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data) => setWorkouts(data.workouts || []))
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
      new_sets: editedSets,
      new_reps: editedReps,
      new_weight: editedWeight
    })
  })
    .then((res) => {
      if (!res.ok) throw new Error();
      setEditingId(null);
      fetchWorkouts();
    })
    .catch(() => setMessage("Failed to update workout"));
};



    const handleDelete = (id: string) => {
        if (!token || !username) return;

        fetch(`http://localhost:8000/workouts/${username}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                fetchWorkouts(); // refresh list
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
        <div style={{ maxWidth: "600px", margin: "auto", padding: "1rem" }}>
            <h1>Workout Dashboard</h1>

            <button onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }}>
                Logout
            </button>

            {message && <p>{message}</p>}
            <WorkoutForm onWorkoutAdded={fetchWorkouts} />
            <h3>Your Workouts:</h3>
<ul>
  {workouts.map((w) => (
    <li key={w.workout_id}>
{editingId === w.workout_id ? (
  <>
    <input value={editedType} onChange={(e) => setEditedType(e.target.value)} />
    <input type="number" value={editedSets} onChange={(e) => setEditedSets(Number(e.target.value))} />
    <input type="number" value={editedReps} onChange={(e) => setEditedReps(Number(e.target.value))} />
    <input value={editedWeight} onChange={(e) => setEditedWeight(e.target.value)} placeholder="e.g., 15 kg or 20 lb" />
    <button onClick={() => handleUpdate(w.workout_id)}>Save</button>
    <button onClick={() => setEditingId(null)}>Cancel</button>
  </>
) : (
  <>
    {w.type} — {w.sets} sets x {w.reps} reps — {w.weight}
    <button onClick={() => {
      setEditingId(w.workout_id);
      setEditedType(w.type);
      setEditedSets(w.sets);
      setEditedReps(w.reps);
      setEditedWeight(w.weight);
    }}>
      Edit
    </button>
    <button onClick={() => handleDelete(w.workout_id)}>Delete</button>
  </>
)}

    </li>
  ))}
</ul>


        </div>
    );
}
