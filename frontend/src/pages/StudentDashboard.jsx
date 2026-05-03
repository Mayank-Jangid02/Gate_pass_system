import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

export default function StudentDashboard() {
  const [reason, setReason] = useState("");
  const [requestedFaculty, setRequestedFaculty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [suggestedFacultyIds, setSuggestedFacultyIds] = useState([]);

  const currentUser = (() => {
    const stored = localStorage.getItem("gp_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  })();

  const initials =
    currentUser?.name && currentUser.name.length > 0
      ? currentUser.name.charAt(0).toUpperCase()
      : "U";

  const loadPasses = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest("/passes/my");
      setPasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
    const loadFaculty = async () => {
      try {
        setFacultyLoading(true);
        const data = await apiRequest("/admin/faculty/by-department");
        setFacultyList(data.faculty || []);
      } catch (e) {
        setFacultyList([]);
      } finally {
        setFacultyLoading(false);
      }
    };
    loadFaculty();
  }, []);

  const handleGetAISuggestion = async () => {
    setAiSuggesting(true);
    setError("");
    setSuggestedFacultyIds([]);
    try {
      // Use current time
      const targetDate = new Date().toISOString();
      const data = await apiRequest("/ai/suggest-faculty", {
        method: "POST",
        body: JSON.stringify({ leaveDate: targetDate }),
      });
      setSuggestedFacultyIds(data.suggestedFacultyIds || []);
      
      // Auto-select the first suggested faculty if none selected
      if (!requestedFaculty && data.suggestedFacultyIds?.length > 0) {
        setRequestedFaculty(data.suggestedFacultyIds[0]);
      }
    } catch (err) {
      setError("AI Suggestion failed: " + err.message);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiRequest("/passes", {
        method: "POST",
        body: JSON.stringify({
          reason,
          leaveDate: new Date().toISOString(),
          requestedFaculty,
        })
      });
      setReason("");
      setRequestedFaculty("");
      setSuggestedFacultyIds([]);
      await loadPasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {currentUser && (
        <div className="card flex items-center gap-4 p-4">
          {currentUser.profileImageUrl ? (
            <img
              src={currentUser.profileImageUrl}
              alt={currentUser.name || "Profile"}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {currentUser.name}
            </p>
            <p className="text-xs text-slate-600">{currentUser.email}</p>
            {currentUser.enrollmentNumber && (
              <p className="text-xs text-slate-600">
                Enrollment: {currentUser.enrollmentNumber}
              </p>
            )}
            {currentUser.department && (
              <p className="text-xs text-slate-600">
                Department: {currentUser.department}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Request New Gate Pass
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Enter your reason for leaving campus.
          </p>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Reason
              </label>
              <textarea
                className="input mt-1 min-h-[80px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Request to (faculty in your department)
                </label>
                <button
                  type="button"
                  onClick={handleGetAISuggestion}
                  disabled={aiSuggesting || facultyLoading || facultyList.length === 0}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v8l9-11h-7z" />
                  </svg>
                  {aiSuggesting ? "Suggesting..." : "AI Suggest Free Faculty"}
                </button>
              </div>
              {facultyLoading ? (
                <p className="mt-1 text-xs text-slate-500">Loading...</p>
              ) : facultyList.length === 0 ? (
                <p className="mt-1 text-xs text-amber-600">
                  No faculty in your department yet. Contact admin.
                </p>
              ) : (
                <select
                  value={requestedFaculty}
                  onChange={(e) => setRequestedFaculty(e.target.value)}
                  className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                >
                  <option value="">Select faculty...</option>
                  {facultyList.map((f) => {
                    const isSuggested = suggestedFacultyIds.includes(f._id);
                    return (
                      <option key={f._id} value={f._id} className={isSuggested ? "font-bold text-primary-700" : ""}>
                        {f.name} ({f.email}) {isSuggested ? " - ⭐ AI Suggested (Free)" : ""}
                      </option>
                    );
                  })}
                </select>
              )}

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={submitting || facultyList.length === 0}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              My Gate Passes
            </h2>
            <button
              onClick={loadPasses}
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading...</p>
          ) : passes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No passes yet. Submit a request using the form.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {passes.map((p) => (
                <li
                  key={p._id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {new Date(p.leaveDate).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                      {p.reason}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Status:{" "}
                      <span
                        className={
                          p.status === "APPROVED"
                            ? "font-semibold text-emerald-600"
                            : p.status === "REJECTED"
                            ? "font-semibold text-red-600"
                            : "font-semibold text-amber-600"
                        }
                      >
                        {p.status}
                      </span>
                    </p>
                    {(p.requestedFaculty?.name || p.approvedByName) && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {p.approvedByName
                          ? `Approved by: ${p.approvedByName}`
                          : `Requested to: ${p.requestedFaculty?.name || "-"}`}
                      </p>
                    )}
                  </div>
                  {p.status === "APPROVED" && (
                    <Link
                      to={`/pass/${p._id}`}
                      className="text-xs font-semibold text-primary-600 hover:underline"
                    >
                      View Pass
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

