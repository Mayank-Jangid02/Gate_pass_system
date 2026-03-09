import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { DEPARTMENTS } from "../lib/departments.js";

const SIGNUP_TYPES = [
  {
    value: "student",
    label: "Student",
    description: "Register using your college email to request gate passes.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Create the first admin account. Use Login if an admin already exists.",
  },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [signupType, setSignupType] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
   const [department, setDepartment] = useState("");
   const [enrollmentNumber, setEnrollmentNumber] = useState("");
   const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminExists, setAdminExists] = useState(null);

  const selected = SIGNUP_TYPES.find((t) => t.value === signupType);

  useEffect(() => {
    if (signupType === "admin") {
      apiRequest("/auth/admin-exists")
        .then((data) => setAdminExists(data.exists))
        .catch(() => setAdminExists(true));
    } else {
      setAdminExists(null);
    }
  }, [signupType]);

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
          role: signupType,
          department,
          enrollmentNumber,
          profileImageUrl,
        }),
      });
      localStorage.setItem("gp_token", data.token);
      localStorage.setItem("gp_user", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (signupType === "admin" && adminExists === null) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-6 sm:p-8 text-center">
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (signupType === "admin" && adminExists === true) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-6 sm:p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Admin Already Exists</h2>
          <p className="mt-3 text-sm text-slate-600">
            An admin account has been created. Please sign in to continue.
          </p>
          <Link
            to="/login"
            className="btn-primary mt-6 inline-block w-full rounded-xl py-3"
          >
            Go to Sign In
          </Link>
          <p className="mt-4 text-center text-xs text-slate-600">
            Not an admin?{" "}
            <Link to="/signup" className="font-medium text-primary-600 hover:underline">
              Student Signup
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900">
          {signupType === "admin" ? "Admin Signup" : "Student Signup"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{selected?.description}</p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Sign up as
            </label>
            <select
              value={signupType}
              onChange={(e) => setSignupType(e.target.value)}
              className="mt-2 block w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {SIGNUP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
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
          {signupType === "student" && (
            <>
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
            </>
          )}
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
        {signupType === "admin" && (
          <p className="mt-2 text-center text-xs text-amber-700">
            Admin can signup only when no admin exists. Otherwise use Login.
          </p>
        )}
      </div>
    </div>
  );
}
