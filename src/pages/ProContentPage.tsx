import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProGuard from "@/components/ProGuard";

export default function ProContentPage() {
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
    <ProGuard plan={user?.plan}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                background: "var(--green-bg)",
                border: "1px solid rgba(22,163,74,0.25)",
                borderRadius: "999px",
                padding: "2px 12px",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                color: "var(--green)",
              }}
            >
              PRO Exclusive
            </span>
          </div>
          <h1 style={{ fontSize: "1.6rem", marginBottom: "6px" }}>
            PRO Content
          </h1>
          <p className="text-secondary text-sm">
            Resources and insights available only to PRO members.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <ContentCard
            icon="📊"
            title="Advanced Analytics Guide"
            description="Deep dive into interpreting product metrics, cohort analysis, and building dashboards that actually drive decisions."
            tag="Guide"
          />
          <ContentCard
            icon="🎥"
            title="Exclusive Video Walkthrough"
            description="A recorded 45-minute session covering architecture decisions, trade-offs, and how we scaled from 0 to 10k users."
            tag="Video"
          />
          <ContentCard
            icon="🛠️"
            title="Private Templates & Starter Kits"
            description="Production-ready code templates for auth flows, billing integration, and admin dashboards. Clone and ship."
            tag="Resources"
          />
          <ContentCard
            icon="💬"
            title="PRO Community Access"
            description="Join a private channel with other PRO members. Ask questions, share what you're building, and get real feedback."
            tag="Community"
          />
        </div>
      </div>
    </ProGuard>
  );
}

interface ContentCardProps {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

function ContentCard({ icon, title, description, tag }: ContentCardProps) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "flex-start",
        transition: "box-shadow var(--transition)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")
      }
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          background: "var(--green-bg)",
          border: "1px solid rgba(22,163,74,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>{title}</h3>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
              color: "var(--text-muted)",
              background: "#f3f4f6",
              padding: "1px 8px",
              borderRadius: "999px",
            }}
          >
            {tag}
          </span>
        </div>
        <p className="text-secondary text-sm" style={{ lineHeight: 1.65 }}>
          {description}
        </p>
      </div>
    </div>
  );
}
