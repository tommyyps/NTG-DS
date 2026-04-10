/**
 * แมปค่าจาก dsTokens.typography → CSS variables ใน generated/css-variables.css
 * ให้ Typography / คอมโพเนนต์ใช้ทูเดียวกับดีไซน์ทุกที่ ไม่ฝัง px จาก JS โดยตรง
 */

const FONT_SIZE_PX_TO_VAR: Record<string, string> = {
  "12px": "var(--font-size-12)",
  "14px": "var(--font-size-14)",
  "16px": "var(--font-size-16)",
  "18px": "var(--font-size-18)",
  "20px": "var(--font-size-20)",
  "24px": "var(--font-size-24)",
  "30px": "var(--font-size-30)",
  "36px": "var(--font-size-36)",
  "48px": "var(--font-size-48)",
  "60px": "var(--font-size-60)",
  "72px": "var(--font-size-72)",
};

/** ค่า px ที่ resolve จากโทเค็น → ตัวแปรที่ emit ค่า px เดียวกันใน css-variables.css */
const LINE_HEIGHT_PX_TO_VAR: Record<string, string> = {
  "18px": "var(--line-height-15)",
  "18.38px": "var(--line-height-15)",
  "21px": "var(--line-height-19-5)",
  "24px": "var(--line-height-18)",
  "26px": "var(--line-height-24)",
  "27px": "var(--line-height-27)",
  "30px": "var(--line-height-22-5)",
  "30.38px": "var(--line-height-22-5)",
  "32px": "var(--line-height-28-5)",
  "36px": "var(--line-height-36)",
  "44px": "var(--line-height-33)",
  "52px": "var(--line-height-39)",
  "70px": "var(--line-height-54)",
  "88px": "var(--line-height-66)",
  "105px": "var(--line-height-78)",
};

const FONT_WEIGHT_TO_VAR: Record<number, string> = {
  400: "var(--font-weight-regular)",
  500: "var(--font-weight-medium)",
  600: "var(--font-weight-semibold)",
  700: "var(--font-weight-bold)",
};

const LETTER_SPACING_TO_VAR: Record<string, string> = {
  "0px": "var(--letter-spacing-none)",
  "2px": "var(--letter-spacing-text-wide)",
};

export type TypographyTokenSlice = {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing: string;
};

/** ไม่มี --line-height-* ตรงกับ px นี้ — ใช้อัตราส่วนต่อ var(--font-size-*) เหมือน Figma (เช่น 12px + 13.5px → ×1.125) */
function lineHeightToCssVarOrCalc(
  fontSizePxKey: string,
  lineHeightPxKey: string,
): string | null {
  const fzNum = Number.parseFloat(fontSizePxKey);
  const lhNum = Number.parseFloat(lineHeightPxKey);
  if (
    !Number.isFinite(fzNum) ||
    !Number.isFinite(lhNum) ||
    lineHeightPxKey.trim().endsWith("%")
  ) {
    return null;
  }
  const ratio = Math.round((lhNum / fzNum) * 10000) / 10000;
  if (ratio < 1 || ratio > 2.5) return null;
  const fsVar = FONT_SIZE_PX_TO_VAR[fontSizePxKey];
  if (!fsVar) return null;
  return `calc(${fsVar} * ${ratio})`;
}

export function typographyTokenToCssVars(token: TypographyTokenSlice): {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing: string;
} {
  const fontFamily =
    token.fontFamily === "Sarabun"
      ? "var(--font-family-article)"
      : "var(--font-family-primary)";

  const fontSize =
    FONT_SIZE_PX_TO_VAR[token.fontSize] ?? token.fontSize;

  const mappedLh = LINE_HEIGHT_PX_TO_VAR[token.lineHeight];
  const lineHeight =
    mappedLh ??
    lineHeightToCssVarOrCalc(token.fontSize, token.lineHeight) ??
    token.lineHeight;

  const fontWeight =
    FONT_WEIGHT_TO_VAR[token.fontWeight] ?? String(token.fontWeight);

  const letterSpacing =
    LETTER_SPACING_TO_VAR[token.letterSpacing] ?? token.letterSpacing;

  return {
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing,
  };
}

/**
 * ข้อความไทย — คูณ line-height ที่ resolve แล้ว (var / calc / px)
 */
export function thaiScaledResolvedLineHeight(
  resolvedLineHeightCss: string,
  scale: number,
): string {
  const s = resolvedLineHeightCss.trim();
  if (s.startsWith("calc(") && s.endsWith(")")) {
    return `${s.slice(0, -1)} * ${scale})`;
  }
  if (s.startsWith("var(")) {
    return `calc(${s} * ${scale})`;
  }
  const n = Number.parseFloat(s);
  if (Number.isFinite(n) && s.endsWith("px")) {
    return `${Math.round(n * scale * 100) / 100}px`;
  }
  return s;
}
