/** คำนวณอัตราความเปรียบต่างตาม WCAG 2.1 (sRGB) */

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, "");
  if (h.length !== 6 && h.length !== 8) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

function channelToLinear(c255: number): number {
  const c = c255 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const r = channelToLinear(rgb.r);
  const g = channelToLinear(rgb.g);
  const b = channelToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number | null {
  const L1 = relativeLuminance(hexA);
  const L2 = relativeLuminance(hexB);
  if (L1 == null || L2 == null) return null;
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

export function formatContrastRatio(ratio: number): string {
  return ratio.toFixed(2);
}

/** ระดับข้อความปกติ (~16px): AAA ≥7, AA ≥4.5, ต่ำกว่านั้นจัดเป็น A (ไม่แนะนำข้อความหลัก) */
export function wcagTextLevel(
  ratio: number,
): "AAA" | "AA" | "A" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "A";
}

export const REF_WHITE = "#ffffff";
export const REF_BLACK = "#000000";
