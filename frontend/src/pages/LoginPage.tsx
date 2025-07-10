import { useState } from "react";
import { login } from "../api/auth";
import "../styles/AuthPages.css";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await login(username, password);
            const token = res.data.access_token;
            localStorage.setItem("token", token);
            setMessage("Login successful!");
        } catch (error: any) {
            setMessage(error.response?.data?.detail || "Login failed");
        }
    };

    return (
        <div className="auth-container">
            <h2>Log In</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Log In</button>
            </form>
            {message && <p>{message}</p>}
            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
    );
}
