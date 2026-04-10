/**
 * รวมสามอย่าง:
 * 1) design tokens → packages/tokens/dist (css + tokens.mjs + tokens.json) สำหรับทุก framework
 * 2) apps/docs → design-system/generated/tokens.ts (TypeScript + as const สำหรับไซต์เอกสาร)
 * 3) Color playground → figmaColorSnapshot.ts (ต้องมี semantics-dark-mode.json)
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const tokenDir = resolve(root, "ntgds-figma-tokens");
const primitivePath = resolve(tokenDir, "primitive.json");
const typographyPath = resolve(tokenDir, "typography.json");
const semanticsPath = resolve(tokenDir, "semantics-light-mode.json");
const componentPath = resolve(tokenDir, "component.json");
const requiredTokenFiles = [
  primitivePath,
  typographyPath,
  semanticsPath,
  componentPath,
];

if (!requiredTokenFiles.every((p) => existsSync(p))) {
  console.warn(
    "[tokens:generate] Skip: ไม่พบ ntgds-figma-tokens/*.json (primitive, typography, semantics-light-mode, component)",
  );
  process.exit(0);
}

const primitive = JSON.parse(readFileSync(primitivePath, "utf8"));
const typography = JSON.parse(readFileSync(typographyPath, "utf8"));
const semantics = JSON.parse(readFileSync(semanticsPath, "utf8"));
const component = JSON.parse(readFileSync(componentPath, "utf8"));

const docsSrc = resolve(root, "apps/docs/src");
const tokensPkgDist = resolve(root, "packages/tokens/dist");
const outTsPath = resolve(docsSrc, "design-system/generated/tokens.ts");
const outCssPath = resolve(tokensPkgDist, "css-variables.css");

const toPx = (value) => String(value).replace(/^\{|\}$/g, "");
const ref = (tokenRef, source) => {
  if (tokenRef == null) return tokenRef;
  if (typeof tokenRef === "number") return tokenRef;
  const s = String(tokenRef);
  if (!s.startsWith("{")) return tokenRef;
  const path = toPx(s).split(".");
  let current = source;
  for (const key of path) current = current[key];
  return current.$value ?? current;
};

/**
 * Figma / Token export: ค่า lineHeight แบบตัวเลขสองแบบ
 * - < 2 → อัตราส่วนต่อ font-size (เช่น 1.125, 1.3125)
 * - ≥ 2 → มักเป็น (ความสูงบรรทัด px) / 16 — คูณ 16 ได้ px จริง (ไม่ใช่ fz * ตัวเลข)
 */
function lineHeightFromNumber(fontSizeResolved, lineHeightNum) {
  const fz = parseFloat(String(fontSizeResolved).replace(/px$/i, ""));
  if (!Number.isFinite(fz)) return `${lineHeightNum}px`;
  if (lineHeightNum >= 2) {
    const px = Math.round(lineHeightNum * 16 * 100) / 100;
    return `${px}px`;
  }
  return `${Math.round(fz * lineHeightNum * 100) / 100}px`;
}

function walkTree(tree, parts) {
  let cur = tree;
  for (const p of parts) {
    if (cur == null) return null;
    cur = cur[p];
  }
  return cur;
}

