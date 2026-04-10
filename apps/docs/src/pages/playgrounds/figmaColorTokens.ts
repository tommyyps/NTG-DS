/**
 * สีใน Color playground — sync จาก `ntgds-figma-tokens` (Token Press / Figma Variables)
 * รัน `npm run tokens:generate` เพื่ออัปเดต `generated/figmaColorSnapshot.ts` + design tokens
 */

import {
  FIGMA_COMPONENT_COLOR_HEX as _FIGMA_COMPONENT_COLOR_HEX,
  FIGMA_COMPONENT_DARK_HEX as _FIGMA_COMPONENT_DARK_HEX,
  FIGMA_DARK_HEX as _FIGMA_DARK_HEX,
  FIGMA_PRIMITIVE_HEX as _FIGMA_PRIMITIVE_HEX,
  FIGMA_SEMANTIC_HEX as _FIGMA_SEMANTIC_HEX,
  FIGMA_UTILITY_HEX as _FIGMA_UTILITY_HEX,
} from "./generated/figmaColorSnapshot";

export const FIGMA_PRIMITIVE_HEX: Record<string, string> = {
  ..._FIGMA_PRIMITIVE_HEX,
};
export const FIGMA_UTILITY_HEX: Record<string, string> = {
  ..._FIGMA_UTILITY_HEX,
};
export const FIGMA_SEMANTIC_HEX: Record<string, string> = {
  ..._FIGMA_SEMANTIC_HEX,
};
export const FIGMA_DARK_HEX: Partial<Record<string, string>> = {
  ..._FIGMA_DARK_HEX,
};
export const FIGMA_COMPONENT_COLOR_HEX: Record<string, string> = {
  ..._FIGMA_COMPONENT_COLOR_HEX,
};
export const FIGMA_COMPONENT_DARK_HEX: Partial<Record<string, string>> = {
  ..._FIGMA_COMPONENT_DARK_HEX,
};

export const PALETTE_CONST_WHITE_HEX =
  FIGMA_PRIMITIVE_HEX["color/base/white-100"] ?? "#ffffff";

export function getPrimitiveScale700Hex(familyId: string): string | undefined {
  return FIGMA_PRIMITIVE_HEX[`color/${familyId}/700`];
}

export const PALETTE_ON_LIGHT_FALLBACK_HEX =
  FIGMA_PRIMITIVE_HEX["color/gray-light/700"] ?? "#344054";

/** ใช้เทียบ hex ระหว่าง snapshot กับ primitive */
function normalizeHex6ForCompare(css: string): string | null {
  const s = String(css).trim();
  const m = s.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = [...h].map((c) => c + c).join("");
  }
  return `#${h.toUpperCase()}`;
}

function pickPrimitivePathWhenAmbiguous(
  matches: string[],
  hintRef: string | null | undefined,
  mode: "light" | "dark" | undefined,
): string {
  if (matches.length === 1) return matches[0];
  const hintTrim = (hintRef ?? "").trim();
  if (/^white$/i.test(hintTrim)) {
    const w = matches.find((p) => p.includes("white-100"));
    if (w) return w;
  }
  if (/^black$/i.test(hintTrim)) {
    const b = matches.find((p) => p.includes("black-100"));
    if (b) return b;
  }
  const stepMatch = hintRef?.match(/(\d+)$/);
  const step = stepMatch ? stepMatch[1] : null;
  let pool = matches;
  if (step) {
    const byStep = matches.filter((p) => {
      const tail = p.split("/").pop() ?? "";
      return tail === step || tail.startsWith(`${step}-`);
    });
    if (byStep.length) pool = byStep;
  }
  if (mode === "light") {
    const gl = pool.filter((p) => p.includes("/gray-light/"));
    if (gl.length === 1) return gl[0];
    if (gl.length > 1) return gl.sort((a, b) => a.localeCompare(b))[0];
  }
  if (mode === "dark") {
    const gd = pool.filter((p) => p.includes("/gray-dark/"));
    if (gd.length === 1) return gd[0];
    if (gd.length > 1) return gd.sort((a, b) => a.localeCompare(b))[0];
  }
  return pool.sort((a, b) => a.localeCompare(b))[0];
}

