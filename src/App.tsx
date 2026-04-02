import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import Layout from "@/components/Layout";
import BillingPage from "@/pages/BillingPage";
import ProContentPage from "@/pages/ProContentPage";
import AdminPaymentsPage from "@/pages/AdminPaymentsPage";
import LoginPage from "@/pages/LoginPage";

// ─── App ──────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const id = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(id);
  }, [isLoading]);

  if (isLoading) {
    if (timedOut) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "var(--text-secondary)",
          }}
        >
          <p style={{ fontSize: "0.95rem" }}>
            Could not connect to the server.
          </p>
          <button
            className="btn btn-primary"
            style={{ padding: "8px 20px" }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — all wrapped in Layout (shows the nav) */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Navigate to="/billing" replace />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="pro" element={<ProContentPage />} />
        <Route path="admin/payments" element={<AdminPaymentsPage />} />
      </Route>

      {/* Catch-all — redirect to billing or login */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/billing" : "/login"} replace />
        }
      />
    </Routes>
  );
}
