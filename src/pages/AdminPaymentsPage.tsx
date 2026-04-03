import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import AdminGuard from "@/components/AdminGuard";

function AdminPaymentsSummary() {
  const data = useQuery(api.payments.getAdminPaymentSummary);

  if (data === undefined) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.6rem", marginBottom: "6px" }}>Payments</h1>
          <p className="text-secondary text-sm">
            All members and their latest payment status.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Stat label="Total Members" value={data.length} />
          <Stat
            label="PRO Members"
            value={data.filter((r) => r.plan === "PRO").length}
            color="var(--green)"
          />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px" }}>
          <p className="text-muted">No members yet.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Last Payment</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.userId}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{row.name}</p>
                      <p className="text-muted text-xs">{row.email}</p>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${row.plan === "PRO" ? "badge-pro" : "badge-free"}`}
                    >
                      {row.plan === "PRO" ? "⚡ PRO" : "FREE"}
                    </span>
                  </td>
                  <td>
                    {row.lastPaymentStatus ? (
                      <span
                        className={`badge badge-${row.lastPaymentStatus === "paid" ? "paid" : "pending"}`}
                      >
                        {row.lastPaymentStatus}
                      </span>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {row.lastPaymentAmount != null ? (
                      formatCurrency(row.lastPaymentAmount, row.lastPaymentCurrency ?? "usd")
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="text-secondary text-sm">
                    {row.lastPaymentDate ? formatDate(row.lastPaymentDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const user = useQuery(api.auth.getCurrentUser);

  if (user === undefined) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
        <p>Could not load your account. Please refresh.</p>
      </div>
    );
  }

  return (
    <AdminGuard role={user.role}>
      <AdminPaymentsSummary />
    </AdminGuard>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "10px 18px",
        textAlign: "center",
        minWidth: "90px",
      }}
    >
      <p
        style={{
          fontSize: "1.3rem",
          fontWeight: 800,
          color: color ?? "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p className="text-muted text-xs" style={{ marginTop: "4px" }}>
        {label}
      </p>
    </div>
  );
}
