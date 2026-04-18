import React from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import FacultyDashboard from "./pages/FacultyDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PassPrintPage from "./pages/PassPrintPage.jsx";

function useAuth() {
  const stored = localStorage.getItem("gp_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, allowed }) {
  const user = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const user = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("gp_token");
    localStorage.removeItem("gp_user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              GP
            </span>
            <span className="text-base font-semibold text-slate-900">
              College Gate Pass
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user.name} ({user.role})
              </span>
            )}
            {user ? (
              <button onClick={handleLogout} className="group btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
                Logout
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            ) : (
              <Link to="/login" className="btn-primary px-4 py-2 text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
      <footer className="border-t bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-3 text-center text-xs text-slate-500">
          Responsive MERN gate pass system using Tailwind CSS
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HomeRouter />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <LoginPage />
          </Layout>
        }
      />
      <Route
        path="/login/student"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/login/faculty"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/login/admin"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/signup"
        element={
          <Layout>
            <SignupPage />
          </Layout>
        }
      />
      <Route
        path="/student"
        element={
          <Layout>
            <ProtectedRoute allowed={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/faculty"
        element={
          <Layout>
            <ProtectedRoute allowed={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <ProtectedRoute allowed={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/pass/:id"
        element={
          <Layout>
            <ProtectedRoute>
              <PassPrintPage />
            </ProtectedRoute>
          </Layout>
        }
      />
    </Routes>
  );
}

function HomeRouter() {
  const user = (function () {
    const stored = localStorage.getItem("gp_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  })();

  if (user?.role === "student") return <Navigate to="/student" replace />;
  if (user?.role === "faculty") return <Navigate to="/faculty" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Digital Gate Pass System for Your College
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Students can request a gate pass, faculty can approve in one click,
          and admin can manage faculty access. All passes include date, time, and
          approver name.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/signup" className="btn-primary">
          Student Signup
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-xl border-2 border-primary-600 bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm transition hover:bg-primary-50"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

