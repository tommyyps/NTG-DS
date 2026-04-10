import { useMemo, type ReactNode } from "react";
import {
  buildPrimitivePaletteFamilies,
  buildUtilityVariableRowsByPalette,
  formatColorTokenTitlePath,
  getPrimitiveScale700Hex,
  PALETTE_CONST_WHITE_HEX,
  PALETTE_ON_LIGHT_FALLBACK_HEX,
  resolvePrimitivePathForOpaqueHex,
  formatPrimitiveBadgeLabel,
  type PaletteFamily,
  type VariableRow,
} from "./figmaColorTokens";
import {
  buildMainColorVariableRows,
  MAIN_CATEGORY_LABELS_TH,
  MAIN_COLOR_CATEGORY_ORDER,
  type MainColorCategory,
} from "./colorVariableFigmaDocs";
import {
  contrastRatio,
  formatContrastRatio,
  wcagTextLevel,
} from "../../utils/wcagContrast";
import { ColorSwatchBadge, Typography } from "../../design-system";
import { DocPageHeader } from "../../site/DocPageHeader";
import "../../site/PlaygroundShell.css";
import "./ColorPlayground.css";

function isOpaqueHex6(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex.trim());
}

/** แปลงค่าสี → ป้าย hex สำหรับ title / fallback (รวม rgba จาก snapshot) */
function formatSwatchHexLabel(cssColor: string | null | undefined): string {
  if (cssColor == null || String(cssColor).trim() === "") return "—";
  const s = String(cssColor).trim();
  if (/^transparent$/i.test(s)) return "#00000000";

  const hexOnly = s.match(
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
  );
  if (hexOnly) {
    let h = hexOnly[1]!;
    if (h.length === 3) {
      h = [...h].map((c) => c + c).join("");
    }
    return `#${h.toUpperCase()}`;
  }

  const rgbm = s.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgbm) {
    const r = Number(rgbm[1]);
    const g = Number(rgbm[2]);
    const b = Number(rgbm[3]);
    let alpha = 1;
    if (rgbm[4] != null) {
      const aStr = rgbm[4];
      alpha = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
    }
    if ([r, g, b, alpha].some((n) => Number.isNaN(n))) return s.toUpperCase();
    const byte = (x: number) =>
      Math.max(0, Math.min(255, Math.round(x)));
    const to2 = (x: number) => byte(x).toString(16).padStart(2, "0").toUpperCase();
    if (alpha >= 1 - 1e-6) {
      return `#${to2(r)}${to2(g)}${to2(b)}`;
    }
    const aByte = byte(alpha * 255);
    return `#${to2(r)}${to2(g)}${to2(b)}${aByte.toString(16).padStart(2, "0").toUpperCase()}`;
  }

  return s;
}

const TIERS_BRAND_HEX = "#1E58F2";

function ColorDocListItem({ children }: { children: ReactNode }) {
  return (
    <li>
      <Typography group="text" styleName="md-regular" as="div">
        {children}
      </Typography>
    </li>
  );
}

function ColorDocExampleLi({ children }: { children: ReactNode }) {
  return (
    <li>
      <Typography group="text" styleName="xs-regular" as="div">
        {children}
      </Typography>
    </li>
  );
}

function TiersArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill="currentColor"
      />
    </svg>
  );
}

