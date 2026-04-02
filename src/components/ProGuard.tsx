import { Link } from "react-router-dom";

interface ProGuardProps {
  plan: "FREE" | "PRO" | null | undefined;
  children: React.ReactNode;
}

export default function ProGuard({ plan, children }: ProGuardProps) {
  if (plan === undefined) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <div className="spinner" />
      </div>
    );
  }
  if (plan === null) return null;
  if (plan === "PRO") return <>{children}</>;

  return (
    <div
      data-testid="pro-guard-blocked"
      style={{
        textAlign: "center",
        padding: "80px 24px",
        maxWidth: "440px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--green-bg)",
          border: "1px solid rgba(22,163,74,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          margin: "0 auto 24px",
        }}
      >
        🔒
      </div>

      <h2 style={{ fontSize: "1.4rem", marginBottom: "12px" }}>
        This one's for PRO members
      </h2>

      <p
        className="text-secondary"
        style={{ lineHeight: 1.7, marginBottom: "32px", fontSize: "0.95rem" }}
      >
        Guides, video walkthroughs, starter kits, and the private community are
        all behind PRO. One upgrade, everything unlocks.
      </p>

      <Link to="/billing" className="btn btn-primary">
        See what's included →
      </Link>
    </div>
  );
}
