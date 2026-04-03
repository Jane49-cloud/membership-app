import { Link } from "react-router-dom";

interface AdminGuardProps {
  role: "ADMIN" | "USER" | null | undefined;
  children: React.ReactNode;
}

export default function AdminGuard({ role, children }: AdminGuardProps) {
  if (role === undefined) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "60px" }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (role === null) return null;

  if (role === "ADMIN") return <>{children}</>;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 24px",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--red-bg)",
          border: "1px solid rgba(255,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          margin: "0 auto 24px",
        }}
      >
        ⛔
      </div>

      <h2 style={{ fontSize: "1.4rem", marginBottom: "12px" }}>
        Access denied
      </h2>

      <p
        className="text-secondary"
        style={{ lineHeight: 1.7, marginBottom: "24px", fontSize: "0.95rem" }}
      >
        This page is for admin users only. If you believe you should have
        access, ask an admin to update your account role.
      </p>

      <Link to="/billing" className="btn btn-primary">
        Back to billing
      </Link>
    </div>
  );
}
