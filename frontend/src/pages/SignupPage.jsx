import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { DEPARTMENTS } from "../lib/departments.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userStr = localStorage.getItem("gp_user");
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      if (userObj.role === "student") return <Navigate to="/student" replace />;
      if (userObj.role === "faculty") return <Navigate to="/faculty" replace />;
      if (userObj.role === "security") return <Navigate to="/security" replace />;
      if (userObj.role === "admin") return <Navigate to="/admin" replace />;
    } catch (e) {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role: "student",
          department,
          enrollmentNumber,
          profileImageUrl,
        }),
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
        <h2 className="text-xl font-semibold text-slate-900">
          Student Signup
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Register using your college email to request gate passes.
        </p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              className="input mt-1 rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="input mt-1 rounded-xl"
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
              className="input mt-1 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-2 block w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            >
              <option value="">Select department...</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Enrollment Number
            </label>
            <input
              type="text"
              className="input mt-1 rounded-xl"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              placeholder="e.g. 22CS001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Profile Image URL (optional)
            </label>
            <input
              type="url"
              className="input mt-1 rounded-xl"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="Paste link to your profile photo"
            />
          </div>
          {error && (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full rounded-xl" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