function srgbTokenToCss(val) {
  const [r, g, b] = val.components.map((c) => Math.round(Number(c) * 255));
  const a = val.alpha;
  if (a != null && a !== 1) {
    return `rgba(${r},${g},${b},${a})`;
  }
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

/** แก้ token สีแบบ {color.*} จาก semantics → primitive (sem ค่า default = โหมดสว่าง) */
function resolveColorRef(refStr, sem = semantics, depth = 0) {
  if (depth > 48) {
    throw new Error(`resolveColorRef ลึกเกินไป: ${refStr}`);
  }
  const path = refStr.replace(/^\{|\}$/g, "").split(".");
  if (path[0] !== "color") {
    throw new Error(`คาดหวัง color ref ได้: ${refStr}`);
  }
  const sub = path.slice(1);

  const semNode = walkTree(sem.color, sub);
  if (semNode?.$value != null) {
    const v = semNode.$value;
    if (typeof v === "string" && v.startsWith("{") && v.endsWith("}")) {
      return resolveColorRef(v, sem, depth + 1);
    }
    if (typeof v === "object" && v.colorSpace === "srgb") {
      return srgbTokenToCss(v);
    }
  }

  const primNode = walkTree(primitive.color, sub);
  if (primNode?.$value?.colorSpace === "srgb") {
    return srgbTokenToCss(primNode.$value);
  }

  throw new Error(`แก้ token สีไม่ได้: ${refStr}`);
}

const txGeneralHeading = resolveColorRef(
  component.color.text.general.heading.$value,
);

/** semantic path ใต้ color.* → ชื่อตัวแปร CSS */
const semanticCssColorVars = [
  ["--color-text-primary-default", "text.primary.default"],
  ["--color-text-secondary-default", "text.secondary.default"],
  ["--color-text-quaternary-default", "text.quaternary.default"],
  ["--color-text-system-disabled", "text.system.disabled"],
  ["--color-text-system-error", "text.system.error"],
  ["--color-text-brand-primary", "text.brand.primary"],
  ["--color-background-primary-default", "background.primary.default"],
  ["--color-background-primary-hover", "background.primary.hover"],
  ["--color-background-primary-solid", "background.primary.solid"],
  ["--color-border-general-primary", "border.general.primary"],
  ["--color-border-general-secondary", "border.general.secondary"],
  ["--color-text-system-white", "text.system.white"],
];

const semanticColorLines = semanticCssColorVars.map(([cssName, semPath]) => {
  const hex = resolveColorRef(`{color.${semPath}}`);
  return `  ${cssName}: ${hex};`;
});

/** primitive.size.space → --space-* / --space-*-* */
function emitSpaceCss(spaceObj) {
  const lines = [];
  for (const [k, v] of Object.entries(spaceObj)) {
    if (v?.$value != null) {
      lines.push(`  --space-${k}: ${v.$value};`);
    } else if (v && typeof v === "object") {
      for (const [ik, iv] of Object.entries(v)) {
        if (iv?.$value != null) {
          lines.push(`  --space-${k}-${ik}: ${iv.$value};`);
        }
      }
    }
  }
  return lines.join("\n");
}

/** Figma ส่ง line-height / radius-full เป็น number (พิกเซล) — ต้อง emit เป็น length ให้ถูก CSS */
function formatDimensionTokenValue(v) {
  const val = v.$value;
  if (typeof val === "number") return `${val}px`;
  return String(val);
}

function emitFlatDimensionCss(obj, prefix) {
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v?.$value != null) {
      const safe = String(k).replace(/\./g, "-");
      lines.push(`  ${prefix}${safe}: ${formatDimensionTokenValue(v)};`);
    }
  }
  return lines.join("\n");
}

const spaceCss = emitSpaceCss(primitive.size.space);
const radiusCss = emitFlatDimensionCss(primitive.size.radius, "--radius-");
const iconCss = emitFlatDimensionCss(primitive.size.icon, "--icon-size-");
const fontSizeCss = emitFlatDimensionCss(
  primitive.typography["font-size"],
  "--font-size-",
);
const lineHeightCss = emitFlatDimensionCss(
  primitive.typography["line-height"],
  "--line-height-",
);
const letterSpacingCss = emitFlatDimensionCss(
  primitive.typography["letter-spacing"],
  "--letter-spacing-",
);

/** {typography.font-size.30} → var(--font-size-30) */
function typographyFontSizeRefToVar(refStr) {
  const inner = refStr.replace(/^\{|\}$/g, "");
  const m = inner.match(/^typography\.font-size\.(.+)$/);
  if (!m) throw new Error(`คาดหวัง typography.font-size.* ได้: ${refStr}`);
  const key = m[1].replace(/\./g, "-");
  return `var(--font-size-${key})`;
}