/** ตัวอย่าง UI ระดับชั้นของสี — อ้างอิง Figma node 8541:6971 */
function ColorTiersDiagram() {
  return (
    <div
      className="color-tiers-diagram"
      role="region"
      aria-label="ลำดับสีจากค่าดิบไปจนถึงระดับคอมโพเนนต์"
    >
      <ol className="color-tiers-rows">
        <li className="color-tiers-row">
          <Typography
            group="text"
            styleName="sm-regular"
            as="span"
            className="color-tiers-step"
            aria-hidden
          >
            0
          </Typography>
          <Typography
            group="text"
            styleName="sm-medium"
            as="span"
            className="color-tiers-tier-label"
          >
            Raw Value
          </Typography>
          <ColorSwatchBadge
            label="#1E58F2"
            hex={TIERS_BRAND_HEX}
            placement="swatch-first"
          />
        </li>
        <li className="color-tiers-row">
          <Typography
            group="text"
            styleName="sm-regular"
            as="span"
            className="color-tiers-step"
            aria-hidden
          >
            1
          </Typography>
          <Typography
            group="text"
            styleName="sm-medium"
            as="span"
            className="color-tiers-tier-label"
          >
            Primitive
          </Typography>
          <ColorSwatchBadge
            label="brand-500"
            hex={TIERS_BRAND_HEX}
            placement="swatch-first"
          />
        </li>
        <li className="color-tiers-row">
          <Typography
            group="text"
            styleName="sm-regular"
            as="span"
            className="color-tiers-step"
            aria-hidden
          >
            2
          </Typography>
          <Typography
            group="text"
            styleName="sm-medium"
            as="span"
            className="color-tiers-tier-label"
          >
            Semantic
          </Typography>
          <ColorSwatchBadge
            label="bg-brand-primary"
            hex={TIERS_BRAND_HEX}
            placement="swatch-first"
          />
        </li>
        <li className="color-tiers-row color-tiers-row--component">
          <Typography
            group="text"
            styleName="sm-regular"
            as="span"
            className="color-tiers-step"
            aria-hidden
          >
            3
          </Typography>
          <Typography
            group="text"
            styleName="sm-medium"
            as="span"
            className="color-tiers-tier-label"
          >
            Component
          </Typography>
          <ColorSwatchBadge
            label="btn-bg-brand-primary"
            hex={TIERS_BRAND_HEX}
            placement="swatch-first"
          />
          <TiersArrowIcon className="color-tiers-arrow" />
          <button type="button" className="color-tiers-demo-button" tabIndex={-1}>
            <Typography group="text" styleName="sm-semibold" as="span">
              Button title
            </Typography>
          </button>
        </li>
      </ol>
    </div>
  );
}

/** ตัวอย่างระดับ WCAG บนพื้นแบรนด์ — Figma node 8543:7758 */
function ColorWcagLevelsDemo() {
  return (
    <div
      className="color-wcag-demo"
      role="group"
      aria-label="ตัวอย่างระดับ WCAG บนพื้นสีแบรนด์ AAA, AA และ A"
    >
      <div className="color-wcag-demo-box">
        <div className="color-wcag-demo-inner color-wcag-demo-inner--aaa">
          <Typography
            group="text"
            styleName="md-semibold"
            as="span"
            className="color-wcag-demo-line"
          >
            Level
          </Typography>
          <Typography
            group="text"
            styleName="md-semibold"
            as="span"
            className="color-wcag-demo-line"
          >
            AAA
          </Typography>
        </div>
      </div>
      <div className="color-wcag-demo-box">
        <div className="color-wcag-demo-inner color-wcag-demo-inner--aa">
          <Typography
            group="text"
            styleName="md-semibold"
            as="span"
            className="color-wcag-demo-line"
          >
            Level
          </Typography>
          <Typography
            group="text"
            styleName="md-semibold"
            as="span"
            className="color-wcag-demo-line"
          >
            AA
          </Typography>
        </div>
      </div>
      <div className="color-wcag-demo-box">
        <div className="color-wcag-demo-inner color-wcag-demo-inner--a">
          <Typography
            group="text"
            styleName="md-semibold"
            as="span"
            className="color-wcag-demo-line"
          >
            Level
          </Typography>
          <Typography
            group="text"
            styleName="md-semibold"
            as="span"
            className="color-wcag-demo-line"
          >
            A
          </Typography>
        </div>
      </div>
    </div>
  );
}

