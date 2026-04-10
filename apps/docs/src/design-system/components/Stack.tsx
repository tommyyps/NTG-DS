import type { CSSProperties, ReactNode } from "react";

type StackProps = {
  children: ReactNode;
  direction?: "row" | "column";
  gap?: number;
  align?: CSSProperties["alignItems"];
  wrap?: boolean;
};

export function Stack({
  children,
  direction = "column",
  gap = 16,
  align = "stretch",
  wrap = false,
}: StackProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        alignItems: align,
        flexWrap: wrap ? "wrap" : "nowrap",
      }}
    >
      {children}
    </div>
  );
}
