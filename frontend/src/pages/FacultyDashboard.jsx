import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function FacultyDashboard() {
  const [passes, setPasses] = useState([]);
  const [historyPasses, setHistoryPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("pending"); // "pending" | "history" | "timetable"
  const [timetable, setTimetable] = useState("");
  const [savingTimetable, setSavingTimetable] = useState(false);

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

  const loadTimetable = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest("/faculty/timetable");
      setTimetable(data.timetable || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimetable = async (e) => {
    e.preventDefault();
    setSavingTimetable(true);
    setError("");
    try {
      await apiRequest("/faculty/timetable", {
        method: "PUT",
        body: JSON.stringify({ timetable }),
      });
      alert("Timetable saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTimetable(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      setTimetable(text);
      
      // Auto-save when file is uploaded
      setSavingTimetable(true);
      setError("");
      try {
        await apiRequest("/faculty/timetable", {
          method: "PUT",
          body: JSON.stringify({ timetable: text }),
        });
        alert("Timetable uploaded and saved successfully!");
      } catch (err) {
        setError("Failed to save uploaded timetable: " + err.message);
      } finally {
        setSavingTimetable(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (viewMode === "pending") {
      loadPending();
    } else if (viewMode === "history") {
      loadHistory();
    } else if (viewMode === "timetable") {
      loadTimetable();
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
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)]">
      {/* Profile Sidebar */}
      {currentUser && (
        <div className="lg:w-1/3 xl:w-1/4 h-full">
          <div className="card flex flex-col p-4 sm:p-5 h-full rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 bg-white relative group">
            {/* Full width image container */}
            <div className="w-full h-64 lg:h-72 relative overflow-hidden shrink-0 rounded-xl shadow-sm border border-slate-100 bg-slate-50">
              {currentUser.profileImageUrl ? (
                <img
                  src={currentUser.profileImageUrl}
                  alt={currentUser.name || "Profile"}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 transition-transform duration-500 relative">
                  <svg className="w-24 h-24 text-white/50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
              )}
              {/* Subtle inner shadow at the bottom of the image for smooth transition to content */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Card Content underneath the image */}
            <div className="text-center w-full mt-6 flex-1 flex flex-col justify-center items-center relative z-10">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors duration-300">
                {currentUser.name}
              </h2>
              <div className="mt-4 mb-4">
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider bg-primary-50 px-5 py-2 rounded-full inline-block border border-primary-100 shadow-sm transition-transform duration-300 hover:scale-105">
                  Faculty Member
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden">
        <div className="card flex flex-col p-6 sm:p-8 h-full rounded-2xl shadow-sm border border-slate-100 bg-white transition-all duration-300 hover:shadow-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 shrink-0">
            <div className="flex gap-6 border-b border-slate-100 w-full sm:w-auto">
              <button
                onClick={() => setViewMode("pending")}
                className={`pb-3 px-1 text-sm font-semibold transition-all duration-300 relative ${viewMode === "pending"
                  ? "text-primary-600"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Pending Requests
                {viewMode === "pending" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>
                )}
              </button>
              <button
                onClick={() => setViewMode("history")}
                className={`pb-3 px-1 text-sm font-semibold transition-all duration-300 relative ${viewMode === "history"
                  ? "text-primary-600"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Approval History
                {viewMode === "history" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>
                )}
              </button>
              <button
                onClick={() => setViewMode("timetable")}
                className={`pb-3 px-1 text-sm font-semibold transition-all duration-300 relative ${viewMode === "timetable"
                  ? "text-primary-600"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                My Timetable
                {viewMode === "timetable" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>
                )}
              </button>
            </div>
            <button
              onClick={() => {
                if (viewMode === "pending") loadPending();
                else if (viewMode === "history") loadHistory();
                else loadTimetable();
              }}
              className="mt-4 sm:mt-0 px-4 py-2 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-300 self-start sm:self-auto flex items-center gap-2 shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-3 shrink-0" role="alert">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          {/* List Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 h-full">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Loading data...</p>
              </div>
            ) : viewMode === "pending" ? (
              passes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-base font-medium text-slate-600">No pending requests</p>
                  <p className="mt-1 text-sm text-slate-400">All caught up! There are no students waiting for approval.</p>
                </div>
              ) : (
                <ul className="space-y-4 pb-4">
                  {passes.map((p) => (
                    <li
                      key={p._id}
                      className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                              {p.student?.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <div>
                              <p className="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors duration-200">
                                {p.student?.name}
                              </p>
                              <p className="text-xs font-medium text-slate-500">
                                {p.student?.enrollmentNumber ? `Enrl: ${p.student.enrollmentNumber}` : ''} {p.student?.email ? `• ${p.student.email}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="pl-13 md:pl-0 mt-3 md:mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Leave Info</p>
                              <p className="font-medium text-slate-700 flex items-start gap-2">
                                <span className="text-slate-400">Out:</span> {new Date(p.leaveDate).toLocaleString()}
                              </p>
                              {p.expectedReturn && (
                                <p className="font-medium text-slate-700 flex items-start gap-2 mt-1">
                                  <span className="text-slate-400">In:</span> {new Date(p.expectedReturn).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100/50">
                              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">Reason</p>
                              <p className="font-medium text-slate-700 line-clamp-2" title={p.reason}>{p.reason}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 md:border-l md:pl-4 md:min-w-[120px]">
                          <button
                            onClick={() => handleDecision(p._id, "APPROVED")}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(p._id, "REJECTED")}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 group/reject bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                          >
                            <svg className="w-4 h-4 text-slate-400 group-hover/reject:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : viewMode === "history" ? (
              historyPasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-base font-medium text-slate-600">No approval history</p>
                <p className="mt-1 text-sm text-slate-400">You haven't approved or rejected any requests yet.</p>
              </div>
            ) : (
              <ul className="space-y-4 pb-4">
                {historyPasses.map((p) => (
                  <li
                    key={p._id}
                    className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                            {p.student?.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-800">
                              {p.student?.name}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              {p.student?.enrollmentNumber ? `Enrl: ${p.student.enrollmentNumber}` : ''} {p.student?.email ? `• ${p.student.email}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block w-full sm:w-auto">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Leave Info</p>
                          <p className="font-medium text-slate-700 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {new Date(p.leaveDate).toLocaleString()}
                          </p>
                          <p className="mt-2 text-sm text-slate-600"><span className="font-medium text-slate-700">Reason:</span> {p.reason}</p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 min-w-[140px]">
                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-semibold text-xs ${p.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : p.status === "REJECTED"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                          {p.status === "APPROVED" && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                          {p.status === "REJECTED" && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>}
                          {p.status === "PENDING" && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                          {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase() : "Approved"}
                        </div>
                        {p.approvedAt && (
                          <p className="text-[11px] font-medium text-slate-400 text-right mt-1.5">
                            {new Date(p.approvedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) ) : (
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Manage Your Timetable</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Describe your weekly schedule (e.g., "Monday: 9-11 AM busy, 1-3 PM class"). 
                    The AI will use this to suggest you when you are free.
                  </p>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <label className="cursor-pointer text-center">
                    <span className="block text-sm font-semibold text-primary-600 hover:text-primary-700">Upload a text file</span>
                    <span className="block mt-1 text-xs text-slate-500">(.txt, .csv, .md)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.csv,.md"
                      onChange={handleFileUpload}
                      disabled={savingTimetable}
                    />
                  </label>
                  {savingTimetable && <p className="mt-4 text-sm text-primary-600 font-medium animate-pulse">Uploading and saving...</p>}
                  {!savingTimetable && timetable && (
                    <div className="mt-6 w-full p-4 bg-white border border-slate-200 rounded-lg">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Timetable Preview:</p>
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{timetable}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

