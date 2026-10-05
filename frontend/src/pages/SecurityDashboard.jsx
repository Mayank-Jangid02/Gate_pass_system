import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

export default function SecurityDashboard() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApprovedPasses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/passes/security/approved");
      setPasses(data);
    } catch (err) {
      setError(err.message || "Failed to load security pass requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedPasses();
  }, []);

  const handleUpdateStatus = async (passId, securityStatus) => {
    try {
      setUpdatingId(passId);
      const updatedPass = await apiRequest(`/passes/security/${passId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ securityStatus }),
      });
      setPasses((prev) =>
        prev.map((p) => (p._id === passId ? updatedPass : p))
      );
    } catch (err) {
      alert(err.message || "Failed to update security status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats calculation
  const totalApproved = passes.length;
  const pendingExit = passes.filter(
    (p) => !p.securityStatus || p.securityStatus === "PENDING_EXIT"
  ).length;
  const checkedOut = passes.filter(
    (p) => p.securityStatus === "CHECKED_OUT"
  ).length;
  const checkedIn = passes.filter(
    (p) => p.securityStatus === "CHECKED_IN"
  ).length;

  // Search & Filter
  const filteredPasses = passes.filter((pass) => {
    const sName = pass.student?.name || "";
    const sEnroll = pass.student?.enrollmentNumber || "";
    const sDept = pass.student?.department || "";
    const reason = pass.reason || "";
    const facultyName = pass.faculty?.name || pass.approvedByName || "";

    const matchesSearch =
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sEnroll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyName.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = pass.securityStatus || "PENDING_EXIT";
    const matchesFilter =
      statusFilter === "all" || currentStatus === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/30">
              🛡️
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Security Inspection Dashboard
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Verify and log gate entry/exit for faculty-approved student passes.
          </p>
        </div>
        <button
          onClick={fetchApprovedPasses}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <svg
            className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Live Passes
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty Approved
            </span>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
              📋
            </span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{totalApproved}</p>
          <p className="mt-1 text-xs text-slate-500">Total active passes</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Exit
            </span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
              ⏳
            </span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-600">{pendingExit}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting gate exit</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Currently Out
            </span>
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              🚪
            </span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">{checkedOut}</p>
          <p className="mt-1 text-xs text-slate-500">Checked out of campus</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Checked In
            </span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              ✅
            </span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">{checkedIn}</p>
          <p className="mt-1 text-xs text-slate-500">Returned to campus</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by student name, enrollment no., department, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-1">
            {[
              { id: "all", label: `All (${totalApproved})` },
              { id: "PENDING_EXIT", label: `Pending Exit (${pendingExit})` },
              { id: "CHECKED_OUT", label: `Checked Out (${checkedOut})` },
              { id: "CHECKED_IN", label: `Checked In (${checkedIn})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Passes List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading approved passes...
          </p>
        </div>
      ) : filteredPasses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
            🔍
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            No Faculty-Approved Passes Found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search criteria or filter tabs."
              : "When faculty approves student pass requests, they will automatically appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPasses.map((pass) => {
            const currentStatus = pass.securityStatus || "PENDING_EXIT";
            const isUpdating = updatingId === pass._id;

            return (
              <div
                key={pass._id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Student Information */}
                    <div className="flex items-start gap-4">
                      {pass.student?.profileImageUrl ? (
                        <img
                          src={pass.student.profileImageUrl}
                          alt={pass.student.name}
                          className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-lg text-indigo-600 border border-indigo-100">
                          {pass.student?.name
                            ? pass.student.name.charAt(0).toUpperCase()
                            : "S"}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {pass.student?.name || "Student"}
                          </h3>
                          {pass.student?.enrollmentNumber && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              {pass.student.enrollmentNumber}
                            </span>
                          )}
                          {pass.student?.department && (
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              {pass.student.department}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-1">
                          <strong className="font-semibold text-slate-700">Reason:</strong>{" "}
                          {pass.reason}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>
                            📅 <strong>Leave:</strong>{" "}
                            {new Date(pass.leaveDate).toLocaleString()}
                          </span>
                          {pass.expectedReturn && (
                            <span>
                              ⏳ <strong>Return:</strong>{" "}
                              {new Date(pass.expectedReturn).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="pt-1 text-xs text-slate-500">
                          ✅ <strong>Approved By:</strong>{" "}
                          <span className="font-medium text-slate-700">
                            {pass.faculty?.name || pass.approvedByName || "Faculty"}
                          </span>{" "}
                          {pass.approvedAt && (
                            <span className="text-slate-400">
                              ({new Date(pass.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Security Action & Status Section */}
                    <div className="flex flex-col items-start gap-3 border-t border-slate-100 pt-4 lg:items-end lg:border-t-0 lg:pt-0">
                      {/* Security Status Badge */}
                      <div>
                        {currentStatus === "PENDING_EXIT" && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200/80 shadow-xs">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Pending Exit
                          </span>
                        )}
                        {currentStatus === "CHECKED_OUT" && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200/80 shadow-xs">
                              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                              Checked Out
                            </span>
                            {pass.securityCheckedOutAt && (
                              <p className="mt-1 text-[11px] text-slate-500">
                                Exited: {new Date(pass.securityCheckedOutAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        )}
                        {currentStatus === "CHECKED_IN" && (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200/80 shadow-xs">
                              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                              Checked In & Completed
                            </span>
                            {pass.securityCheckedInAt && (
                              <p className="mt-1 text-[11px] text-slate-500">
                                Returned: {new Date(pass.securityCheckedInAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Security Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {currentStatus === "PENDING_EXIT" && (
                          <button
                            onClick={() => handleUpdateStatus(pass._id, "CHECKED_OUT")}
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isUpdating ? "Logging..." : "🚪 Mark Exit (Check Out)"}
                          </button>
                        )}

                        {currentStatus === "CHECKED_OUT" && (
                          <button
                            onClick={() => handleUpdateStatus(pass._id, "CHECKED_IN")}
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {isUpdating ? "Logging..." : "✅ Mark Entry (Check In)"}
                          </button>
                        )}

                        {currentStatus === "CHECKED_IN" && (
                          <button
                            onClick={() => handleUpdateStatus(pass._id, "CHECKED_OUT")}
                            disabled={isUpdating}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-50"
                          >
                            Re-open Exit
                          </button>
                        )}

                        <Link
                          to={`/pass/${pass._id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          📄 View Pass
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