/** {typography.line-height.33} → var(--line-height-33) */
function typographyLineHeightRefToVar(refStr) {
  const inner = refStr.replace(/^\{|\}$/g, "");
  const m = inner.match(/^typography\.line-height\.(.+)$/);
  if (!m) throw new Error(`คาดหวัง typography.line-height.* ได้: ${refStr}`);
  const key = m[1].replace(/\./g, "-");
  return `var(--line-height-${key})`;
}

/** {typography.letter-spacing.none} → var(--letter-spacing-none) */
function typographyLetterSpacingRefToVar(refStr) {
  const s = String(refStr);
  if (s === "0px" || s === "0") return "var(--letter-spacing-none)";
  const inner = s.replace(/^\{|\}$/g, "");
  const m = inner.match(/^typography\.letter-spacing\.(.+)$/);
  if (!m) throw new Error(`คาดหวัง typography.letter-spacing.* ได้: ${refStr}`);
  const key = m[1].replace(/\./g, "-");
  return `var(--letter-spacing-${key})`;
}

/** semantics.typography.size → อ้าง primitive เดียวกับ Figma */
function semanticFontSizeVar(group, name) {
  const tok = semantics.typography.size[group][name];
  return typographyFontSizeRefToVar(tok.$value);
}

const docPageTitleStyle = typography.typography.heading["h5-bold"].$value;
const bodyMdRegular = typography.typography.text["md-regular"].$value;
/** บล็อกโค้ดใช้ขนาดเดียวกับ text 12px ใน Figma — line-height เป็นอัตราส่วน (เช่น 1.125) ไม่ใช่ token --line-height-19-5 */
const codeBlockTypographyStyle = typography.typography.text["xs-medium"].$value;

function resolveLineHeightPx(styleValue) {
  let fs = ref(styleValue.fontSize, primitive);
  let lh = styleValue.lineHeight;
  if (typeof lh === "number") lh = lineHeightFromNumber(fs, lh);
  else {
    lh = ref(lh, primitive);
    if (typeof lh === "number") lh = `${lh}px`;
  }
  return String(lh);
}

const docPageTitleLineHeightPx = resolveLineHeightPx(docPageTitleStyle);
const docBodyLineHeightPx = resolveLineHeightPx(bodyMdRegular);

const lineHeightCodeBlockCss =
  typeof codeBlockTypographyStyle.lineHeight === "number"
    ? String(codeBlockTypographyStyle.lineHeight)
    : resolveLineHeightPx(codeBlockTypographyStyle);

function emitFontWeightCss(obj) {
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v?.$value != null) {
      lines.push(`  --font-weight-${k}: ${v.$value};`);
    }
  }
  return lines.join("\n");
}

const fontWeightCss = emitFontWeightCss(primitive.typography["font-weight"]);

const fontFamily = {
  primary: primitive.typography["font-family"].primary.$value,
  article: primitive.typography["font-family"].article.$value,
};

const fontSize = Object.fromEntries(
  Object.entries(primitive.typography["font-size"]).map(([k, v]) => [k, v.$value]),
);
const lineHeight = Object.fromEntries(
  Object.entries(primitive.typography["line-height"]).map(([k, v]) => [k, v.$value]),
);
const fontWeight = Object.fromEntries(
  Object.entries(primitive.typography["font-weight"]).map(([k, v]) => [k, v.$value]),
);

const typographyGroups = {};
for (const [groupName, group] of Object.entries(typography.typography)) {
  typographyGroups[groupName] = {};
  for (const [styleName, styleToken] of Object.entries(group)) {
    const v = styleToken.$value;
    let fontSize = ref(v.fontSize, primitive);
    let lineHeight = v.lineHeight;
    if (typeof lineHeight === "number") {
      lineHeight = lineHeightFromNumber(fontSize, lineHeight);
    } else {
      lineHeight = ref(lineHeight, primitive);
      if (typeof lineHeight === "number") lineHeight = `${lineHeight}px`;
    }
    typographyGroups[groupName][styleName] = {
      fontFamily: ref(v.fontFamily, primitive),
      fontSize: String(fontSize),
      lineHeight: String(lineHeight),
      fontWeight: Number(ref(v.fontWeight, primitive)),
      letterSpacing: String(ref(v.letterSpacing, primitive)),
    };
  }
}