/**
 * หา path primitive (color/...) จากค่าสีทึบ — ใช้ป้ายสวอชในตารางให้สอดคล้องชั้น Primitive
 */
export function resolvePrimitivePathForOpaqueHex(
  css: string,
  options?: { mode?: "light" | "dark"; hintRef?: string | null },
): string | null {
  const target = normalizeHex6ForCompare(css);
  if (!target) return null;
  const matches: string[] = [];
  for (const [path, val] of Object.entries(FIGMA_PRIMITIVE_HEX)) {
    const v = normalizeHex6ForCompare(String(val));
    if (v === target) matches.push(path);
  }
  if (matches.length === 0) return null;
  return pickPrimitivePathWhenAmbiguous(
    matches,
    options?.hintRef,
    options?.mode,
  );
}

/**
 * ย่อ path primitive สำหรับป้าย badge — color/gray-light/900 → gray-light-900, color/brand/500 → brand-500
 */
export function formatPrimitiveBadgeLabel(pathOrShort: string): string {
  const s = pathOrShort.trim();
  if (!s.startsWith("color/")) {
    return s;
  }
  const segments = s.slice("color/".length).split("/");
  if (segments.length < 2) {
    return segments.join("-");
  }
  const step = segments[segments.length - 1]!;
  const mid = segments.slice(0, -1);
  const head = mid[0]!;

  if (head === "base") {
    return step;
  }
  if (head === "utility") {
    return step;
  }
  if (head === "gray-light" || head === "gray-dark") {
    return `${head}-${step}`;
  }
  if (head === "alpha" && mid[1] === "gray") {
    return `gray-${step}`;
  }
  if (head === "alpha" && mid.length >= 2) {
    return `${mid[1]}-${step}`;
  }
  if (head === "effect") {
    return mid.length > 1
      ? `${mid.slice(1).join("-")}-${step}`
      : `effect-${step}`;
  }
  if (mid.length === 1) {
    return `${head}-${step}`;
  }
  return [...mid, step].join("-");
}

/** พาเลต/ตาราง — แสดงเฉพาะสีทึบ (ไม่รวม rgba โปร่ง, transparent, #RRGGBBAA ที่ alpha < 255) */
export function isOpaqueCssColor(css: string): boolean {
  const s = String(css).trim();
  if (!s || /^transparent$/i.test(s)) return false;

  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(s)) return true;

  const hex8 = s.match(/^#([0-9A-Fa-f]{8})$/i);
  if (hex8) {
    const a = parseInt(hex8[1].slice(6, 8), 16);
    return a === 255;
  }

  const rgba = s.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgba) {
    if (rgba[4] == null) return true;
    const aStr = rgba[4];
    const a = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
    return Number.isFinite(a) && Math.abs(a - 1) < 1e-6;
  }

  const hsla = s.match(
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  );
  if (hsla) {
    if (hsla[4] == null) return true;
    const aStr = hsla[4];
    const a = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
    return Number.isFinite(a) && Math.abs(a - 1) < 1e-6;
  }

  return false;
}

function variableRowOpaque(row: {
  lightHex: string;
  darkHex: string | null;
}): boolean {
  if (!isOpaqueCssColor(row.lightHex)) return false;
  if (
    row.darkHex != null &&
    row.darkHex !== "" &&
    !isOpaqueCssColor(row.darkHex)
  ) {
    return false;
  }
  return true;
}

export type ComponentColorCategory =
  | "ams"
  | "brand-cta"
  | "typography"
  | "elevation"
  | "badge"
  | "button"
  | "overlay";

export const COMPONENT_COLOR_CATEGORY_ORDER: ComponentColorCategory[] = [
  "ams",
  "brand-cta",
  "typography",
  "elevation",
  "badge",
  "button",
  "overlay",
];

export const COMPONENT_CATEGORY_LABELS_TH: Record<
  ComponentColorCategory,
  string
> = {
  ams: "AMS · Hero / บล็อกมาร์เก็ตติ้ง (Figma Color/*/AMS/*)",
  "brand-cta": "Brand · พื้น/ขอบ CTA ทึบ",
  typography: "Typography · สล็อตข้อความในคอมโพเนนต์ (Color/Tx/General/Text)",
  elevation: "Elevation · สีเงาการ์ด (Color/Efc/Shadows/*)",
  badge: "Badge · ป้ายสถานะ (โค้ด Badge.tsx)",
  button: "Button · ปุ่มหลัก/รอง (โค้ด Button.tsx)",
  overlay: "Overlay · scrim โปร่ง",
};

