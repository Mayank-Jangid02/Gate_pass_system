import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

export default function FacultyLoginPage() {
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
        body: JSON.stringify({ email, password, role: "faculty" }),
      });
      localStorage.setItem("gp_token", data.token);
      localStorage.setItem("gp_user", JSON.stringify(data.user));
      navigate("/faculty");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">Faculty Login</h2>
        <p className="mt-1 text-sm text-slate-600">
          Log in to approve or reject student gate pass requests.
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
            Faculty accounts are created by Admin.
          </p>
          <p>
            Are you a student?{" "}
            <Link
              to="/login/student"
              className="font-medium text-primary-600 hover:underline"
            >
              Student Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

