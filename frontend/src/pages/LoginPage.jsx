import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const LOGIN_TYPES = [
  { value: "student", label: "Student", description: "Request and track gate passes" },
  { value: "faculty", label: "Faculty", description: "Approve or reject student requests" },
  { value: "admin", label: "Admin", description: "Manage faculty and monitor passes" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = LOGIN_TYPES.find((t) => t.value === loginType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role: loginType }),
      });
      localStorage.setItem("gp_token", data.token);
      localStorage.setItem("gp_user", JSON.stringify(data.user));
      if (loginType === "student") navigate("/student");
      else if (loginType === "faculty") navigate("/faculty");
      else navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-8 pt-8 pb-6">
            <div className="mb-1 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white shadow-lg shadow-primary-600/30">
                GP
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500">
                  Sign in to College Gate Pass
                </p>
              </div>
            </div>
          </div>

          <form className="p-8" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="login-type"
                  className="block text-sm font-medium text-slate-700"
                >
                  Login as
                </label>
                <select
                  id="login-type"
                  value={loginType}
                  onChange={(e) => setLoginType(e.target.value)}
                  className="mt-2 block w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {LOGIN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {selected?.description}
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="input mt-2 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@college.edu"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="input mt-2 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p
                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary mt-6 w-full rounded-xl py-3 text-base font-semibold shadow-lg shadow-primary-600/25 transition hover:shadow-primary-600/30 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {loginType === "student" && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-4">
              <p className="text-center text-sm text-slate-600">
                New student?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-primary-600 transition hover:text-primary-700 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
