import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export function filterWorkouts(token: string, workoutType?: string) {
  const params = workoutType ? { workout_type: workoutType } : {};
  return axios.get(`${API}/workouts/filter`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
}

export function downloadReport(token: string) {
  return axios.get(`${API}/workouts/report`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
}