type ComponentColorDef = {
  token: string;
  detail: string;
  figmaBadge: string;
  /** ตัวแปร semantic ที่ควร alias ใน Figma */
  semanticAlias?: string;
};

const COMPONENT_COLOR_BY_CATEGORY: Record<
  ComponentColorCategory,
  ComponentColorDef[]
> = {
  ams: [
    {
      token: "color/component/ams/background/solid",
      figmaBadge: "Color/Bg/AMS/Solid",
      detail:
        "พื้นทึบ AMS — อิง primitive color/ams/600 (ไม่ใช่ brand-500 โดยตรง)",
      semanticAlias: "color/ams/600",
    },
    {
      token: "color/component/ams/background/section",
      figmaBadge: "Color/Bg/AMS/Section",
      detail: "พื้นเซกชันมาร์เก็ตติ้ง / ฮีโร่เข้ม",
      semanticAlias: "color/background/brand/section",
    },
    {
      token: "color/component/ams/border/solid",
      figmaBadge: "Color/Bd/AMS/Solid",
      detail: "เส้นขอบทึบบนบล็อก AMS",
      semanticAlias: "color/border/brand/solid",
    },
    {
      token: "color/component/ams/border/solid-alt",
      figmaBadge: "Color/Bd/AMS/Solid alt",
      detail: "ทางเลือกขอบ AMS (เช่น โหมดมืดใช้เทา)",
      semanticAlias: "color/border/brand/solid-alt",
    },
    {
      token: "color/component/ams/foreground/primary",
      figmaBadge: "Color/Fg/AMS/Primary",
      detail: "ไอคอน/องค์ประกอบพื้นหน้าหลักบนพื้น AMS",
      semanticAlias: "color/foreground/brand/primary",
    },
    {
      token: "color/component/ams/text/primary",
      figmaBadge: "Color/Tx/AMS/Primary",
      detail: "หัวข้อหลักบนพื้น AMS",
      semanticAlias: "color/text/brand/primary",
    },
    {
      token: "color/component/ams/text/tertiary",
      figmaBadge: "Color/Tx/AMS/Tertiary",
      detail: "ข้อความรองบนพื้น AMS",
      semanticAlias: "color/text/brand/tertiary",
    },
    {
      token: "color/component/ams/text/on-brand",
      figmaBadge: "Color/Tx/AMS/On brand",
      detail: "ข้อความบนพื้นสีแบรนด์/AMS ทึบ",
      semanticAlias: "color/text/primary/on-brand",
    },
  ],
  "brand-cta": [
    {
      token: "color/component/brand/background/solid",
      figmaBadge: "Color/Bg/Brand/Solid",
      detail: "พื้นปุ่มแบรนด์ทึบ / CTA หลัก",
      semanticAlias: "color/background/brand/solid",
    },
    {
      token: "color/component/brand/border/solid",
      figmaBadge: "Color/Bd/Brand/Solid",
      detail: "ขอบโฟกัสหรือขอบทึบคู่กับ CTA",
      semanticAlias: "color/border/brand/solid",
    },
  ],
  typography: [
    {
      token: "color/component/typography/text/body",
      figmaBadge: "Color/Tx/General/Text",
      detail:
        "สล็อตเนื้อหาตัวอักษรในคอมโพเนนต์ (ไม่แทนทุกระดับ heading — ใช้ semantic text/* สำหรับ hierarchy)",
      semanticAlias: "color/text/tertiary/default",
    },
  ],
  elevation: [
    {
      token: "color/component/elevation/shadow/xs",
      figmaBadge: "Color/Efc/Shadows/xs",
      detail: "เงาระดับต่ำสุด — ค่าเดียวกับ color/efc/shadows/xs",
      semanticAlias: "color/efc/shadows/xs",
    },
    {
      token: "color/component/elevation/shadow/sm",
      figmaBadge: "Color/Efc/Shadows/sm",
      detail: "เงาระดับ sm — sync จาก Figma เมื่อแก้ตัวแปร",
    },
    {
      token: "color/component/elevation/shadow/lg",
      figmaBadge: "Color/Efc/Shadows/lg",
      detail: "เงาระดับ lg — sync จาก Figma เมื่อแก้ตัวแปร",
    },
    {
      token: "color/component/elevation/shadow/xl",
      figmaBadge: "Color/Efc/Shadows/xl",
      detail: "เงาระดับ xl — sync จาก Figma เมื่อแก้ตัวแปร",
    },
  ],
  badge: [
    {
      token: "color/component/badge/background/brand",
      figmaBadge: "Badge / brand · fill",
      detail: "พื้นโปร่งแบรนด์ (12% opacity)",
    },
    {
      token: "color/component/badge/border/brand",
      figmaBadge: "Badge / brand · border",
      detail: "ขอบโปร่งแบรนด์ (35% opacity)",
    },
    {
      token: "color/component/badge/text/brand",
      figmaBadge: "Badge / brand · text",
      detail: "ข้อความแบรนด์บนป้าย",
      semanticAlias: "color/text/brand/primary",
    },
    {
      token: "color/component/badge/background/neutral",
      figmaBadge: "Badge / neutral · fill",
      detail: "พื้น neutral ทึบ",
      semanticAlias: "color/background/tertiary/default",
    },
    {
      token: "color/component/badge/border/neutral",
      figmaBadge: "Badge / neutral · border",
      detail: "ขอบ neutral",
      semanticAlias: "color/border/general/primary",
    },
    {
      token: "color/component/badge/text/neutral",
      figmaBadge: "Badge / neutral · text",
      detail: "ข้อความ neutral",
      semanticAlias: "color/text/quaternary/default",
    },
    {
      token: "color/component/badge/background/success",
      figmaBadge: "Badge / success · fill",
      detail: "พื้นโปร่ง success",
    },
    {
      token: "color/component/badge/border/success",
      figmaBadge: "Badge / success · border",
      detail: "ขอบโปร่ง success",
    },
    {
      token: "color/component/badge/text/success",
      figmaBadge: "Badge / success · text",
      detail: "ข้อความ success",
      semanticAlias: "color/text/system/success",
    },
    {
      token: "color/component/badge/background/warning",
      figmaBadge: "Badge / warning · fill",
      detail: "พื้นโปร่ง warning (14% opacity)",
    },
    {
      token: "color/component/badge/border/warning",
      figmaBadge: "Badge / warning · border",
      detail: "ขอบโปร่ง warning (40% opacity)",
    },
    {
      token: "color/component/badge/text/warning",
      figmaBadge: "Badge / warning · text",
      detail: "ข้อความ warning",
      semanticAlias: "color/text/system/warning",
    },
  ],
  button: [
    {
      token: "color/component/button/background/primary",
      figmaBadge: "Button · primary fill",
      detail: "พื้นปุ่มหลัก — ควร alias → color/background/brand/solid",
      semanticAlias: "color/background/brand/solid",
    },
    {
      token: "color/component/button/background/secondary",
      figmaBadge: "Button · secondary fill",
      detail: "พื้นปุ่มรอง",
      semanticAlias: "color/background/primary/default",
    },
    {
      token: "color/component/button/text/on-primary",
      figmaBadge: "Button · on primary",
      detail: "ข้อความบนปุ่มทึบแบรนด์",
      semanticAlias: "color/text/primary/on-brand",
    },
    {
      token: "color/component/button/text/secondary",
      figmaBadge: "Button · secondary label",
      detail: "ข้อความปุ่มรอง",
      semanticAlias: "color/text/primary/default",
    },
    {
      token: "color/component/button/border/secondary",
      figmaBadge: "Button · secondary border",
      detail: "ขอบปุ่มรอง",
      semanticAlias: "color/border/general/primary",
    },
  ],
  overlay: [
    {
      token: "color/component/overlay/scrim/black-10",
      figmaBadge: "Overlay · black 10%",
      detail: "scrim โปร่ง 10% — ใช้ทับพื้นก่อนวางโมดัล/การ์ด",
    },
  ],
};

