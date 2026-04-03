import { useMemo } from "react";
import {
  buildPrimitivePaletteFamilies,
  buildUtilityVariableRows,
  buildVariableRowsByCategory,
  CATEGORY_LABELS,
  getPrimitiveScale700Hex,
  PALETTE_CONST_WHITE_HEX,
  PALETTE_ON_LIGHT_FALLBACK_HEX,
  type PaletteFamily,
  type SemanticCategory,
  type VariableRow,
} from "./figmaColorTokens";
import {
  contrastRatio,
  formatContrastRatio,
  wcagTextLevel,
} from "../../utils/wcagContrast";
import "../../site/PlaygroundShell.css";
import "./ColorPlayground.css";

const CATEGORY_ORDER: SemanticCategory[] = [
  "font",
  "border",
  "foreground",
  "background",
];

function isOpaqueHex6(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex.trim());
}

const TIERS_BRAND_HEX = "#1E58F2";

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
          <span className="color-tiers-step" aria-hidden>
            0
          </span>
          <span className="color-tiers-tier-label">Raw Value</span>
          <span className="color-tiers-pill">
            <span className="color-tiers-swatch-ring">
              <span
                className="color-tiers-swatch"
                style={{ backgroundColor: TIERS_BRAND_HEX }}
              />
            </span>
            <span className="color-tiers-pill-value">#1E58F2</span>
          </span>
        </li>
        <li className="color-tiers-row">
          <span className="color-tiers-step" aria-hidden>
            1
          </span>
          <span className="color-tiers-tier-label">Primitive</span>
          <span className="color-tiers-pill">
            <span className="color-tiers-swatch-ring">
              <span
                className="color-tiers-swatch"
                style={{ backgroundColor: TIERS_BRAND_HEX }}
              />
            </span>
            <span className="color-tiers-pill-value">brand-500</span>
          </span>
        </li>
        <li className="color-tiers-row">
          <span className="color-tiers-step" aria-hidden>
            2
          </span>
          <span className="color-tiers-tier-label">Semantic</span>
          <span className="color-tiers-pill">
            <span className="color-tiers-swatch-ring">
              <span
                className="color-tiers-swatch"
                style={{ backgroundColor: TIERS_BRAND_HEX }}
              />
            </span>
            <span className="color-tiers-pill-value">bg-brand-primary</span>
          </span>
        </li>
        <li className="color-tiers-row color-tiers-row--component">
          <span className="color-tiers-step" aria-hidden>
            3
          </span>
          <span className="color-tiers-tier-label">Component</span>
          <span className="color-tiers-pill">
            <span className="color-tiers-swatch-ring">
              <span
                className="color-tiers-swatch"
                style={{ backgroundColor: TIERS_BRAND_HEX }}
              />
            </span>
            <span className="color-tiers-pill-value">btn-bg-brand-primary</span>
          </span>
          <TiersArrowIcon className="color-tiers-arrow" />
          <button type="button" className="color-tiers-demo-button" tabIndex={-1}>
            Button title
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
          <span className="color-wcag-demo-line">Level</span>
          <span className="color-wcag-demo-line">AAA</span>
        </div>
      </div>
      <div className="color-wcag-demo-box">
        <div className="color-wcag-demo-inner color-wcag-demo-inner--aa">
          <span className="color-wcag-demo-line">Level</span>
          <span className="color-wcag-demo-line">AA</span>
        </div>
      </div>
      <div className="color-wcag-demo-box">
        <div className="color-wcag-demo-inner color-wcag-demo-inner--a">
          <span className="color-wcag-demo-line">Level</span>
          <span className="color-wcag-demo-line">A</span>
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
      <span className="color-palette-swatch-contrast color-palette-na">โปร่ง</span>
    );
  }
  const r = contrastRatio(bgHex, fgHex);
  if (r == null) {
    return <span className="color-palette-swatch-contrast color-palette-na">—</span>;
  }
  const lvl = wcagTextLevel(r);
  return (
    <span className="color-palette-swatch-contrast" style={{ color: fgHex }}>
      <span className="color-palette-swatch-contrast-lvl">{lvl}</span>
      <span className="color-palette-swatch-contrast-ratio">
        {formatContrastRatio(r)}:1
      </span>
    </span>
  );
}

