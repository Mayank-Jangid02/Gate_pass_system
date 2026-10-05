import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { DEPARTMENTS } from "../lib/departments.js";

export default function AdminDashboard() {
  const [faculty, setFaculty] = useState([]);
  const [securityUser, setSecurityUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Faculty Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState({});

  // Security Form state
  const [secName, setSecName] = useState("");
  const [secEmail, setSecEmail] = useState("");
  const [secPassword, setSecPassword] = useState("");
  const [creatingSec, setCreatingSec] = useState(false);
  const [secError, setSecError] = useState("");

  const toggleDept = (dept) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [dept]: !prev[dept],
    }));
  };

  const groupedFaculty = faculty.reduce((acc, current) => {
    const dept = current.department || "Unassigned";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(current);
    return acc;
  }, {});

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      const [facData, secData] = await Promise.all([
        apiRequest("/admin/faculty"),
        apiRequest("/admin/security").catch(() => ({ security: null })),
      ]);
      setFaculty(facData);
      setSecurityUser(secData.security || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await apiRequest("/admin/faculty", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          enrollmentNumber,
          profileImageUrl,
        }),
      });
      setName("");
      setEmail("");
      setPassword("");
      setDepartment("");
      setEnrollmentNumber("");
      setProfileImageUrl("");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveFaculty = async (id) => {
    if (!window.confirm("Remove this faculty member?")) return;
    try {
      await apiRequest(`/admin/faculty/${id}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSecurity = async (e) => {
    e.preventDefault();
    setCreatingSec(true);
    setSecError("");
    try {
      await apiRequest("/admin/security", {
        method: "POST",
        body: JSON.stringify({
          name: secName,
          email: secEmail,
          password: secPassword,
        }),
      });
      setSecName("");
      setSecEmail("");
      setSecPassword("");
      await loadData();
    } catch (err) {
      setSecError(err.message);
    } finally {
      setCreatingSec(false);
    }
  };

  const handleRemoveSecurity = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate the Security account?")) return;
    try {
      await apiRequest(`/admin/security/${id}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (err) {
      setSecError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin Management Portal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage faculty permissions and assign the single Security Officer account.
        </p>
      </div>

      {/* Security Account Management Section */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-md shadow-indigo-600/30">
              🛡️
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Security Officer Account
              </h2>
              <p className="text-xs text-slate-500">
                Only 1 Security account is permitted in the system.
              </p>
            </div>
          </div>
          {securityUser && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Security Configured
            </span>
          )}
        </div>

        <div className="mt-5">
          {loading ? (
            <p className="text-sm text-slate-500">Loading security details...</p>
          ) : securityUser ? (
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{securityUser.name}</h3>
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
                    Security Guard
                  </span>
                </div>
                <p className="text-sm text-slate-600">Email: {securityUser.email}</p>
                <p className="text-xs text-slate-400">
                  Created: {new Date(securityUser.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRemoveSecurity(securityUser._id || securityUser.id)}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                Deactivate Security Account
              </button>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-xs font-medium text-amber-800 bg-amber-50 rounded-lg p-3 border border-amber-200">
                ⚠️ No active Security account found. As an Admin, you can add the Security Officer below.
              </p>

              <form className="grid gap-4 sm:grid-cols-3" onSubmit={handleCreateSecurity}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Officer Full Name
                  </label>
                  <input
                    className="input mt-1 rounded-xl text-sm"
                    value={secName}
                    onChange={(e) => setSecName(e.target.value)}
                    placeholder="e.g. Chief Security Officer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Officer Email
                  </label>
                  <input
                    type="email"
                    className="input mt-1 rounded-xl text-sm"
                    value={secEmail}
                    onChange={(e) => setSecEmail(e.target.value)}
                    placeholder="security@college.edu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Assign Password
                  </label>
                  <input
                    type="password"
                    className="input mt-1 rounded-xl text-sm"
                    value={secPassword}
                    onChange={(e) => setSecPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {secError && (
                  <div className="sm:col-span-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                    {secError}
                  </div>
                )}

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md"
                    disabled={creatingSec}
                  >
                    {creatingSec ? "Creating Security..." : "🛡️ Add Security Account"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Management Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Faculty Form */}
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Add Faculty Member
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Create faculty accounts who can approve student gate passes.
          </p>
          <form className="mt-4 space-y-4" onSubmit={handleCreateFaculty}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                className="input mt-1"
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
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Temporary Password
              </label>
              <input
                type="password"
                className="input mt-1"
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
                className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
                Enrollment Number (optional)
              </label>
              <input
                className="input mt-1"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                placeholder="e.g. EMP001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Profile Image URL (optional)
              </label>
              <input
                type="url"
                className="input mt-1"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="Paste link to faculty photo"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Faculty"}
            </button>
          </form>
        </div>

        {/* Faculty List */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Faculty Members
            </h2>
            <button
              onClick={loadData}
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading...</p>
          ) : faculty.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No faculty yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {Object.entries(groupedFaculty).map(([dept, members]) => (
                <div key={dept} className="rounded-lg border border-slate-200">
                  <button
                    onClick={() => toggleDept(dept)}
                    className="flex w-full items-center justify-between rounded-t-lg bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100 focus:outline-none"
                  >
                    <span className="font-semibold text-slate-800">{dept}</span>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {members.length}
                      </span>
                      <svg
                        className={`h-5 w-5 text-slate-500 transition-transform ${
                          expandedDepts[dept] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                  {expandedDepts[dept] && (
                    <ul className="divide-y divide-slate-100 border-t border-slate-200 bg-white">
                      {members.map((f) => (
                        <li
                          key={f._id}
                          className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {f.name}
                            </p>
                            <p className="text-xs text-slate-600">{f.email}</p>
                            {!f.isActive && (
                              <p className="mt-0.5 text-xs font-medium text-red-600">
                                Inactive
                              </p>
                            )}
                          </div>
                          {f.isActive && (
                            <button
                              onClick={() => handleRemoveFaculty(f._id)}
                              className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50"
                            >
                              Remove
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
