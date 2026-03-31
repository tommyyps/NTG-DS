import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Typography } from "./Typography";

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
        padding: "10px 16px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <Typography group="text" styleName="sm-semibold" as="span">
        {children}
      </Typography>
    </button>
  );
}
