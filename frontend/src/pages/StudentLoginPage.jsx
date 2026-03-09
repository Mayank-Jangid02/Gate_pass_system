import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role: "student" }),
      });
      localStorage.setItem("gp_token", data.token);
      localStorage.setItem("gp_user", JSON.stringify(data.user));
      navigate("/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Student Login</h2>
        <p className="mt-1 text-sm text-slate-600">
          Log in to request and track your gate passes.
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 space-y-2 text-center text-xs text-slate-600">
          <p>
            New student?{" "}
            <Link to="/signup" className="font-medium text-primary-600 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            Are you faculty?{" "}
            <Link
              to="/login/faculty"
              className="font-medium text-primary-600 hover:underline"
            >
              Faculty Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

