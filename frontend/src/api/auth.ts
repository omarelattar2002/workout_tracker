import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export function login(username: string, password: string) {
  return axios.post(`${API}/auth/login`, { username, password });
}

export function signup(username: string, password: string) {
  return axios.post(`${API}/auth/signup`, { username, password });
}