function ColorPaletteFamilySection({ family }: { family: PaletteFamily }) {
  const scaleHint =
    family.id === "ams" || family.id === "base"
      ? null
      : `Token = color/${family.id}/[เบอร์ 25–950]`;

  return (
    <div className="color-palette-family-block">
      <div className="color-doc-subsection-head">
        <h3 className="color-doc-subsection-title">{family.label}</h3>
        {scaleHint ? <p className="color-doc-p">{scaleHint}</p> : null}
        {family.note ? (
          <p className="color-doc-p color-doc-p--measure">{family.note}</p>
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
                  <p className="color-palette-swatch-step">{s.stepLabel}</p>
                  <p className="color-palette-swatch-hex-row">
                    <span className="color-palette-swatch-hash">#</span>
                    <span className="color-palette-swatch-hex">{hexDisplay}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VariableTable({
  title,
  tableId,
  rows,
}: {
  title: string;
  tableId: string;
  rows: VariableRow[];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="color-var-table-section" aria-labelledby={tableId}>
      <h3 className="color-var-section-title" id={tableId}>
        {title}
      </h3>
      <div className="color-var-table-wrap">
        <table className="color-var-table">
          <thead>
            <tr>
              <th scope="col" className="num">
                #
              </th>
              <th scope="col">ชื่อโทเค็น</th>
              <th scope="col">ตัวอย่าง</th>
              <th scope="col">โหมดสว่าง</th>
              <th scope="col">โหมดมืด</th>
              <th scope="col">รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.token}>
                <td className="num">{row.order}</td>
                <td className="color-var-table-token">{row.token}</td>
                <td>
                  <div className="color-var-sample">
                    <div
                      className="color-var-sample-swatch"
                      style={{ backgroundColor: row.lightHex }}
                      title={`สว่าง: ${row.lightHex}`}
                    />
                    {row.darkHex ? (
                      <div
                        className="color-var-sample-swatch"
                        style={{ backgroundColor: row.darkHex }}
                        title={`มืด: ${row.darkHex}`}
                      />
                    ) : null}
                  </div>
                </td>
                <td>
                  <span className="color-var-hex">{row.lightHex}</span>
                </td>
                <td>
                  {row.darkHex ? (
                    <span className="color-var-hex">{row.darkHex}</span>
                  ) : (
                    <span className="color-var-dash" title="กำหนดค่าโหมดมืดในแหล่งข้อมูลตัวแปร">
                      —
                    </span>
                  )}
                </td>
                <td className="color-var-detail">{row.detail}</td>
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
  const rowsByCat = useMemo(() => buildVariableRowsByCategory(), []);
  const utilityRows = useMemo(() => buildUtilityVariableRows(), []);

  return (
    <article className="doc-article">
      <header className="doc-header">
        <h1 className="doc-title">01 Color</h1>
        <p className="doc-lead">
          สรุปสีจาก Figma Variables — มีจานสีตั้งต้น คะแนนความต่างของสี (contrast)
          และตารางตัวแปรสีตามความหมายกับตัวแปรช่วยงาน
        </p>
      </header>

      <div className="doc-playground-bleed">
        <div className="color-page-column">
          {/* 1. Documentation */}
          <div className="playground-preview color-playground-preview--docs">
            <div className="playground-preview-label">Documentation</div>
            <div className="playground-preview-pane color-doc-playground-pane">
              <div className="color-doc-pane-stack">
              <div className="color-doc-block color-doc-block--tiers">
                <h3 className="color-doc-h3">ระดับชั้นของสี (Tiers Color)</h3>
                <ColorTiersDiagram />
                <p className="color-doc-p">
                  <span className="color-doc-em">Raw Value</span> (ชั้นที่ 0) คือสีที่เขียนเป็นตัวเลขตรง ๆ เช่น{" "}
                  <code>#RRGGBB</code> หรือ RGB / HSL ยังไม่มีชื่อเรียกในระบบ
                  ใช้เป็นจุดเริ่มก่อนไปทำชุดสีเป็นขั้นบันไดหรือสีตามความหมาย
                </p>
                <p className="color-doc-p">
                  <span className="color-doc-em">Primitive colors</span> (ชั้นที่ 1) คือชุดสีตั้งต้นเป็นขั้น เช่น brand 25–950
                  ใน Figma — ยังไม่บอกว่าเอาไปใช้กับปุ่มหรือพื้นหลัง แค่เป็นพาเลตต์กลางของระบบ
                </p>
                <p className="color-doc-p">
                  <span className="color-doc-em">Semantic colors</span> (ชั้นที่ 2) ตั้งชื่อตามการใช้งาน เช่น พื้นหลังรอง ข้อความหลัก ขอบแจ้งเตือน
                  ผูกกับชื่อตัวแปรในระบบ เปลี่ยนธีมหรือโหมดสว่าง/มืดได้พร้อมกัน
                </p>
                <p className="color-doc-p">
                  <span className="color-doc-em">Component colors</span> (ชั้นที่ 3) ใช้เฉพาะกับคอมโพเนนต์ในไลบรารี เช่น สีพื้นปุ่ม สีสวิตช์
                  อิงจาก semantic หรือ primitive ตามดีไซน์ เวลาเปลี่ยนธีมแล้วคอมโพเนนต์ยังหน้าตาเหมือนกัน
                  บางทีมีสีพิเศษสำหรับงานเฉพาะ เช่น สีโปร่ง สีช่วยงาน (utility)
                </p>
              </div>
              <div className="color-doc-block color-doc-block--wcag">
                <h3 className="color-doc-h3">
                  มาตรฐานการเข้าถึงเว็บ WCAG (Web Content Accessibility Guidelines)
                </h3>
                <p className="color-doc-p">
                  ใช้แนวทาง{" "}
                  <span className="color-doc-em">WCAG</span> เรื่องความต่างระหว่างตัวหนังสือกับพื้นหลัง
                  ในจานสีด้านล่างคำนวณเทียบกับพื้นขาวและพื้นดำเป็นตัวอย่าง
                </p>
                <ColorWcagLevelsDemo />
                <ul className="color-doc-list">
                  <li>
                    <span className="color-doc-em">Level AAA</span> — อัตราส่วนมากกว่า{" "}
                    <span className="color-doc-em">7:1</span> สำหรับตัวหนังสือธรรมดา อ่านชัดที่สุด
                  </li>
                  <li>
                    <span className="color-doc-em">Level AA</span> — อัตราส่วนมากกว่า{" "}
                    <span className="color-doc-em">4.5:1</span> ระดับที่นิยมใช้กับข้อความและองค์ประกอบทั่วไป
                  </li>
                  <li>
                    <span className="color-doc-em">Level A</span> — ต่ำกว่า 4.5:1 เหมาะแค่ของตกแต่ง
                    ไม่ควรใช้กับข้อความสำคัญหรือปุ่มที่ต้องกด
                  </li>
                </ul>
                <p className="color-doc-p">
                  ควรเช็กซ้ำด้วยปลั๊กอิน{" "}
                  <span className="color-doc-em">A11y — Color Contrast Checker</span> ใน Figma กับสีจริงบนหน้าจอ
                </p>
              </div>
              <div className="color-doc-block">
                <h3 className="color-doc-h3">การตั้งชื่อตัวแปรสี</h3>
                <p className="color-doc-p">
                  ยึดแนวทางจากบทความ{" "}
                  <span className="color-doc-em">Naming Tokens in Design Systems</span> (EightShapes / Nathan Curtis)
                  เพื่อให้ทีมเรียกชื่อสิ่งเดียวกันใน Figma เอกสาร และโค้ด
                  เขียนตัวพิมพ์เล็ก คั่นแต่ละชั้นด้วยขีดกลาง (<code>-</code>) เป็น kebab-case แล้วต่อคำนำหน้าระบบแบบ Style Dictionary
                  เช่น <code>ntgds-color-…</code> ตามที่ทีมตกลงตอน build
                </p>

                <div className="color-doc-naming-subsections">
                  <section
                    className="color-doc-subsection"
                    aria-labelledby="color-doc-heading-namespace"
                  >
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-namespace">
                        Namespace
                      </h4>
                      <p className="color-doc-p">
                        บอกว่าโทเค็นนี้ใช้กับระบบไหน ธีมไหน หรืองานประเภทไหน
                      </p>
                    </div>
                    <ul className="color-doc-list">
                      <li>
                        <span className="color-doc-em">System</span> — ชื่อหรือชื่อย่อของ design system (เช่น MDS,
                        Orbit, NTGds)
                      </li>
                      <li>
                        <span className="color-doc-em">Theme</span> — ลุคแบรนด์หรือโหมดสว่าง/มืด (เช่น beauty, kids, light,
                        dark)
                      </li>
                      <li>
                        <span className="color-doc-em">Domain</span> — กลุ่มผู้ใช้หรือประเภทธุรกิจ (เช่น retail, consumer,
                        business, public, partner, internal)
                      </li>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-object">
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-object">
                        Object
                      </h4>
                      <p className="color-doc-p">บอกว่าใช้กับส่วนหน้าจอระดับไหน</p>
                    </div>
                    <ul className="color-doc-list">
                      <li>
                        <span className="color-doc-em">Group</span> — กลุ่มคอมโพเนนต์ (เช่น forms)
                      </li>
                      <li>
                        <span className="color-doc-em">Component</span> — คอมโพเนนต์ชิ้นเดียว (เช่น input, button, link)
                      </li>
                      <li>
                        <span className="color-doc-em">Element</span> — ชิ้นย่อยในคอมโพเนนต์ (เช่น{" "}
                        <code>left-icon</code>) มักใช้เฉพาะในคอมโพเนนต์นั้น
                      </li>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-base">
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-base">
                        Base
                      </h4>
                      <p className="color-doc-p">บอกว่าเป็นโทเค็นประเภทไหน และหมายถึงส่วนไหนของหน้าตา</p>
                    </div>
                    <ul className="color-doc-list">
                      <li>
                        <span className="color-doc-em">Category</span> — ชนิดโทเค็น (เช่น color, space, font, size,
                        elevation, shadow, breakpoints, touch, time)
                      </li>
                      <li>
                        <span className="color-doc-em">Concept</span> — กลุ่มความหมาย (เช่น visualization, action,
                        feedback, inset, semantic, commerce, heading, body, lead)
                      </li>
                      <li>
                        <span className="color-doc-em">Sub-concept</span> — แยกลึกลงไปใน concept (เช่น correlation ภายใต้
                        visualization)
                      </li>
                      <li>
                        <span className="color-doc-em">Property</span> — ส่วนที่ลงสีหรือจัดสไตล์ (เช่น background, border,
                        text, fill, size, weight, letter-spacing)
                      </li>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-modifier">
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-modifier">
                        Modifier
                      </h4>
                      <p className="color-doc-p">บอกความต่าง เช่น แบบไหน สถานะไหน ขนาดไหน หรือแสดงบนพื้นอะไร</p>
                    </div>
                    <ul className="color-doc-list">
                      <li>
                        <span className="color-doc-em">Variant</span> — เช่น primary, secondary, tertiary, success, error,
                        information, warning, new, fixed-income
                      </li>
                      <li>
                        <span className="color-doc-em">State</span> — เช่น default, hover, press/active, focus, disabled,
                        visited, error
                      </li>
                      <li>
                        <span className="color-doc-em">Scale</span> — เช่น <code>1x</code> เลข 1–3, half/quarter, S/M/L,
                        ขั้น 10/100/200 หรือใส่เลขขนาดเฉพาะ เช่น <code>size-40</code>, <code>size-64</code>
                      </li>
                      <li>
                        <span className="color-doc-em">Mode</span> — ใช้บนพื้นเข้มหรือพื้นอ่อน เช่น{" "}
                        <code>on-dark</code>, <code>on-light</code>
                      </li>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-notes">
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-notes">
                        หมายเหตุสำคัญ
                      </h4>
                    </div>
                    <ul className="color-doc-list">
                      <li>
                        <span className="color-doc-em">State</span> (hover, focus ฯลฯ) มักใช้กับของที่กดหรือโต้ตอบได้
                        เช่น ปุ่ม ลิงก์
                      </li>
                      <li>
                        <span className="color-doc-em">Variant</span> (success, error ฯลฯ) บอกว่าข้อความหรือบล็อกนี้หมายถึงอะไร
                      </li>
                      <li>
                        กับสีส่วนใหญ่ <span className="color-doc-em">Category</span> จะเป็น <code>color</code> แล้วใช้{" "}
                        <span className="color-doc-em">Concept</span> กับ <span className="color-doc-em">Property</span>{" "}
                        บอกว่าเป็นสีกลุ่มไหนและลงที่ส่วนไหน
                      </li>
                      <li>
                        ถ้าต้องแยกค่าชัด ๆ ระหว่างโหมดมืดกับสว่าง ให้ใส่{" "}
                        <span className="color-doc-em">Mode</span> ท้ายชื่อ
                      </li>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-ex1">
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-ex1">
                        ตัวอย่างที่ 1 — พื้นหลังแจ้งเตือนแบบ error
                      </h4>
                      <p className="color-doc-p">
                        <code>ntgds-color-background-system-error-primary</code>
                      </p>
                    </div>
                    <ul className="color-doc-example-breakdown">
                      <li>
                        <code>ntgds</code> — System (Namespace)
                      </li>
                      <li>
                        <code>color</code> — Category (Base)
                      </li>
                      <li>
                        <code>background</code> — Concept (Base)
                      </li>
                      <li>
                        <code>system</code> — Sub-concept (Base)
                      </li>
                      <li>
                        <code>error-primary</code> — Variant (Modifier)
                      </li>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-ex2">
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-ex2">
                        ตัวอย่างที่ 2 — พื้นหลังปุ่มแบรนด์ primary
                      </h4>
                      <p className="color-doc-p">
                        <code>ntgds-color-button-background-brand-primary</code>
                      </p>
                    </div>
                    <ul className="color-doc-example-breakdown">
                      <li>
                        <code>ntgds</code> — System (Namespace)
                      </li>
                      <li>
                        <code>color</code> — Category (Base)
                      </li>
                      <li>
                        <code>button</code> — Component (Object)
                      </li>
                      <li>
                        <code>background</code> — Property (Base)
                      </li>
                      <li>
                        <code>brand</code> — Concept (Base)
                      </li>
                      <li>
                        <code>primary</code> — Variant (Modifier)
                      </li>
                    </ul>
                  </section>

                  <section className="color-doc-subsection" aria-labelledby="color-doc-heading-ex-more">
                    <div className="color-doc-subsection-head">
                      <h4 className="color-doc-subsection-title" id="color-doc-heading-ex-more">
                        ตัวอย่างชื่อสีอื่น ๆ
                      </h4>
                      <p className="color-doc-p">
                        Semantic: <code>color-background-brand-primary</code>,{" "}
                        <code>color-text-primary-default</code>
                      </p>
                      <p className="color-doc-p">
                        Primitive: <code>color-blue-500</code>, <code>color-gray-light-100</code>
                      </p>
                    </div>
                  </section>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* 2. Color palette */}
          <div className="playground-preview">
            <div className="playground-preview-label">Color palette</div>
            <div className="playground-preview-pane color-palette-pane">
              <p className="color-doc-p color-doc-p--measure">
                ดึงค่า <span className="color-doc-em">primitive/color</span> จาก Figma Variables ตาม snapshot
                แสดงเป็นพาเลตแนวนอนแบบการ์ดต่อเบอร์สี แต่ละชิปแสดง{" "}
                <span className="color-doc-em">Hex</span> และระดับ WCAG ของข้อความบนพื้นสีนั้น
                โดยบนพื้นโทนอ่อนใช้สีตัวอักษรเบอร์{" "}
                <span className="color-doc-em">700</span> ของสเกลเดียวกัน บนพื้นโทนเข้มใช้{" "}
                <span className="color-doc-em">const white</span> (
                <code>color/component/background/general/const-white</code>)
              </p>
              {paletteFamilies.map((family) => (
                <ColorPaletteFamilySection key={family.id} family={family} />
              ))}
            </div>
          </div>

          {/* 3. Color variables */}
          <div className="playground-preview">
            <div className="playground-preview-label">Color variables</div>
            <div className="playground-preview-pane color-playground-pane-stack">
              <p className="color-doc-p color-doc-p--measure">
                ตัวแปรสีกลุ่มนี้ใช้กับการเติมสี เส้นขอบ หรือตัวหนังสือได้
                แต่ละแถวมีชื่อโทเค็น ตัวอย่างสี ค่าโหมดสว่างจาก snapshot และโหมดมืด (ถ้ามีในไฟล์ข้อมูล)
              </p>
              {CATEGORY_ORDER.map((cat) => (
                <VariableTable
                  key={cat}
                  tableId={`color-var-${cat}`}
                  title={CATEGORY_LABELS[cat]}
                  rows={rowsByCat[cat]}
                />
              ))}
              <p className="color-var-footnote">
                ถ้าโหมดมืดขึ้นเป็น &quot;—&quot; ให้ไปอัปเดตค่าในแหล่งตัวแปรก่อน
                แล้วปรับ <code>FIGMA_DARK_HEX</code> ในโค้ดให้ตรงกัน
              </p>
            </div>
          </div>

          {/* 4. Color utility variables */}
          <div className="playground-preview">
            <div className="playground-preview-label">Color utility variables</div>
            <div className="playground-preview-pane color-playground-pane-stack">
              <p className="color-doc-p color-doc-p--measure">
                ตัวแปรเสริม: <span className="color-doc-em">สีโปร่ง (อัลฟา)</span> ใช้ทับบนขาวหรือดำให้โปร่งพอดีทั้งโหมดสว่างและมืด
                และ <span className="color-doc-em">สีช่วยงาน (utility)</span> สำหรับคอมโพเนนต์ที่มีหลายสี (เช่น ป้าย badges) รวมชุด AMS
              </p>
              <VariableTable
                tableId="color-var-utility"
                title="Utility (alpha · AMS · effects)"
                rows={utilityRows}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
