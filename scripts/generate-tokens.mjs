import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const primitivePath = resolve(root, "tokens/primitive.json");
const typographyPath = resolve(root, "tokens/typography.json");
const semanticsPath = resolve(root, "tokens/semantics-light-mode.json");
const componentPath = resolve(root, "tokens/component.json");
const requiredTokenFiles = [
  primitivePath,
  typographyPath,
  semanticsPath,
  componentPath,
];

if (!requiredTokenFiles.every((p) => existsSync(p))) {
  console.warn(
    "[tokens:generate] Skip: token source files not found in tokens/*.json",
  );
  process.exit(0);
}

const primitive = JSON.parse(readFileSync(primitivePath, "utf8"));
const typography = JSON.parse(readFileSync(typographyPath, "utf8"));
const semantics = JSON.parse(readFileSync(semanticsPath, "utf8"));
const component = JSON.parse(readFileSync(componentPath, "utf8"));

const outTsPath = resolve(root, "src/design-system/generated/tokens.ts");
const outCssPath = resolve(
  root,
  "src/design-system/generated/css-variables.css",
);

const toPx = (value) => String(value).replace(/^\{|\}$/g, "");
const ref = (tokenRef, source) => {
  const path = toPx(tokenRef).split(".");
  let current = source;
  for (const key of path) current = current[key];
  return current.$value ?? current;
};

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

/** แก้ token สีแบบ {color.*} จาก semantics → primitive */
function resolveColorRef(refStr, depth = 0) {
  if (depth > 32) {
    throw new Error(`resolveColorRef ลึกเกินไป: ${refStr}`);
  }
  const path = refStr.replace(/^\{|\}$/g, "").split(".");
  if (path[0] !== "color") {
    throw new Error(`คาดหวัง color ref ได้: ${refStr}`);
  }
  const sub = path.slice(1);

  const semNode = walkTree(semantics.color, sub);
  if (semNode?.$value != null) {
    const v = semNode.$value;
    if (typeof v === "string" && v.startsWith("{") && v.endsWith("}")) {
      return resolveColorRef(v, depth + 1);
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

const txGeneralHeading = resolveColorRef(component.color.tx.general.heading.$value);

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

function emitFlatDimensionCss(obj, prefix) {
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v?.$value != null) {
      const safe = String(k).replace(/\./g, "-");
      lines.push(`  ${prefix}${safe}: ${v.$value};`);
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
  const inner = refStr.replace(/^\{|\}$/g, "");
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
const docLeadStyle = typography.typography.text["lg-regular"].$value;
const bodyUiLineHeightRef = typography.typography.text["md-regular"].$value.lineHeight;

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
    typographyGroups[groupName][styleName] = {
      fontFamily: ref(styleToken.$value.fontFamily, primitive),
      fontSize: ref(styleToken.$value.fontSize, primitive),
      lineHeight: ref(styleToken.$value.lineHeight, primitive),
      fontWeight: Number(ref(styleToken.$value.fontWeight, primitive)),
      letterSpacing: ref(styleToken.$value.letterSpacing, primitive),
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
  --line-height-doc-page-title: ${typographyLineHeightRefToVar(docPageTitleStyle.lineHeight)};
  --letter-spacing-doc-page-title: ${typographyLetterSpacingRefToVar(docPageTitleStyle.letterSpacing)};
  --font-size-doc-lead: ${semanticFontSizeVar("body", "lg")};
  --line-height-doc-lead: ${typographyLineHeightRefToVar(docLeadStyle.lineHeight)};
  --font-size-doc-nav-link: ${semanticFontSizeVar("body", "sm")};
  --font-size-doc-nav-label: ${semanticFontSizeVar("body", "xs")};
  --font-size-doc-brand-sub: ${semanticFontSizeVar("body", "lg")};
  --font-size-code-block: ${typographyFontSizeRefToVar("{typography.font-size.12}")};
  --line-height-doc-body: ${typographyLineHeightRefToVar(bodyUiLineHeightRef)};
  --line-height-code-block: calc(var(--line-height-19-5) / var(--font-size-12));
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

const tsContent = `/* Auto-generated by scripts/generate-tokens.mjs */
export const dsTokens = ${JSON.stringify(
  { fontFamily, fontSize, lineHeight, fontWeight, typography: typographyGroups, semanticSize },
  null,
  2,
)} as const;
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
writeFileSync(outTsPath, tsContent, "utf8");
writeFileSync(outCssPath, cssContent, "utf8");
console.log("Generated design system tokens.");