const semanticSize = {};
for (const [groupName, group] of Object.entries(semantics.typography.size)) {
  semanticSize[groupName] = {};
  for (const [sizeName, token] of Object.entries(group)) {
    semanticSize[groupName][sizeName] = ref(token.$value, primitive);
  }
}

const layoutCss = `
  --font-size-doc-page-title: ${semanticFontSizeVar("heading", "h5")};
  --line-height-doc-page-title: ${docPageTitleLineHeightPx};
  --letter-spacing-doc-page-title: ${typographyLetterSpacingRefToVar(String(docPageTitleStyle.letterSpacing))};
  --font-size-doc-lead: ${semanticFontSizeVar("body", "lg")};
  /* doc-lead หลายบรรทัด: text/lg-regular ใน Figma อาจจับคู่ 21px — กับ 18px แคบเกิน ใช้ --line-height-27 (1.5×) */
  --line-height-doc-lead: var(--line-height-27);
  --font-size-doc-nav-link: ${semanticFontSizeVar("body", "sm")};
  --font-size-doc-nav-label: ${semanticFontSizeVar("body", "xs")};
  --font-size-doc-brand-sub: ${semanticFontSizeVar("body", "lg")};
  --font-size-code-block: ${typographyFontSizeRefToVar("{typography.font-size.12}")};
  --line-height-doc-body: ${docBodyLineHeightPx};
  --line-height-code-block: ${lineHeightCodeBlockCss};
  --layout-doc-sidebar-width: calc(var(--space-md-sm) * 8 + var(--space-xs-sm));
  --layout-doc-content-max-width: calc(var(--space-md-sm) * 30);
  --icon-size-doc: var(--icon-size-2xl);
  --layout-doc-topbar-height: calc(var(--space-sm-xs) + var(--icon-size-doc) + var(--space-sm-xs) + 1px);
  /* กฎ padding เอกสาร: block (บน/ล่าง) = token --space-T-S, inline (ซ้าย/ขวา) = ขั้นถัดไปในสเกลเดียวกัน (เช่น md-xs→md-sm, lg-lg→lg-xl) */
  --layout-doc-main-padding-block-start: var(--space-md-xs);
  --layout-doc-main-padding-inline: var(--space-md-sm);
  --layout-doc-main-padding-block-end: var(--space-lg-xs);
  --layout-doc-main-padding-block-start-mobile: var(--space-sm-lg);
  --layout-doc-main-padding-inline-mobile: var(--space-sm-xl);
  --layout-doc-main-padding-block-end-mobile: var(--space-md-lg);
  --layout-playground-controls-width: calc(var(--space-md-sm) * 9 + var(--space-sm-xs));
  --layout-playground-canvas-min-height: calc(var(--space-md-sm) * 6 + var(--space-xs-lg));
  --layout-playground-controls-sticky-top: calc(var(--layout-doc-topbar-height) + var(--space-sm-lg));
  --layout-breakpoint-md: 960px;
  --letter-spacing-doc-label: var(--letter-spacing-none);
`;

const tokensData = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  typography: typographyGroups,
  semanticSize,
};

const tsContent = `/* Auto-generated by scripts/generate-tokens.mjs */
export const dsTokens = ${JSON.stringify(tokensData, null, 2)} as const;
`;

const tokensMjsContent = `/* Auto-generated by scripts/generate-tokens.mjs — ESM ล้วน สำหรับ React / Next / Vue / Node */
export const dsTokens = ${JSON.stringify(tokensData, null, 2)};
`;

