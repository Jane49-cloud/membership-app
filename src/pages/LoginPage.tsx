import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (isAuthenticated) return <Navigate to="/billing" replace />;

  const handleSignIn = async () => {
    setError(null);
    setIsPending(true);
    try {
      await signIn("github", { redirectTo: "/billing" });
    } catch {
      setError("Sign-in failed. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg-base)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "var(--green-bg)",
              border: "1px solid rgba(22,163,74,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              margin: "0 auto 16px",
            }}
          >
            🌿
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            MemberKit
          </h1>
          <p className="text-secondary text-sm">
            Membership & payments, done right.
          </p>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
            Sign in to continue
          </h2>
          <p
            className="text-secondary text-sm"
            style={{ marginBottom: "24px" }}
          >
            Access your membership dashboard and PRO content.
          </p>

          {error && (
            <p
              style={{
                color: "var(--red)",
                fontSize: "0.85rem",
                marginBottom: "16px",
                background: "var(--red-bg)",
                border: "1px solid rgba(220,38,38,0.3)",
                borderRadius: "var(--radius)",
                padding: "8px 12px",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSignIn}
            disabled={isPending}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            <GitHubIcon />
            {isPending ? "Redirecting…" : "Continue with GitHub"}
          </button>

          <p
            className="text-muted text-xs"
            style={{ marginTop: "16px", lineHeight: 1.6 }}
          >
            By signing in you agree to our terms. We never post without your
            permission.
          </p>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.31 3.435 9.818 8.205 11.405.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.315 24 17.808 24 12.5 24 5.87 18.627.5 12 .5z" />
    </svg>
  );
}
