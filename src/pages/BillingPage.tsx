import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import PlanBadge from "@/components/PlanBadge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function BillingPage() {
  const user = useQuery(api.auth.getCurrentUser);
  const payments = useQuery(api.payments.getMyPayments);
  const createCheckoutSession = useAction(api.users.createCheckoutSession);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const justPaid = params.get("success") === "true";
  const cancelled = params.get("cancelled") === "true";

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await createCheckoutSession({
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing?cancelled=true`,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsLoading(false);
    }
  };

  if (user === undefined) return <Loader />;
  if (user === null) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
        <p>Could not load your account. Please refresh.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "660px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "6px" }}>Billing</h1>
        <p className="text-secondary text-sm">
          Manage your plan and payment history.
        </p>
      </div>

      {justPaid && (
        <Banner type="success">
          🎉 Payment successful! Your account is now PRO.
        </Banner>
      )}
      {cancelled && (
        <Banner type="warning">Payment cancelled — no charge was made.</Banner>
      )}
      {error && <Banner type="error">{error}</Banner>}

      {/* Current plan */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p
              className="text-secondary text-xs"
              style={{
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              Current Plan
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "6px",
              }}
            >
              <h2 style={{ fontSize: "1.4rem" }}>
                {user?.plan === "PRO" ? "PRO" : "Free"}
              </h2>
              <PlanBadge plan={user?.plan ?? "FREE"} />
            </div>
            <p className="text-secondary text-sm">
              {user?.plan === "PRO"
                ? "You're all set — guides, templates, community, everything's unlocked."
                : "You're on the free plan. Upgrade when you're ready to get the good stuff."}
            </p>
          </div>

          {user?.plan !== "PRO" && (
            <button
              className="btn btn-primary"
              onClick={handleUpgrade}
              disabled={isLoading}
              style={{ minWidth: "160px" }}
            >
              {isLoading ? (
                <>
                  <InlineSpinner /> Redirecting…
                </>
              ) : (
                "⚡ Upgrade to PRO"
              )}
            </button>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <Feature
            label="Guides, videos & templates"
            available={user?.plan === "PRO"}
          />
          <Feature label="Direct email support" available={user?.plan === "PRO"} />
          <Feature label="Personal dashboard" available />
          <Feature label="No contracts, cancel anytime" available />
        </div>
      </div>

      {/* Payment history */}
      <div className="card">
        <h3
          style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "16px" }}
        >
          Payment History
        </h3>

        {payments === undefined ? (
          <Loader />
        ) : payments.length === 0 ? (
          <p
            className="text-muted text-sm"
            style={{ textAlign: "center", padding: "32px" }}
          >
            No payments yet.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {payments.map((p) => (
              <div
                key={p._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "var(--bg-base)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Membership — PRO
                  </p>
                  <p
                    className="text-muted text-xs"
                    style={{ marginTop: "2px" }}
                  >
                    {formatDate(p.createdAt)}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      marginBottom: "4px",
                    }}
                  >
                    {formatCurrency(p.amount, p.currency)}
                  </p>
                  <span
                    className={`badge badge-${p.status === "paid" ? "paid" : "pending"}`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Feature({ label, available }: { label: string; available: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          color: available ? "var(--green)" : "var(--text-muted)",
          fontSize: "0.85rem",
          fontWeight: 700,
        }}
      >
        {available ? "✓" : "✗"}
      </span>
      <span
        style={{
          fontSize: "0.85rem",
          color: available ? "var(--text-primary)" : "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Banner({
  type,
  children,
}: {
  type: "success" | "warning" | "error";
  children: React.ReactNode;
}) {
  const c = {
    success: {
      bg: "var(--green-bg)",
      border: "rgba(22,163,74,0.3)",
      color: "var(--green)",
    },
    warning: {
      bg: "var(--amber-bg)",
      border: "rgba(217,119,6,0.3)",
      color: "var(--amber)",
    },
    error: {
      bg: "var(--red-bg)",
      border: "rgba(220,38,38,0.3)",
      color: "var(--red)",
    },
  }[type];
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "var(--radius)",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: "0.875rem",
        fontWeight: 500,
        marginBottom: "16px",
      }}
    >
      {children}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <div className="spinner" />
    </div>
  );
}

function InlineSpinner() {
  return (
    <span
      style={{
        width: "13px",
        height: "13px",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
      }}
    />
  );
}
