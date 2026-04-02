interface PlanBadgeProps {
  plan: "FREE" | "PRO";
}

export default function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <span className={`badge ${plan === "PRO" ? "badge-pro" : "badge-free"}`}>
      {plan === "PRO" ? "⚡ PRO" : "FREE"}
    </span>
  );
}
