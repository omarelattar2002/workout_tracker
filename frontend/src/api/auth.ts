import axios from "axios";

const API_URL = "http://localhost:8000/auth";

export async function signup(username: string, password: string) {
    return axios.post(`${API_URL}/signup`, { username, password });
}

export async function login(username: string, password: string) {
    return axios.post(`${API_URL}/login`, { username, password });
}