/** ตารางตัวแปรสีชั้นคอมโพเนนต์ตามหมวด (สำหรับ Color playground) */
export function buildComponentColorVariableRows(): Record<
  ComponentColorCategory,
  VariableRow[]
> {
  const out = {} as Record<ComponentColorCategory, VariableRow[]>;
  for (const cat of COMPONENT_COLOR_CATEGORY_ORDER) {
    const defs = COMPONENT_COLOR_BY_CATEGORY[cat];
    out[cat] = defs
      .map((d, i) => {
        const lightHex =
          FIGMA_COMPONENT_COLOR_HEX[d.token] ??
          (d.semanticAlias != null
            ? FIGMA_SEMANTIC_HEX[d.semanticAlias]
            : undefined);
        if (!lightHex) {
          throw new Error(`Missing hex for component row ${d.token}`);
        }
        const darkHex =
          FIGMA_COMPONENT_DARK_HEX[d.token] ??
          (d.semanticAlias != null ? FIGMA_DARK_HEX[d.semanticAlias] : undefined) ??
          null;
        return {
          orderLabel: String(i + 1),
          token: d.token,
          lightHex,
          darkHex,
          detail: d.detail,
          figmaBadge: d.figmaBadge,
          lightRef: d.semanticAlias ?? "—",
          darkRef: d.semanticAlias ?? "—",
        };
      })
      .filter(variableRowOpaque)
      .map((r, i) => ({ ...r, orderLabel: String(i + 1) }));
  }
  return out;
}