const cssContent = `/* Auto-generated by scripts/generate-tokens.mjs */
:root {
  --font-family-primary: "${fontFamily.primary}", sans-serif;
  --font-family-article: "${fontFamily.article}", sans-serif;
  --font-size-body: ${semanticSize.body.md};
${semanticColorLines.join("\n")}
${spaceCss}
${radiusCss}
${iconCss}
${fontSizeCss}
${lineHeightCss}
${letterSpacingCss}
${fontWeightCss}
${layoutCss}
  /* ตัวแปรสั้นสำหรับเลย์เอาต์ doc site (อ้างอิง semantics เดียวกับ Figma) */
  --color-bg: var(--color-background-primary-hover);
  --color-surface: var(--color-background-primary-default);
  --color-text: var(--color-text-primary-default);
  --color-text-muted: var(--color-text-secondary-default);
  --color-border: var(--color-border-general-primary);
  --color-brand: var(--color-text-brand-primary);
  /* Figma: color/tx/general/heading → tokens/component.json color.tx.general.heading */
  --color-tx-general-heading: ${txGeneralHeading};
  --color-doc-nav-active-bg: color-mix(in srgb, var(--color-text-brand-primary) 8%, transparent);
  --color-doc-badge-bg: color-mix(in srgb, var(--color-text-brand-primary) 12%, transparent);
  --color-code-bg: var(--color-background-primary-solid);
  --color-code-text: var(--color-text-system-white);
  --color-code-muted: color-mix(in srgb, var(--color-code-text) 62%, transparent);
  --color-code-header-border: color-mix(in srgb, var(--color-text-system-white) 8%, transparent);
  --color-code-copy-border: color-mix(in srgb, var(--color-text-system-white) 20%, transparent);
  --color-code-copy-bg: color-mix(in srgb, var(--color-text-system-white) 8%, transparent);
  --color-code-copy-bg-hover: color-mix(in srgb, var(--color-text-system-white) 14%, transparent);
  --color-code-copy-border-hover: color-mix(in srgb, var(--color-text-system-white) 28%, transparent);
}
`;

mkdirSync(dirname(outTsPath), { recursive: true });
mkdirSync(tokensPkgDist, { recursive: true });
writeFileSync(outTsPath, tsContent, "utf8");
writeFileSync(outCssPath, cssContent, "utf8");
writeFileSync(resolve(tokensPkgDist, "tokens.mjs"), tokensMjsContent, "utf8");
writeFileSync(
  resolve(tokensPkgDist, "tokens.json"),
  `${JSON.stringify(tokensData, null, 2)}\n`,
  "utf8",
);
console.log("Generated design system tokens.");

const semanticsDarkPath = resolve(tokenDir, "semantics-dark-mode.json");
if (existsSync(semanticsDarkPath)) {
  const semanticsDark = JSON.parse(readFileSync(semanticsDarkPath, "utf8"));
  emitPlaygroundFigmaColorSnapshot({
    root,
    primitive,
    semanticsLight: semantics,
    semanticsDark,
    component,
    resolveColorRef,
    srgbTokenToCss,
  });
} else {
  console.warn(
    "[tokens:generate] ข้าม figmaColorSnapshot.ts — ไม่พบ semantics-dark-mode.json",
  );
}

/**
 * Color playground: primitive + semantic light/dark + component → figmaColorSnapshot.ts
 */
