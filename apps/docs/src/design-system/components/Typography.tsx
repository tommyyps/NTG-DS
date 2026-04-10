import {
  isValidElement,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { dsTokens } from "../generated/tokens";
import {
  thaiScaledResolvedLineHeight,
  typographyTokenToCssVars,
  type TypographyTokenSlice,
} from "../typographyPrimitiveCss";

type TypographyGroup = keyof typeof dsTokens.typography;

type TypographyProps = {
  group: TypographyGroup;
  styleName: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"span">, "children">;

/** ขยายเล็กน้อยเมื่อมีไทย — ค่าเดิม 1.3 ทำให้บรรทัดห่างเกินคู่กับตัวเลขจาก Figma */
const THAI_LINE_HEIGHT_SCALE = 1.12;
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

export function Typography({
  group,
  styleName,
  as = "p",
  className,
  children,
  style: styleProp,
  ...rest
}: TypographyProps) {
  const Tag = as;
  const tokenGroup = dsTokens.typography[group] as Record<
    string,
    TypographyTokenSlice
  >;
  const token = tokenGroup[styleName];
  const usesThaiText = hasThaiText(children);

  if (!token) {
    return (
      <Tag className={className} style={styleProp as CSSProperties} {...rest}>
        {children}
      </Tag>
    );
  }

  const cssVars = typographyTokenToCssVars(token);
  const lineHeight = usesThaiText
    ? thaiScaledResolvedLineHeight(
        cssVars.lineHeight,
        THAI_LINE_HEIGHT_SCALE,
      )
    : cssVars.lineHeight;

  const typographyStyle: CSSProperties = {
    fontFamily: cssVars.fontFamily,
    fontSize: cssVars.fontSize,
    lineHeight,
    fontWeight: cssVars.fontWeight,
    letterSpacing: cssVars.letterSpacing,
    ...(styleProp && typeof styleProp === "object" ? styleProp : null),
  };

  const mergedClass = [className, "ds-typography"].filter(Boolean).join(" ");

  return (
    <Tag {...rest} className={mergedClass} style={typographyStyle}>
      {children}
    </Tag>
  );
}
