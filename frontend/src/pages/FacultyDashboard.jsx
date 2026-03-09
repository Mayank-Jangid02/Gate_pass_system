import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function FacultyDashboard() {
  const [passes, setPasses] = useState([]);
  const [historyPasses, setHistoryPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("pending"); // "pending" | "history"

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
      : "F";

  const loadPending = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest("/passes/pending");
      setPasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest("/passes/history");
      setHistoryPasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "pending") {
      loadPending();
    } else {
      loadHistory();
    }
  }, [viewMode]);

  const handleDecision = async (id, status) => {
    try {
      await apiRequest(`/passes/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await loadPending();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
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
            {currentUser.department && (
              <p className="text-xs text-slate-600">
                Department: {currentUser.department}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setViewMode("pending")}
              className={`pb-2 px-1 text-sm font-medium ${viewMode === "pending"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Pending Requests
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`pb-2 px-1 text-sm font-medium ${viewMode === "history"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Approval History
            </button>
          </div>
          <button
            onClick={viewMode === "pending" ? loadPending : loadHistory}
            className="text-xs font-medium text-primary-600 hover:underline self-end sm:self-auto"
          >
            Refresh
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        ) : viewMode === "pending" ? (
          passes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No pending requests.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {passes.map((p) => (
                <li
                  key={p._id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {p.student?.name} &middot;{" "}
                        <span className="text-xs text-slate-600">
                          {p.student?.email}
                        </span>
                      </p>
                      {p.student?.enrollmentNumber && (
                        <p className="text-xs text-slate-500">
                          Enrollment No: {p.student.enrollmentNumber}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-600">
                        Leave at: {new Date(p.leaveDate).toLocaleString()}
                      </p>
                      {p.expectedReturn && (
                        <p className="mt-0.5 text-xs text-slate-600">
                          Expected return:{" "}
                          {new Date(p.expectedReturn).toLocaleString()}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-700">{p.reason}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => handleDecision(p._id, "APPROVED")}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(p._id, "REJECTED")}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : historyPasses.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No approval history.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {historyPasses.map((p) => (
              <li
                key={p._id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {p.student?.name} &middot;{" "}
                      <span className="text-xs text-slate-600">
                        {p.student?.email}
                      </span>
                    </p>
                    {p.student?.enrollmentNumber && (
                      <p className="text-xs text-slate-500">
                        Enrollment No: {p.student.enrollmentNumber}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-600">
                      Leave marked for: {new Date(p.leaveDate).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-700">{p.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md border border-emerald-200">
                      Approved
                    </p>
                    {p.approvedAt && (
                      <p className="mt-1 text-[10px] text-slate-500">
                        on {new Date(p.approvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