function emitPlaygroundFigmaColorSnapshot({
  root,
  primitive,
  semanticsLight,
  semanticsDark,
  component,
  resolveColorRef,
  srgbTokenToCss,
}) {
  const outFile = resolve(
    root,
    "apps/docs/src/pages/playgrounds/generated/figmaColorSnapshot.ts",
  );

  function walkLeaves(obj, prefix, onLeaf) {
    if (obj == null || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walkLeaves(item, `${prefix}.${i}`, onLeaf));
      return;
    }
    if (
      obj.$type != null &&
      Object.prototype.hasOwnProperty.call(obj, "$value")
    ) {
      onLeaf(prefix, obj);
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("$")) continue;
      walkLeaves(v, prefix ? `${prefix}.${k}` : k, onLeaf);
    }
  }

  function pathToTokenSlash(dotPath) {
    return `color/${dotPath.split(".").join("/")}`;
  }

  function componentDotPathToPlaygroundToken(parts) {
    if (parts.length < 3) return null;
    const [layer, group, ...rest] = parts;
    if (layer === "effect" && group === "shadows") {
      return `color/component/elevation/shadow/${rest.join("/")}`;
    }
    return `color/component/${group}/${layer}/${rest.join("/")}`;
  }

  function parseHexRgb(hex) {
    const t = hex.trim();
    const m6 = t.match(/^#([0-9a-fA-F]{6})$/);
    if (m6) {
      const n = parseInt(m6[1], 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    const m8 = t.match(/^#([0-9a-fA-F]{8})$/);
    if (m8) {
      const n = parseInt(m8[1], 16);
      return {
        r: (n >> 24) & 255,
        g: (n >> 16) & 255,
        b: (n >> 8) & 255,
        a: (n & 255) / 255,
      };
    }
    return null;
  }

  function withAlpha(hex, alpha) {
    const rgb = parseHexRgb(hex);
    if (!rgb || rgb.a != null) return hex;
    const { r, g, b } = rgb;
    return `#${[r, g, b, Math.round(alpha * 255)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  const FIGMA_PRIMITIVE_HEX = {};
  walkLeaves(primitive.color, "", (path, node) => {
    if (!path || node.$type !== "color") return;
    const v = node.$value;
    if (typeof v === "object" && v.colorSpace === "srgb") {
      FIGMA_PRIMITIVE_HEX[pathToTokenSlash(path)] = srgbTokenToCss(v);
    }
  });

  const FIGMA_SEMANTIC_HEX = {};
  walkLeaves(semanticsLight.color, "", (path, node) => {
    if (!path || node.$type !== "color") return;
    const refOr = node.$value;
    if (typeof refOr === "string" && refOr.startsWith("{")) {
      try {
        FIGMA_SEMANTIC_HEX[pathToTokenSlash(path)] = resolveColorRef(
          refOr,
          semanticsLight,
        );
      } catch {
        /* skip broken */
      }
    } else if (typeof refOr === "object" && refOr.colorSpace === "srgb") {
      FIGMA_SEMANTIC_HEX[pathToTokenSlash(path)] = srgbTokenToCss(refOr);
    }
  });

  const FIGMA_DARK_HEX = {};
  walkLeaves(semanticsDark.color, "", (path, node) => {
    if (!path || node.$type !== "color") return;
    const key = pathToTokenSlash(path);
    const refOr = node.$value;
    if (typeof refOr === "string" && refOr.startsWith("{")) {
      try {
        FIGMA_DARK_HEX[key] = resolveColorRef(refOr, semanticsDark);
      } catch {
        /* skip */
      }
    } else if (typeof refOr === "object" && refOr.colorSpace === "srgb") {
      FIGMA_DARK_HEX[key] = srgbTokenToCss(refOr);
    }
  });

  const FIGMA_UTILITY_HEX = {};
  for (const [k, v] of Object.entries(FIGMA_SEMANTIC_HEX)) {
    if (k.startsWith("color/utility/") || k.startsWith("color/alpha/")) {
      FIGMA_UTILITY_HEX[k] = v;
    }
  }

  const FIGMA_COMPONENT_COLOR_HEX = {};
  const FIGMA_COMPONENT_DARK_HEX = {};

  walkLeaves(component.color, "", (path, node) => {
    if (!path || node.$type !== "color") return;
    const parts = path.split(".");
    const token = componentDotPathToPlaygroundToken(parts);
    if (!token) return;
    const refOr = node.$value;
    if (typeof refOr !== "string" || !refOr.startsWith("{")) return;
    try {
      FIGMA_COMPONENT_COLOR_HEX[token] = resolveColorRef(
        refOr,
        semanticsLight,
      );
    } catch {
      /* skip */
    }
    try {
      FIGMA_COMPONENT_DARK_HEX[token] = resolveColorRef(
        refOr,
        semanticsDark,
      );
    } catch {
      /* skip */
    }
  });

  function pickSemantic(k) {
    const v = FIGMA_SEMANTIC_HEX[k];
    if (!v) throw new Error(`Missing semantic ${k} for synthetic component fill`);
    return v;
  }

  function pickSemanticFirst(keys) {
    for (const k of keys) {
      const v = FIGMA_SEMANTIC_HEX[k];
      if (v) return v;
    }
    throw new Error(`Missing semantic one of: ${keys.join(", ")}`);
  }

  try {
    FIGMA_COMPONENT_COLOR_HEX["color/component/typography/text/body"] =
      pickSemantic("color/text/tertiary/default");
    FIGMA_COMPONENT_DARK_HEX["color/component/typography/text/body"] =
      FIGMA_DARK_HEX["color/text/tertiary/default"] ??
      FIGMA_COMPONENT_COLOR_HEX["color/component/typography/text/body"];

    const brandText = pickSemantic("color/text/brand/primary");
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/background/brand"] =
      withAlpha(brandText, 0.12);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/border/brand"] =
      withAlpha(brandText, 0.35);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/text/brand"] = brandText;

    const brandTextD =
      FIGMA_DARK_HEX["color/text/brand/primary"] ?? brandText;
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/background/brand"] =
      withAlpha(brandTextD, 0.12);
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/border/brand"] =
      withAlpha(brandTextD, 0.35);
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/text/brand"] = brandTextD;

    const succ = pickSemanticFirst([
      "color/text/system/success-primary",
      "color/text/system/success",
    ]);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/background/success"] =
      withAlpha(succ, 0.12);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/border/success"] =
      withAlpha(succ, 0.35);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/text/success"] = succ;
    const succD =
      FIGMA_DARK_HEX["color/text/system/success-primary"] ??
      FIGMA_DARK_HEX["color/text/system/success"] ??
      succ;
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/background/success"] =
      withAlpha(succD, 0.12);
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/border/success"] =
      withAlpha(succD, 0.35);
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/text/success"] = succD;

    const warn = pickSemanticFirst([
      "color/text/system/warning-primary",
      "color/text/system/warning",
    ]);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/background/warning"] =
      withAlpha(warn, 0.14);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/border/warning"] =
      withAlpha(warn, 0.4);
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/text/warning"] = warn;
    const warnD =
      FIGMA_DARK_HEX["color/text/system/warning-primary"] ??
      FIGMA_DARK_HEX["color/text/system/warning"] ??
      warn;
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/background/warning"] =
      withAlpha(warnD, 0.14);
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/border/warning"] =
      withAlpha(warnD, 0.4);
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/text/warning"] = warnD;

    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/background/neutral"] =
      pickSemantic("color/background/tertiary/default");
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/border/neutral"] =
      pickSemantic("color/border/general/primary");
    FIGMA_COMPONENT_COLOR_HEX["color/component/badge/text/neutral"] =
      pickSemantic("color/text/quaternary/default");
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/background/neutral"] =
      FIGMA_DARK_HEX["color/background/tertiary/default"] ??
      FIGMA_COMPONENT_COLOR_HEX["color/component/badge/background/neutral"];
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/border/neutral"] =
      FIGMA_DARK_HEX["color/border/general/primary"] ??
      FIGMA_COMPONENT_COLOR_HEX["color/component/badge/border/neutral"];
    FIGMA_COMPONENT_DARK_HEX["color/component/badge/text/neutral"] =
      FIGMA_DARK_HEX["color/text/quaternary/default"] ??
      FIGMA_COMPONENT_COLOR_HEX["color/component/badge/text/neutral"];

    FIGMA_COMPONENT_COLOR_HEX["color/component/button/background/primary"] =
      pickSemantic("color/background/brand/solid");
    FIGMA_COMPONENT_COLOR_HEX["color/component/button/background/secondary"] =
      pickSemantic("color/background/primary/default");
    FIGMA_COMPONENT_COLOR_HEX["color/component/button/text/on-primary"] =
      pickSemantic("color/text/primary/on-brand");
    FIGMA_COMPONENT_COLOR_HEX["color/component/button/text/secondary"] =
      pickSemantic("color/text/primary/default");
    FIGMA_COMPONENT_COLOR_HEX["color/component/button/border/secondary"] =
      pickSemantic("color/border/general/primary");
    const buttonMap = {
      "color/component/button/background/primary":
        "color/background/brand/solid",
      "color/component/button/background/secondary":
        "color/background/primary/default",
      "color/component/button/text/on-primary": "color/text/primary/on-brand",
      "color/component/button/text/secondary": "color/text/primary/default",
      "color/component/button/border/secondary":
        "color/border/general/primary",
    };
    for (const [compKey, semKey] of Object.entries(buttonMap)) {
      FIGMA_COMPONENT_DARK_HEX[compKey] =
        FIGMA_DARK_HEX[semKey] ?? FIGMA_COMPONENT_COLOR_HEX[compKey];
    }

    const black10 = pickSemanticFirst([
      "color/alpha/constant/black-10",
      "color/alpha/default/black-10",
    ]);
    FIGMA_COMPONENT_COLOR_HEX["color/component/overlay/scrim/black-10"] =
      black10;
    FIGMA_COMPONENT_DARK_HEX["color/component/overlay/scrim/black-10"] =
      FIGMA_DARK_HEX["color/alpha/constant/black-10"] ??
      FIGMA_DARK_HEX["color/alpha/default/black-10"] ??
      black10;

    const xs = FIGMA_COMPONENT_COLOR_HEX["color/component/elevation/shadow/xs"];
    if (xs) FIGMA_UTILITY_HEX["color/efc/shadows/xs"] = xs;

    if (!FIGMA_COMPONENT_COLOR_HEX["color/component/ams/border/solid-alt"]) {
      const v =
        FIGMA_SEMANTIC_HEX["color/border/ams/solid-alt"] ??
        FIGMA_SEMANTIC_HEX["color/border/brand/solid-alt"];
      if (v) {
        FIGMA_COMPONENT_COLOR_HEX["color/component/ams/border/solid-alt"] = v;
        FIGMA_COMPONENT_DARK_HEX["color/component/ams/border/solid-alt"] =
          FIGMA_DARK_HEX["color/border/ams/solid-alt"] ??
          FIGMA_DARK_HEX["color/border/brand/solid-alt"] ??
          v;
      }
    }
  } catch (e) {
    console.warn("[tokens:generate] playground color snapshot synthetic fills:", e.message);
  }

  function emitConst(name, obj) {
    return `export const ${name} = ${JSON.stringify(obj, null, 2)} as const;\n`;
  }

  const header = `/* eslint-disable */
/* Auto-generated by scripts/generate-tokens.mjs — อย่าแก้มือ */
`;

  const body = [
    emitConst("FIGMA_PRIMITIVE_HEX", FIGMA_PRIMITIVE_HEX),
    emitConst("FIGMA_UTILITY_HEX", FIGMA_UTILITY_HEX),
    emitConst("FIGMA_SEMANTIC_HEX", FIGMA_SEMANTIC_HEX),
    emitConst("FIGMA_DARK_HEX", FIGMA_DARK_HEX),
    emitConst("FIGMA_COMPONENT_COLOR_HEX", FIGMA_COMPONENT_COLOR_HEX),
    emitConst("FIGMA_COMPONENT_DARK_HEX", FIGMA_COMPONENT_DARK_HEX),
  ].join("\n");

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${header}\n${body}`, "utf8");

  const nPrim = Object.keys(FIGMA_PRIMITIVE_HEX).length;
  const nSem = Object.keys(FIGMA_SEMANTIC_HEX).length;
  const nComp = Object.keys(FIGMA_COMPONENT_COLOR_HEX).length;
  console.log(
    `[tokens:generate] figmaColorSnapshot.ts (primitive ${nPrim}, semantic ${nSem}, component ${nComp})`,
  );
}
