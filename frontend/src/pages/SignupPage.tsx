import { useState } from "react";
import { signup } from "../api/auth";
import "../styles/AuthPages.css";
import { Link } from "react-router-dom";

export default function SignupPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup(username, password);
            setMessage("Signup successful! You can now log in.");
        } catch (error: any) {
            setMessage(error.response?.data?.detail || "Signup failed");
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
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
                <button type="submit">Sign Up</button>
            </form>
            {message && <p>{message}</p>}
            <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
    );
}