export type PaletteSwatch = { token: string; hex: string; stepLabel: string };

export type PaletteFamily = {
  id: string;
  label: string;
  note?: string;
  swatches: PaletteSwatch[];
};

const SCALE_FAMILY_ORDER = [
  "brand",
  "gray-light",
  "gray-dark",
  "bamboo",
  "green",
  "cyan",
  "blue",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "red",
  "orange",
  "yellow",
  "gold",
] as const;

const FAMILY_LABELS: Record<string, string> = {
  brand: "Palette · Brand",
  "gray-light": "Gray · โหมดสว่าง",
  "gray-dark": "Gray · โหมดมืด",
  bamboo: "Bamboo",
  green: "Green",
  cyan: "Cyan",
  blue: "Blue",
  purple: "Purple",
  fuchsia: "Fuchsia",
  pink: "Pink",
  rose: "Rose",
  red: "Red",
  orange: "Orange",
  yellow: "Yellow",
  gold: "Gold",
  ams: "AMS",
  base: "Base",
};

function stepSortKey(stepLabel: string): number {
  const n = parseInt(stepLabel, 10);
  return Number.isFinite(n) ? n : 0;
}

function stepLabelSort(a: string, b: string): number {
  const na = stepSortKey(a);
  const nb = stepSortKey(b);
  if (na !== 0 || nb !== 0) return na - nb;
  return a.localeCompare(b);
}

