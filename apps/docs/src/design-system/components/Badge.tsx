import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "brand" | "neutral" | "success" | "warning";
};

const variantStyles: Record<
  NonNullable<BadgeProps["variant"]>,
  { bg: string; color: string; border: string }
> = {
  brand: {
    bg: "rgba(30, 88, 242, 0.12)",
    color: "var(--color-brand)",
    border: "rgba(30, 88, 242, 0.35)",
  },
  neutral: {
    bg: "#f2f4f8",
    color: "var(--color-text-muted)",
    border: "var(--color-border)",
  },
  success: {
    bg: "rgba(3, 152, 85, 0.12)",
    color: "#039855",
    border: "rgba(3, 152, 85, 0.35)",
  },
  warning: {
    bg: "rgba(202, 133, 4, 0.14)",
    color: "#ca8504",
    border: "rgba(202, 133, 4, 0.4)",
  },
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  const t = variantStyles[variant];
  return (
    <span
      className="ds-type-badge-label"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "var(--space-xs-sm) var(--space-xs-md)",
        borderRadius: 999,
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
      }}
    >
      {children}
    </span>
  );
}
