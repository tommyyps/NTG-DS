import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({
  children,
  variant = "primary",
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const disabled = Boolean(rest.disabled);
  return (
    <button
      {...rest}
      style={{
        borderRadius: 10,
        border: `1px solid ${isPrimary ? "var(--color-brand)" : "var(--color-border)"}`,
        background: isPrimary ? "var(--color-brand)" : "var(--color-surface)",
        color: isPrimary ? "#ffffff" : "var(--color-text)",
        padding: "var(--space-xs-xl) var(--space-sm-xs)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <span className="ds-type-button-label">{children}</span>
    </button>
  );
}