/** จานสี primitive — จัดกลุ่มตาม segment แรกหลัง color/ (ยกเว้น ams แยกต่างหาก) */
export function buildPrimitivePaletteFamilies(): PaletteFamily[] {
  const byFamily: Record<string, PaletteSwatch[]> = {};

  for (const [token, hex] of Object.entries(FIGMA_PRIMITIVE_HEX)) {
    const amsPrim = token.match(/^color\/ams\/(\d+)$/);
    if (amsPrim) {
      if (!isOpaqueCssColor(hex)) continue;
      if (!byFamily.ams) byFamily.ams = [];
      byFamily.ams.push({
        token,
        hex,
        stepLabel: amsPrim[1],
      });
      continue;
    }

    const m = token.match(/^color\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const [, fam, step] = m;
    if (fam === "ams" || fam === "base") continue;
    if (fam === "alpha" || fam === "effect") continue;
    if (!isOpaqueCssColor(hex)) continue;
    if (!byFamily[fam]) byFamily[fam] = [];
    byFamily[fam].push({ token, hex, stepLabel: step });
  }

  for (const [fid, arr] of Object.entries(byFamily)) {
    if (fid === "base") continue;
    arr.sort((a, b) => stepLabelSort(a.stepLabel, b.stepLabel));
  }

  const out: PaletteFamily[] = [];
  for (const id of SCALE_FAMILY_ORDER) {
    const swatches = byFamily[id];
    if (swatches?.length) {
      out.push({ id, label: FAMILY_LABELS[id] ?? id, swatches });
    }
  }

  for (const id of Object.keys(byFamily).sort()) {
    if (id === "ams" || id === "base") continue;
    if ((SCALE_FAMILY_ORDER as readonly string[]).includes(id)) continue;
    const swatches = byFamily[id];
    if (swatches?.length) {
      out.push({ id, label: FAMILY_LABELS[id] ?? id, swatches });
    }
  }

  if (byFamily.ams?.length) {
    out.push({
      id: "ams",
      label: FAMILY_LABELS.ams,
      swatches: byFamily.ams,
    });
  }

  const baseSwatches: PaletteSwatch[] = [];
  for (const [token, hex] of Object.entries(FIGMA_PRIMITIVE_HEX)) {
    if (!token.startsWith("color/base/")) continue;
    if (!isOpaqueCssColor(hex)) continue;
    const step = token.replace(/^color\/base\//, "");
    baseSwatches.push({ token, hex, stepLabel: step });
  }
  baseSwatches.sort((a, b) => a.stepLabel.localeCompare(b.stepLabel));
  if (baseSwatches.length) {
    out.push({
      id: "base",
      label: FAMILY_LABELS.base,
      swatches: baseSwatches,
    });
  }

  return out;
}

/** ตัวแปร color/utility/* จาก snapshot — ไม่รวม alpha, สเกล AMS, หรือ primitive ams (กรองสีโปร่งใน buildUtilityVariableRows) */
export function getUtilityTokens(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(FIGMA_UTILITY_HEX)) {
    if (k.startsWith("color/alpha/")) continue;
    if (k.startsWith("color/utility/ams/")) continue;
    out[k] = v;
  }
  return out;
}

export type SemanticCategory = "text" | "border" | "foreground" | "background";

export function categorizeSemanticToken(key: string): SemanticCategory {
  if (key.startsWith("color/text/")) {
    return "text";
  }
  if (key.startsWith("color/border/")) {
    return "border";
  }
  if (key.startsWith("color/foreground/") || key.startsWith("color/icon/")) {
    return "foreground";
  }
  if (key.startsWith("color/background/")) {
    return "background";
  }
  return "text";
}

const CATEGORY_LABELS: Record<SemanticCategory, string> = {
  text: "สีข้อความ (Text)",
  border: "สีเส้นขอบ (Border)",
  foreground: "สีพื้นหน้า / ไอคอน (Foreground)",
  background: "สีพื้นหลัง (Background)",
};

export type VariableRow = {
  /** ลำดับตามเอกสาร Figma เช่น 1, 1.1, 2 */
  orderLabel: string;
  token: string;
  lightHex: string;
  darkHex: string | null;
  detail: string;
  /** ชื่อย่อแบบใน Figma เช่น text-primary */
  figmaBadge?: string;
  /** ชื่อ primitive อ้างอิงโหมดสว่าง เช่น gray-light-900 */
  lightRef?: string;
  /** ชื่อ primitive อ้างอิงโหมดมืด เช่น gray-dark-50 */
  darkRef?: string;
};

/**
 * ชื่อโทเค็นแบบย่อสำหรับตาราง: color/utility/bamboo/bamboo-100 → utility/bamboo-100
 * (เมื่อชั้นกลุ่มกับ prefix ของตัวแปรซ้ำกัน) — path เต็มยังใช้ค่า `token` บรรทัดรอง
 */
export function formatColorTokenTitlePath(token: string): string {
  if (!token.startsWith("color/")) return token;
  const body = token.slice("color/".length);
  const parts = body.split("/");
  const group = parts[1];
  const leaf = parts[2];
  if (
    parts.length === 3 &&
    parts[0] === "utility" &&
    group != null &&
    leaf != null &&
    leaf.startsWith(`${group}-`)
  ) {
    return `utility/${leaf}`;
  }
  return body;
}

function tokenDetailTh(token: string): string {
  const tail = token.replace(/^color\/[^/]+\//, "").replace(/\//g, " · ");
  return `ตัวแปรเชิงความหมาย — ${tail}`;
}

export function buildVariableRowsByCategory(): Record<
  SemanticCategory,
  VariableRow[]
> {
  const keys = Object.keys(FIGMA_SEMANTIC_HEX).sort((a, b) =>
    a.localeCompare(b),
  );
  const buckets: Record<SemanticCategory, VariableRow[]> = {
    text: [],
    border: [],
    foreground: [],
    background: [],
  };
  for (const token of keys) {
    const cat = categorizeSemanticToken(token);
    const list = buckets[cat];
    const row: VariableRow = {
      orderLabel: String(list.length + 1),
      token,
      lightHex: FIGMA_SEMANTIC_HEX[token],
      darkHex: FIGMA_DARK_HEX[token] ?? null,
      detail: tokenDetailTh(token),
    };
    if (!variableRowOpaque(row)) continue;
    list.push({ ...row, orderLabel: String(list.length + 1) });
  }
  return buckets;
}

function utilityVariableDetail(token: string): string {
  if (token.startsWith("color/utility/")) {
    return "สเกล utility สำหรับคอมโพเนนต์หลายสี (เช่น badges)";
  }
  return "ตัวแปรสีทึบจาก utility collection";
}

function mapUtilityTokensToRows(
  tokens: string[],
  u: Record<string, string>,
): VariableRow[] {
  const rows = [...tokens]
    .sort((a, b) => a.localeCompare(b))
    .map((token) => ({
      orderLabel: "",
      token,
      lightHex: u[token]!,
      darkHex: FIGMA_DARK_HEX[token] ?? null,
      detail: utilityVariableDetail(token),
    }))
    .filter(variableRowOpaque);
  return rows.map((r, i) => ({ ...r, orderLabel: String(i + 1) }));
}

/** ส่วนกลุ่มพาเลตจาก path เช่น color/utility/bamboo/bamboo-100 → bamboo */
export function utilityPaletteIdFromToken(token: string): string | null {
  if (!token.startsWith("color/utility/")) return null;
  const rest = token.slice("color/utility/".length);
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  return rest.slice(0, slash);
}

/** ลำดับแสดงตาราง utility ตามเอกสาร/สเปกรุ่มทั่วไป — พาเลตใหม่ที่ไม่อยู่ในรายการจะเรียงตามชื่อก่อน "_other" */
const UTILITY_PALETTE_ORDER: readonly string[] = [
  "gray",
  "brand",
  "bamboo",
  "green",
  "cyan",
  "blue",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "red",
  "orange",
  "yellow",
  "gold",
];

function compareUtilityPaletteIds(a: string, b: string): number {
  if (a === "_other") return 1;
  if (b === "_other") return -1;
  const ia = UTILITY_PALETTE_ORDER.indexOf(a);
  const ib = UTILITY_PALETTE_ORDER.indexOf(b);
  const aKnown = ia >= 0;
  const bKnown = ib >= 0;
  if (aKnown && bKnown) return ia - ib;
  if (aKnown) return -1;
  if (bKnown) return 1;
  return a.localeCompare(b);
}

function utilityPaletteTableTitle(paletteId: string): string {
  if (paletteId === "_other") return "อื่น ๆ";
  return paletteId.charAt(0).toUpperCase() + paletteId.slice(1);
}

export type UtilityPaletteSection = {
  paletteId: string;
  title: string;
  rows: VariableRow[];
};

/** แยกตาราง utility ตามพาเลต (เช่น bamboo, gray) — ลำดับแถวภายในพาเลตยังเรียงตาม path */
export function buildUtilityVariableRowsByPalette(): UtilityPaletteSection[] {
  const u = getUtilityTokens();
  const groups: Record<string, string[]> = {};
  for (const token of Object.keys(u)) {
    const id = utilityPaletteIdFromToken(token) ?? "_other";
    if (!groups[id]) groups[id] = [];
    groups[id]!.push(token);
  }
  return Object.keys(groups)
    .sort(compareUtilityPaletteIds)
    .map((paletteId) => ({
      paletteId,
      title: utilityPaletteTableTitle(paletteId),
      rows: mapUtilityTokensToRows(groups[paletteId]!, u),
    }))
    .filter((s) => s.rows.length > 0);
}

export function buildUtilityVariableRows(): VariableRow[] {
  const u = getUtilityTokens();
  return mapUtilityTokensToRows(Object.keys(u), u);
}

export { CATEGORY_LABELS };
