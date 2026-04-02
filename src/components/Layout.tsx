import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import PlanBadge from "./PlanBadge";

export default function Layout() {
  const user = useQuery(api.auth.getCurrentUser);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
        }}>
          <span style={{
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "var(--accent)",
            letterSpacing: "-0.03em",
          }}>
            🌿 MemberKit
          </span>

          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <NavItem to="/billing">Billing</NavItem>
            <NavItem to="/pro">PRO Content</NavItem>
            {user?.role === "ADMIN" && <NavItem to="/admin/payments">Admin</NavItem>}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user && <PlanBadge plan={user.plan} />}
            <button className="btn btn-ghost" onClick={handleSignOut}
              style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "20px 0",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.8rem",
        background: "#fff",
      }}>
        MemberKit · Built with Convex + Stripe
      </footer>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "6px 14px",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        background: isActive ? "var(--green-bg)" : "transparent",
        border: isActive ? "1px solid rgba(22,163,74,0.2)" : "1px solid transparent",
        transition: "all var(--transition)",
        textDecoration: "none",
      })}
    >
      {children}
    </NavLink>
  );
}