function normalizeHexKey(hex: string): string {
  return hex.replace(/^#/, "").toLowerCase();
}

/** พื้นโทนอ่อน: ใช้สีเบอร์ 700 ของสเกลเดียวกัน — พื้นโทนเข้ม: const white (และเมื่อ 700 บน 700 หรือไม่ถึง AA กับ 700 ให้ใช้ขาว) */
function paletteContrastForegroundHex(
  familyId: string,
  bgHex: string,
  stepLabel: string,
): string {
  const white = PALETTE_CONST_WHITE_HEX;
  const c700 =
    getPrimitiveScale700Hex(familyId) ?? PALETTE_ON_LIGHT_FALLBACK_HEX;

  if (!isOpaqueHex6(bgHex)) return white;
  if (stepLabel === "700") return white;

  const bgN = normalizeHexKey(bgHex);
  const c700N = normalizeHexKey(c700);
  if (bgN === c700N) return white;

  const cr = contrastRatio(bgHex, c700);
  if (cr != null && cr >= 4.5) return c700;
  return white;
}

function PaletteSwatchContrastLabel({
  bgHex,
  fgHex,
}: {
  bgHex: string;
  fgHex: string;
}) {
  if (!isOpaqueHex6(bgHex) || !isOpaqueHex6(fgHex)) {
    return (
      <span className="color-palette-swatch-contrast color-palette-na">
        <Typography group="text" styleName="xs-regular" as="span">
          โปร่ง
        </Typography>
      </span>
    );
  }
  const r = contrastRatio(bgHex, fgHex);
  if (r == null) {
    return (
      <span className="color-palette-swatch-contrast color-palette-na">
        <Typography group="text" styleName="xs-regular" as="span">
          —
        </Typography>
      </span>
    );
  }
  const lvl = wcagTextLevel(r);
  return (
    <span className="color-palette-swatch-contrast" style={{ color: fgHex }}>
      <Typography
        group="text"
        styleName="sm-medium"
        as="span"
        className="color-palette-swatch-contrast-lvl"
      >
        {lvl}
      </Typography>
      <Typography
        group="text"
        styleName="xs-regular"
        as="span"
        className="color-palette-swatch-contrast-ratio"
      >
        {formatContrastRatio(r)}:1
      </Typography>
    </span>
  );
}

const BASE_TOKEN_HINT = `1. Token = color/base/white-[5–100]
2. Token = color/base/black-[5–100]
3. Token = color/base/gray-[5–100]
เลขท้ายคือค่าความทึบแสง(%) [opacity] ไม่ใช่เบอร์สเกลสี`;

function ColorPaletteFamilySection({ family }: { family: PaletteFamily }) {
  const scaleHint =
    family.id === "base"
      ? BASE_TOKEN_HINT
      : family.id === "ams"
        ? "Token = color/ams/[เบอร์ 25–950]"
        : `Token = color/${family.id}/[เบอร์ 25–950]`;

  return (
    <div className="color-palette-family-block">
      <div className="color-doc-subsection-head">
        <Typography
          group="text"
          styleName="md-semibold"
          as="h3"
          className="color-doc-subsection-title"
        >
          {family.label}
        </Typography>
        {scaleHint ? (
          <Typography
            group="text"
            styleName="md-regular"
            as="p"
            className={
              family.id === "base"
                ? "color-doc-p color-doc-p--multiline-hint"
                : "color-doc-p"
            }
          >
            {scaleHint}
          </Typography>
        ) : null}
        {family.note ? (
          <Typography
            group="text"
            styleName="md-regular"
            as="p"
            className="color-doc-p color-doc-p--measure"
          >
            {family.note}
          </Typography>
        ) : null}
      </div>
      <div className="color-palette-row-wrap">
        <div
          className="color-palette-row"
          role="list"
          aria-label={`จานสี ${family.label}`}
        >
          {family.swatches.map((s) => {
            const fg = paletteContrastForegroundHex(
              family.id,
              s.hex,
              s.stepLabel,
            );
            const hexDisplay = s.hex.replace(/^#/i, "").toUpperCase();
            return (
              <div
                key={s.token}
                className="color-palette-swatch-card"
                role="listitem"
                title={s.token}
              >
                <div
                  className="color-palette-swatch-chip"
                  style={{ backgroundColor: s.hex }}
                >
                  <PaletteSwatchContrastLabel bgHex={s.hex} fgHex={fg} />
                </div>
                <div className="color-palette-swatch-meta">
                  <Typography
                    group="text"
                    styleName="sm-medium"
                    as="p"
                    className="color-palette-swatch-step"
                  >
                    {s.stepLabel}
                  </Typography>
                  <Typography
                    group="text"
                    styleName="xs-regular"
                    as="p"
                    className="color-palette-swatch-hex-row"
                  >
                    <span className="color-palette-swatch-hash">#</span>
                    <span className="color-palette-swatch-hex">{hexDisplay}</span>
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** ตัวอย่างสีในตาราง — ป้ายข้อความเป็นชั้น Primitive (path หรือค่าจากเอกสาร); HEX อยู่ใน title */
function ColorPrimitiveSampleBadge({
  primitiveTitle,
  hex,
  mode,
}: {
  primitiveTitle: string;
  hex: string | null;
  mode: "light" | "dark";
}) {
  const hexLabel = formatSwatchHexLabel(hex);
  const ref =
    primitiveTitle.trim() !== "" && primitiveTitle !== "—"
      ? primitiveTitle.trim()
      : null;
  const fromHex =
    hex != null && hex !== ""
      ? resolvePrimitivePathForOpaqueHex(hex, { mode, hintRef: ref })
      : null;
  const primitiveRaw = fromHex ?? ref ?? hexLabel;
  const primitiveLabel = formatPrimitiveBadgeLabel(primitiveRaw);
  const title =
    hex != null && hex !== ""
      ? fromHex
        ? `${hexLabel} · ${fromHex}`
        : ref
          ? `${hexLabel} · ${ref}`
          : hexLabel
      : ref ?? undefined;
  return (
    <ColorSwatchBadge
      label={primitiveLabel}
      hex={hex}
      surface={mode === "dark" ? "onDark" : "default"}
      placement="swatch-first"
      truncateLabel
      labelMono
      title={title}
      emptyHint={
        mode === "dark"
          ? "ยังไม่มีค่าโหมดมืดใน snapshot"
          : undefined
      }
    />
  );
}

function colorVarTokenTitle(row: VariableRow): string {
  if (row.figmaBadge) return row.figmaBadge;
  return formatColorTokenTitlePath(row.token);
}

function VariableTable({
  title,
  tableId,
  rows,
  showDetailColumn = true,
}: {
  title: string;
  tableId: string;
  rows: VariableRow[];
  /** ตาราง Color utility — ซ่อนคอลัมน์รายละเอียด (ข้อความซ้ำกันทุกแถว) */
  showDetailColumn?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="color-var-table-section" aria-labelledby={tableId}>
      <Typography
        group="text"
        styleName="lg-semibold"
        as="h3"
        className="color-var-section-title"
        id={tableId}
      >
        {title}
      </Typography>
      <div className="color-var-table-wrap">
        <table className="color-var-table">
          <thead>
            <tr>
              <th scope="col" className="color-var-order-cell">
                <span className="ds-type-table-header">ลำดับ</span>
              </th>
              <th scope="col">
                <span className="ds-type-table-header">ชื่อโทเค็น</span>
              </th>
              <th scope="col">
                <span className="ds-type-table-header">Light mode</span>
              </th>
              <th scope="col">
                <span className="ds-type-table-header">Dark mode</span>
              </th>
              {showDetailColumn ? (
                <th scope="col">
                  <span className="ds-type-table-header">รายละเอียด</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
                <tr key={row.token} className="color-var-table-row">
                  <td className="color-var-order-cell">
                    <Typography group="text" styleName="sm-regular" as="span">
                      {row.orderLabel}
                    </Typography>
                  </td>
                  <td className="color-var-name-cell">
                    <div className="color-var-name-cell-inner">
                      <Typography
                        group="text"
                        styleName="sm-medium"
                        as="p"
                        className="color-var-token-title"
                      >
                        {colorVarTokenTitle(row)}
                      </Typography>
                      <Typography
                        group="text"
                        styleName="sm-regular"
                        as="p"
                        className="color-var-token-path"
                      >
                        {row.token}
                      </Typography>
                    </div>
                  </td>
                  <td className="color-var-swatch-cell">
                    <div className="color-var-swatch-cell-inner">
                      <ColorPrimitiveSampleBadge
                        mode="light"
                        primitiveTitle={row.lightRef ?? ""}
                        hex={row.lightHex}
                      />
                    </div>
                  </td>
                  <td className="color-var-swatch-cell">
                    <div className="color-var-swatch-cell-inner">
                      <ColorPrimitiveSampleBadge
                        mode="dark"
                        primitiveTitle={row.darkRef ?? ""}
                        hex={row.darkHex}
                      />
                    </div>
                  </td>
                  {showDetailColumn ? (
                    <td className="color-var-detail">
                      <Typography group="text" styleName="sm-regular" as="div">
                        {row.detail}
                      </Typography>
                    </td>
                  ) : null}
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ColorPlayground() {
  const paletteFamilies = useMemo(() => buildPrimitivePaletteFamilies(), []);
  const mainColorRows = useMemo(() => buildMainColorVariableRows(), []);
  const utilityPaletteSections = useMemo(
    () => buildUtilityVariableRowsByPalette(),
    [],
  );

  return (
    <article className="doc-article">
      <DocPageHeader
        title="01 Color"
        lead={
          <>
            สรุปสีจาก Figma Variables — มีจานสีตั้งต้น คะแนนความต่างของสี (contrast)
            และตารางตัวแปรสีตามความหมายกับตัวแปรช่วยงาน
          </>
        }
      />

      <div className="doc-playground-bleed">
        <div className="color-page-column">
          {/* 1. Documentation */}
          <div className="playground-preview color-playground-preview--docs">
            <Typography
              group="text"
              styleName="md-semibold"
              as="div"
              className="playground-preview-label"
            >
              Documentation
            </Typography>
            <div className="playground-preview-pane color-doc-playground-pane">
              <div className="color-doc-pane-stack">
              <div className="color-doc-block color-doc-block--tiers">
                <Typography
                  group="text"
                  styleName="xl-bold"
                  as="h3"
                  className="color-doc-h3"
                >
                  ระดับชั้นของสี (Tiers Color)
                </Typography>
                <ColorTiersDiagram />
                <Typography
                  group="text"
                  styleName="md-regular"
                  as="p"
                  className="color-doc-p"
                >
                  <span className="color-doc-em">Raw Value</span> (ชั้นที่ 0) คือสีที่เขียนเป็นตัวเลขตรง ๆ เช่น{" "}
                  <code>#RRGGBB</code> หรือ RGB / HSL ยังไม่มีชื่อเรียกในระบบ
                  ใช้เป็นจุดเริ่มก่อนไปทำชุดสีเป็นขั้นบันไดหรือสีตามความหมาย
                </Typography>
                <Typography
                  group="text"
                  styleName="md-regular"
                  as="p"
                  className="color-doc-p"
                >
                  <span className="color-doc-em">Primitive colors</span> (ชั้นที่ 1) คือชุดสีตั้งต้นเป็นขั้น เช่น brand 25–950
                  ใน Figma — ยังไม่บอกว่าเอาไปใช้กับปุ่มหรือพื้นหลัง แค่เป็นพาเลตต์กลางของระบบ
                </Typography>
                <Typography
                  group="text"
                  styleName="md-regular"
                  as="p"
                  className="color-doc-p"
                >
                  <span className="color-doc-em">Semantic colors</span> (ชั้นที่ 2) ตั้งชื่อตามการใช้งาน เช่น พื้นหลังรอง ข้อความหลัก ขอบแจ้งเตือน
                  ผูกกับชื่อตัวแปรในระบบ เปลี่ยนธีมหรือโหมดสว่าง/มืดได้พร้อมกัน
                </Typography>
                <Typography
                  group="text"
                  styleName="md-regular"
                  as="p"
                  className="color-doc-p"
                >
                  <span className="color-doc-em">Component colors</span> (ชั้นที่ 3) ใช้เฉพาะกับคอมโพเนนต์ในไลบรารี เช่น สีพื้นปุ่ม สีสวิตช์
                  อิงจาก semantic หรือ primitive ตามดีไซน์ เวลาเปลี่ยนธีมแล้วคอมโพเนนต์ยังหน้าตาเหมือนกัน
                  บางทีมีสีพิเศษสำหรับงานเฉพาะ เช่น สีโปร่ง สีช่วยงาน (utility)
                </Typography>
              </div>
              <div className="color-doc-block color-doc-block--wcag">
                <Typography
                  group="text"
                  styleName="xl-bold"
                  as="h3"
                  className="color-doc-h3"
                >
                  มาตรฐานการเข้าถึงเว็บ WCAG (Web Content Accessibility Guidelines)
                </Typography>
                <Typography
                  group="text"
                  styleName="md-regular"
                  as="p"
                  className="color-doc-p"
                >
                  ใช้แนวทาง{" "}
                  <span className="color-doc-em">WCAG</span> เรื่องความต่างระหว่างตัวหนังสือกับพื้นหลัง
                  ในจานสีด้านล่างคำนวณเทียบกับพื้นขาวและพื้นดำเป็นตัวอย่าง
                </Typography>
                <ColorWcagLevelsDemo />
                <ul className="color-doc-list">
                  <li>
                    <Typography group="text" styleName="md-regular" as="div">
                      <span className="color-doc-em">Level AAA</span> — อัตราส่วนมากกว่า{" "}
                      <span className="color-doc-em">7:1</span> สำหรับตัวหนังสือธรรมดา อ่านชัดที่สุด
                    </Typography>
                  </li>
                  <li>
                    <Typography group="text" styleName="md-regular" as="div">
                      <span className="color-doc-em">Level AA</span> — อัตราส่วนมากกว่า{" "}
                      <span className="color-doc-em">4.5:1</span> ระดับที่นิยมใช้กับข้อความและองค์ประกอบทั่วไป
                    </Typography>
                  </li>
                  <li>
                    <Typography group="text" styleName="md-regular" as="div">
                      <span className="color-doc-em">Level A</span> — ต่ำกว่า 4.5:1 เหมาะแค่ของตกแต่ง
                      ไม่ควรใช้กับข้อความสำคัญหรือปุ่มที่ต้องกด
                    </Typography>
                  </li>
                </ul>
                <Typography
                  group="text"
                  styleName="md-regular"
                  as="p"
                  className="color-doc-p"
                >
                  ควรเช็กซ้ำด้วยปลั๊กอิน{" "}
                  <span className="color-doc-em">A11y — Color Contrast Checker</span> ใน Figma กับสีจริงบนหน้าจอ
                </Typography>
              </div>
              <div className="color-doc-block">
                <Typography
                  group="text"
                  styleName="xl-bold"
                  as="h3"
                  className="color-doc-h3"
                >
                  การตั้งชื่อตัวแปรสี
                </Typography>
                <Typography
                  group="text"
                  styleName="md-regular"
                  as="p"
                  className="color-doc-p"
                >
                  ยึดแนวทางจากบทความ{" "}
                  <span className="color-doc-em">Naming Tokens in Design Systems</span> (EightShapes / Nathan Curtis)
                  เพื่อให้ทีมเรียกชื่อสิ่งเดียวกันใน Figma เอกสาร และโค้ด
                  เขียนตัวพิมพ์เล็ก คั่นแต่ละชั้นด้วยขีดกลาง (<code>-</code>) เป็น kebab-case แล้วต่อคำนำหน้าระบบแบบ Style Dictionary
                  เช่น <code>ntgds-color-…</code> ตามที่ทีมตกลงตอน build
                </Typography>

                <div className="color-doc-naming-subsections">
                  <section
                    className="color-doc-subsection"
                    aria-labelledby="color-doc-heading-namespace"
                  >
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-namespace">
                        Namespace
                      </Typography>
                      <Typography
                        group="text"
                        styleName="sm-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        บอกว่าโทเค็นนี้ใช้กับระบบไหน ธีมไหน หรืองานประเภทไหน
                      </Typography>
                    </div>
                    <ul className="color-doc-list">
                      <ColorDocListItem>
                        <span className="color-doc-em">System</span> — ชื่อหรือชื่อย่อของ design system (เช่น MDS,
                        Orbit, NTGds)
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Theme</span> — ลุคแบรนด์หรือโหมดสว่าง/มืด (เช่น beauty, kids, light,
                        dark)
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Domain</span> — กลุ่มผู้ใช้หรือประเภทธุรกิจ (เช่น retail, consumer,
                        business, public, partner, internal)
                      </ColorDocListItem>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-object">
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-object">
                        Object
                      </Typography>
                      <Typography
                        group="text"
                        styleName="sm-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        บอกว่าใช้กับส่วนหน้าจอระดับไหน
                      </Typography>
                    </div>
                    <ul className="color-doc-list">
                      <ColorDocListItem>
                        <span className="color-doc-em">Group</span> — กลุ่มคอมโพเนนต์ (เช่น forms)
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Component</span> — คอมโพเนนต์ชิ้นเดียว (เช่น input, button, link)
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Element</span> — ชิ้นย่อยในคอมโพเนนต์ (เช่น{" "}
                        <code>left-icon</code>) มักใช้เฉพาะในคอมโพเนนต์นั้น
                      </ColorDocListItem>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-base">
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-base">
                        Base
                      </Typography>
                      <Typography
                        group="text"
                        styleName="sm-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        บอกว่าเป็นโทเค็นประเภทไหน และหมายถึงส่วนไหนของหน้าตา
                      </Typography>
                    </div>
                    <ul className="color-doc-list">
                      <ColorDocListItem>
                        <span className="color-doc-em">Category</span> — ชนิดโทเค็น (เช่น color, space, font, size,
                        elevation, shadow, breakpoints, touch, time)
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Concept</span> — กลุ่มความหมาย (เช่น visualization, action,
                        feedback, inset, semantic, commerce, heading, body, lead)
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Sub-concept</span> — แยกลึกลงไปใน concept (เช่น correlation ภายใต้
                        visualization)
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Property</span> — ส่วนที่ลงสีหรือจัดสไตล์ (เช่น background, border,
                        text, fill, size, weight, letter-spacing)
                      </ColorDocListItem>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-modifier">
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-modifier">
                        Modifier
                      </Typography>
                      <Typography
                        group="text"
                        styleName="sm-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        บอกความต่าง เช่น แบบไหน สถานะไหน ขนาดไหน หรือแสดงบนพื้นอะไร
                      </Typography>
                    </div>
                    <ul className="color-doc-list">
                      <ColorDocListItem>
                        <span className="color-doc-em">Variant</span> — เช่น primary, secondary, tertiary, success, error,
                        information, warning, new, fixed-income
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">State</span> — เช่น default, hover, press/active, focus, disabled,
                        visited, error
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Scale</span> — เช่น <code>1x</code> เลข 1–3, half/quarter, S/M/L,
                        ขั้น 10/100/200 หรือใส่เลขขนาดเฉพาะ เช่น <code>size-40</code>, <code>size-64</code>
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Mode</span> — ใช้บนพื้นเข้มหรือพื้นอ่อน เช่น{" "}
                        <code>on-dark</code>, <code>on-light</code>
                      </ColorDocListItem>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-notes">
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-notes">
                        หมายเหตุสำคัญ
                      </Typography>
                    </div>
                    <ul className="color-doc-list">
                      <ColorDocListItem>
                        <span className="color-doc-em">State</span> (hover, focus ฯลฯ) มักใช้กับของที่กดหรือโต้ตอบได้
                        เช่น ปุ่ม ลิงก์
                      </ColorDocListItem>
                      <ColorDocListItem>
                        <span className="color-doc-em">Variant</span> (success, error ฯลฯ) บอกว่าข้อความหรือบล็อกนี้หมายถึงอะไร
                      </ColorDocListItem>
                      <ColorDocListItem>
                        กับสีส่วนใหญ่ <span className="color-doc-em">Category</span> จะเป็น <code>color</code> แล้วใช้{" "}
                        <span className="color-doc-em">Concept</span> กับ <span className="color-doc-em">Property</span>{" "}
                        บอกว่าเป็นสีกลุ่มไหนและลงที่ส่วนไหน
                      </ColorDocListItem>
                      <ColorDocListItem>
                        ถ้าต้องแยกค่าชัด ๆ ระหว่างโหมดมืดกับสว่าง ให้ใส่{" "}
                        <span className="color-doc-em">Mode</span> ท้ายชื่อ
                      </ColorDocListItem>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-ex1">
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-ex1">
                        ตัวอย่างที่ 1 — พื้นหลังแจ้งเตือนแบบ error
                      </Typography>
                      <Typography
                        group="text"
                        styleName="md-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        <code>ntgds-color-background-system-error-primary</code>
                      </Typography>
                    </div>
                    <ul className="color-doc-example-breakdown">
                      <ColorDocExampleLi>
                        <code>ntgds</code> — System (Namespace)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>color</code> — Category (Base)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>background</code> — Concept (Base)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>system</code> — Sub-concept (Base)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>error-primary</code> — Variant (Modifier)
                      </ColorDocExampleLi>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-ex2">
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-ex2">
                        ตัวอย่างที่ 2 — พื้นหลังปุ่มแบรนด์ primary
                      </Typography>
                      <Typography
                        group="text"
                        styleName="md-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        <code>ntgds-color-button-background-brand-primary</code>
                      </Typography>
                    </div>
                    <ul className="color-doc-example-breakdown">
                      <ColorDocExampleLi>
                        <code>ntgds</code> — System (Namespace)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>color</code> — Category (Base)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>button</code> — Component (Object)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>background</code> — Property (Base)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>brand</code> — Concept (Base)
                      </ColorDocExampleLi>
                      <ColorDocExampleLi>
                        <code>primary</code> — Variant (Modifier)
                      </ColorDocExampleLi>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-ex-more">
                    <div className="color-doc-subsection-head">
                      <Typography
                        group="text"
                        styleName="md-semibold"
                        as="h4"
                        className="color-doc-subsection-title"
                        id="color-doc-heading-ex-more">
                        ตัวอย่างชื่อสีอื่น ๆ
                      </Typography>
                      <Typography
                        group="text"
                        styleName="md-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        Semantic: <code>color-background-brand-primary</code>,{" "}
                        <code>color-text-primary-default</code>
                      </Typography>
                      <Typography
                        group="text"
                        styleName="md-regular"
                        as="p"
                        className="color-doc-p"
                      >
                        Primitive: <code>color-blue-500</code>, <code>color-gray-light-100</code>
                      </Typography>
                    </div>
                  </section>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* 2. Color palette */}
          <div className="playground-preview">
            <Typography
              group="text"
              styleName="md-semibold"
              as="div"
              className="playground-preview-label"
            >
              Color palette
            </Typography>
            <div className="playground-preview-pane color-palette-pane">
              <Typography
                group="text"
                styleName="md-regular"
                as="p"
                className="color-doc-p color-doc-p--measure"
              >
                ดึงค่า <span className="color-doc-em">primitive/color</span> จาก Figma Variables ตาม snapshot
                แสดงเป็นพาเลตแนวนอนแบบการ์ดต่อเบอร์สี แต่ละชิปแสดง{" "}
                <span className="color-doc-em">Hex</span> และระดับ WCAG ของข้อความบนพื้นสีนั้น
                — ไม่รวมกลุ่ม <span className="color-doc-em">alpha</span> /{" "}
                <span className="color-doc-em">effect</span> และไม่แสดงสีโปร่ง (เช่น{" "}
                <code>rgba</code>) ในพาเลตนี้ โดยบนพื้นโทนอ่อนใช้สีตัวอักษรเบอร์{" "}
                <span className="color-doc-em">700</span> ของสเกลเดียวกัน บนพื้นโทนเข้มใช้{" "}
                <span className="color-doc-em">สีขาวคงที่</span> (
                <code>color/base/white-100</code>)
              </Typography>
              {paletteFamilies.map((family) => (
                <ColorPaletteFamilySection key={family.id} family={family} />
              ))}
            </div>
          </div>

          {/* 3. Color variables */}
          <div className="playground-preview">
            <Typography
              group="text"
              styleName="md-semibold"
              as="div"
              className="playground-preview-label"
            >
              Color variables
            </Typography>
            <div className="playground-preview-pane color-playground-pane-stack">
              <Typography
                group="text"
                styleName="md-regular"
                as="p"
                className="color-doc-p color-doc-p--measure"
              >
                สี่ประเภทหลักตามเอกสาร Figma: Text, Border, Foreground (ไอคอน/พื้นหน้า),
                Background — ป้ายสวอชแสดงชื่อ primitive แบบย่อ (เช่น <code>gray-light-900</code> จาก{" "}
                <code>color/gray-light/900</code>) ตามสีที่ resolve จาก{" "}
                <code>FIGMA_SEMANTIC_HEX</code> / <code>FIGMA_DARK_HEX</code>{" "}
                (เอาเมาส์ชี้เพื่อดู hex และ path เต็ม) — เฉพาะแถวที่สีทึบทั้งสองโหมดเมื่อมีค่าโหมดมืด
              </Typography>
              {MAIN_COLOR_CATEGORY_ORDER.map((cat: MainColorCategory) => (
                <VariableTable
                  key={cat}
                  tableId={`color-var-${cat}`}
                  title={MAIN_CATEGORY_LABELS_TH[cat]}
                  rows={mainColorRows[cat]}
                />
              ))}
            </div>
          </div>

          {/* 4. Color utility variables */}
          <div className="playground-preview">
            <Typography
              group="text"
              styleName="md-semibold"
              as="div"
              className="playground-preview-label"
            >
              Color utility variables
            </Typography>
            <div className="playground-preview-pane color-playground-pane-stack">
              <Typography
                group="text"
                styleName="md-regular"
                as="p"
                className="color-doc-p color-doc-p--measure"
              >
                Utility Variable ตัวแปรอเนกประสงค์ ถูกออกแบบมาให้เป็น
                &quot;หน่วยย่อยที่สุด (Atomic)&quot; ไม่ยึดติดกับชิ้นส่วนใดๆ
                มีความอเนกประสงค์สูง ยกตัวอย่างเช่น Badge Status
                ที่มีสถานะเยอะมากจน Color Variable ไม่เพียงพอก็สามารถใช้ Utility
                Variable มาช่วยได้
              </Typography>
              {utilityPaletteSections.map((sec) => (
                <VariableTable
                  key={sec.paletteId}
                  tableId={`color-var-utility-${sec.paletteId.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
                  title={sec.title}
                  rows={sec.rows}
                  showDetailColumn={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
