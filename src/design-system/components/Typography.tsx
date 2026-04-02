import { isValidElement, type ElementType, type ReactNode } from "react";
import { dsTokens } from "../generated/tokens";

type TypographyGroup = keyof typeof dsTokens.typography;

type TypographyProps = {
  group: TypographyGroup;
  styleName: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

const THAI_LINE_HEIGHT_SCALE = 1.30;
const THAI_CHAR_REGEX = /[\u0E00-\u0E7F]/;

function hasThaiText(node: ReactNode): boolean {
  if (node == null || typeof node === "boolean") return false;
  if (typeof node === "string") return THAI_CHAR_REGEX.test(node);
  if (typeof node === "number") return false;
  if (Array.isArray(node)) return node.some((item) => hasThaiText(item));
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return hasThaiText(node.props.children);
  }
  return false;
}

function scaleLineHeightPx(lineHeight: string, scale: number): string {
  const val = Number.parseFloat(lineHeight);
  if (!Number.isFinite(val)) return lineHeight;
  return `${Math.round(val * scale * 100) / 100}px`;
}

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
  const usesThaiText = hasThaiText(children);
  const resolvedLineHeight = usesThaiText
    ? scaleLineHeightPx(token?.lineHeight ?? "", THAI_LINE_HEIGHT_SCALE)
    : token?.lineHeight ?? "";

  if (!token) {
    return (
      <Tag className={className}>
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
        lineHeight: resolvedLineHeight,
        fontWeight: token.fontWeight,
        letterSpacing: token.letterSpacing,
      }}
    >
      {children}
    </Tag>
  );
}
