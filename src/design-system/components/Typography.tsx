import type { ElementType, ReactNode } from "react";
import { dsTokens } from "../generated/tokens";

type TypographyGroup = keyof typeof dsTokens.typography;

type TypographyProps = {
  group: TypographyGroup;
  styleName: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Typography({
  group,
  styleName,
  as = "p",
  className,
  children,
}: TypographyProps) {
  const Tag = as;
  const tokenGroup = dsTokens.typography[group] as Record<
    string,
    {
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
      letterSpacing: string;
    }
  >;
  const token = tokenGroup[styleName];

  if (!token) {
    return (
      <Tag className={className} style={{ margin: 0 }}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      style={{
        fontFamily: `${token.fontFamily}, sans-serif`,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        fontWeight: token.fontWeight,
        letterSpacing: token.letterSpacing,
        margin: 0,
      }}
    >
      {children}
    </Tag>
  );
}
