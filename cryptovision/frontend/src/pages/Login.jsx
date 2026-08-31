import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      localStorage.setItem("cryptovision_token", res.data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="nav-brand" style={{ marginBottom: 24 }}>
          Crypto<span className="accent-dot">Vision</span>
        </div>
        <h1 style={{ fontSize: 18, marginBottom: 20 }}>Log in</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="text-muted" style={{ fontSize: 13, marginTop: 18, textAlign: "center" }}>
          No account? <Link to="/register" style={{ color: "var(--accent)" }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
