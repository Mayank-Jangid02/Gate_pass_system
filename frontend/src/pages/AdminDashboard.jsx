import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { DEPARTMENTS } from "../lib/departments.js";

export default function AdminDashboard() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState({});

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

  const loadFaculty = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest("/admin/faculty");
      setFaculty(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const handleCreate = async (e) => {
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
      await loadFaculty();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this faculty member?")) return;
    try {
      await apiRequest(`/admin/faculty/${id}`, {
        method: "DELETE"
      });
      await loadFaculty();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Faculty Member
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Create faculty accounts who can approve student gate passes.
        </p>
        <form className="mt-4 space-y-4" onSubmit={handleCreate}>
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
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Faculty Members
          </h2>
          <button
            onClick={loadFaculty}
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
                      className={`h-5 w-5 text-slate-500 transition-transform ${expandedDepts[dept] ? "rotate-180" : ""
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                            onClick={() => handleRemove(f._id)}
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
  );
}

