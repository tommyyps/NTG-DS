import type { ReactNode } from "react";

type CardProps = {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
};

export function Card({ title, description, children }: CardProps) {
  return (
    <section
      style={{
        display: "grid",
        gap: 16,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "var(--space-sm-lg) var(--space-sm-xl)",
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        <div>{title}</div>
        {description ? (
          <p style={{ color: "var(--color-text-muted)" }}>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
