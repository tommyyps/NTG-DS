import type { ElementType } from "react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Typography, dsTokens } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { DocPageHeader } from "../../site/DocPageHeader";
import "../../site/PlaygroundShell.css";
import "./TypographyPlayground.css";

const WEIGHTS = ["bold", "semibold", "medium", "regular"] as const;
type Weight = (typeof WEIGHTS)[number];

const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const BODY_SIZES = ["xl", "lg", "md", "sm", "xs"] as const;

const WEIGHT_LABELS: Record<Weight, string> = {
  bold: "Bold (700)",
  semibold: "Semibold (600)",
  medium: "Medium (500)",
  regular: "Regular (400)",
};

/** เนื้อหาจำลองในแถวสเปซิเมนต์ — แยกตามกลุ่ม Typography */
function specimenSampleForGroup(
  group: "heading" | "text" | "article",
): ReactNode {
  if (group === "heading") {
    return (
      <>
        Heading Text
        <br />
        หัวข้อจำลองภาษาไทย
      </>
    );
  }
  if (group === "text") {
    return (
      <>
        A wizard&apos;s job is to vex chumps quickly in fog.
        <br />
        The five boxing wizards jump quickly.
        <br />
        ข้อความจำลองภาษาไทยบรรทัดแรกของ Text ใช้ดูขนาดตัวอักษรและระยะบรรทัดบน UI
        <br />
        บรรทัดที่สองช่วยเปรียบเทียบการอ่านต่อเนื่องบนหน้าจอและคอมโพเนนต์ทั่วไป
        <br />
        บรรทัดที่สามปิดท้ายบล็อกข้อความจำลองของกลุ่ม Text
      </>
    );
  }
  return (
    <>
      Pack my box with five dozen liquor jugs.
      <br />
      How vexingly quick daft zebras jump!
      <br />
      เนื้อหาบทความจำลองภาษาไทยบรรทัดแรก ใช้ฟอนต์ Sarabun และระยะบรรทัดแบบ Article
      <br />
      บรรทัดที่สองจำลองย่อหน้าที่อ่านยาวขึ้นเพื่อตรวจ rhythm และความชัดของตัวอักษร
      <br />
      บรรทัดที่สามสรุปบล็อกข้อความจำลองของกลุ่ม Article ให้ครบตามที่กำหนด
    </>
  );
}

function styleKey(level: string, weight: Weight) {
  return `${level}-${weight}`;
}

function tokenFontSize(
  group: "heading" | "text" | "article",
  level: string,
  weight: Weight,
): string {
  const g = dsTokens.typography[group] as Record<
    string,
    { fontSize?: string }
  >;
  return g[styleKey(level, weight)]?.fontSize ?? "—";
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("aria-hidden", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function CodeExampleBox({
  title,
  code,
  ariaLabel,
}: {
  title: ReactNode;
  code: string;
  ariaLabel: string;
}) {
  const [copyLabel, setCopyLabel] = useState<"copy" | "done" | "fail">("copy");

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(code);
    setCopyLabel(ok ? "done" : "fail");
    window.setTimeout(() => setCopyLabel("copy"), ok ? 1800 : 2800);
  }, [code]);

  const copyButtonText =
    copyLabel === "done"
      ? "คัดลอกแล้ว"
      : copyLabel === "fail"
        ? "คัดลอกไม่สำเร็จ"
        : "คัดลอก";

  return (
    <section className="code-block" aria-label={ariaLabel}>
      <div className="code-block-header">
        <Typography group="text" styleName="sm-regular" as="span">
          {title}
        </Typography>
        <button
          type="button"
          className="code-block-copy"
          onClick={() => void handleCopy()}
          aria-label={`คัดลอก${ariaLabel}ไปยังคลิปบอร์ด`}
        >
          <Typography group="text" styleName="xs-semibold" as="span">
            {copyButtonText}
          </Typography>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </section>
  );
}

type SpecimenRowProps = {
  group: "heading" | "text" | "article";
  level: string;
  weight: Weight;
  as: ElementType;
  label: string;
};

function SpecimenRow({ group, level, weight, as, label }: SpecimenRowProps) {
  const sk = styleKey(level, weight);
  const tokenGroup = dsTokens.typography[group] as Record<string, unknown>;
  const ok = Boolean(tokenGroup[sk]);
  const meta = tokenFontSize(group, level, weight);

  return (
    <div className="typography-specimen-row">
      <div className="typography-specimen-meta-block">
        <Typography
          group="text"
          styleName="sm-regular"
          as="div"
          className="typography-specimen-label"
        >
          {label}
        </Typography>
        <Typography
          group="text"
          styleName="sm-regular"
          as="div"
          className="typography-specimen-meta"
        >
          {meta}
        </Typography>
      </div>
      <div className="typography-specimen-sample">
        {ok ? (
          <Typography group={group} styleName={sk} as={as}>
            {specimenSampleForGroup(group)}
          </Typography>
        ) : (
          <Typography
            group="text"
            styleName="sm-regular"
            as="p"
            className="playground-error"
          >
            ไม่พบ token {sk}
          </Typography>
        )}
      </div>
    </div>
  );
}

function specimenAsAndLabel(
  group: "heading" | "text" | "article",
  level: string,
): { as: ElementType; label: string } {
  if (group === "heading") {
    return { as: level as ElementType, label: level.toUpperCase() };
  }
  return { as: "p", label: level.toUpperCase() };
}

type SpecimenSectionProps = {
  previewLabel: string;
  sizeAriaLabel: string;
  sizeValue: string;
  sizeOptions: readonly string[];
  onSizeChange: (v: string) => void;
  group: "heading" | "text" | "article";
  weight: Weight;
  codeTitle: ReactNode;
  code: string;
  codeAriaLabel: string;
};

function SpecimenSection({
  previewLabel,
  sizeAriaLabel,
  sizeValue,
  sizeOptions,
  onSizeChange,
  group,
  weight,
  codeTitle,
  code,
  codeAriaLabel,
}: SpecimenSectionProps) {
  const { as, label } = specimenAsAndLabel(group, sizeValue);

  return (
    <div className="playground-preview typography-specimen-section">
      <header className="typography-specimen-card-header">
        <Typography
          group="text"
          styleName="md-semibold"
          as="h2"
          className="typography-specimen-card-title"
        >
          {previewLabel}
        </Typography>
        <select
          className="typography-specimen-header-select"
          value={sizeValue}
          onChange={(e) => onSizeChange(e.target.value)}
          aria-label={sizeAriaLabel}
        >
          {sizeOptions.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </header>
      <div className="playground-preview-pane">
        <SpecimenRow
          group={group}
          level={sizeValue}
          weight={weight}
          as={as}
          label={label}
        />
      </div>
      <div className="playground-preview-code-wrap">
        <CodeExampleBox
          title={codeTitle}
          code={code}
          ariaLabel={codeAriaLabel}
        />
      </div>
    </div>
  );
}

export function TypographyPlayground() {
  const [headingWeight, setHeadingWeight] = useState<Weight>("bold");
  const [textWeight, setTextWeight] = useState<Weight>("regular");
  const [articleWeight, setArticleWeight] = useState<Weight>("regular");

  const [headingCodeLevel, setHeadingCodeLevel] = useState<
    (typeof HEADING_LEVELS)[number]
  >("h2");
  const [textCodeSize, setTextCodeSize] = useState<(typeof BODY_SIZES)[number]>(
    "md",
  );
  const [articleCodeSize, setArticleCodeSize] = useState<
    (typeof BODY_SIZES)[number]
  >("lg");

  const headingCode = useMemo(() => {
    const sk = styleKey(headingCodeLevel, headingWeight);
    return `import { Typography } from "./design-system";

<Typography group="heading" styleName="${sk}" as="${headingCodeLevel}">
  การเปลี่ยนผ่านสู่ดิจิทัลของคุณเริ่มต้นที่นี่
</Typography>`;
  }, [headingCodeLevel, headingWeight]);

  const textCode = useMemo(() => {
    const t = styleKey(textCodeSize, textWeight);
    return `import { Typography } from "./design-system";

<Typography group="text" styleName="${t}" as="p">
  ปลดล็อกศักยภาพธุรกิจของคุณให้เต็มที่
</Typography>`;
  }, [textCodeSize, textWeight]);

  const articleCode = useMemo(() => {
    const a = styleKey(articleCodeSize, articleWeight);
    return `import { Typography } from "./design-system";

<Typography group="article" styleName="${a}" as="p">
  บทความและเนื้อหายาวใช้ฟอนต์ Sarabun พร้อม line-height ที่อ่านสบายตา
</Typography>`;
  }, [articleCodeSize, articleWeight]);

  return (
    <article className="doc-article">
      <DocPageHeader
        title="03 Typography"
        lead={
          <>
            ดูตัวอย่างการใช้งานจริงก่อน จากนั้นแยกการ์ด Heading, Text และ Article
            — เลือกขนาดที่มุมขวาของแต่ละการ์ดเพื่อดูพรีวิวและโค้ดที่สอดคล้องกัน
            ปรับน้ำหนักแยกตามกลุ่มทางแถบด้านขวา
          </>
        }
      />

      <div className="doc-playground-bleed">
        <div className="playground">
          <div className="playground-main">
            <div className="playground-preview">
              <Typography
                group="text"
                styleName="md-semibold"
                as="div"
                className="playground-preview-label"
              >
                ตัวอย่างการใช้งานจริงบนหน้าเว็บ
              </Typography>
              <div className="playground-preview-pane">
                <div className="typography-realworld-body">
                  <div className="typography-realworld-section">
                  <Typography
                    group="heading"
                    styleName={styleKey("h3", headingWeight)}
                    as="h3"
                  >
                    โซลูชัน SaaS ที่ขับเคลื่อนผลลัพธ์
                  </Typography>
                  <Typography
                    group="text"
                    styleName={styleKey("xl", textWeight)}
                    as="p"
                  >
                    สำรวจชุดซอฟต์แวร์ที่ช่วยให้ทีมทำงานได้คล่องขึ้น ฟอนต์ดอปเพลอร์
                    อินทิเกรตสกรีนคีย์บอร์ดเทฟลอนดอปเพลอร์
                    เวก้าโน้ตบุคฟอร์เวิร์ดแอพพลิเคชันโซนาร์
                  </Typography>
                  </div>

                  <div className="typography-realworld-grid">
                  <div className="typography-realworld-col">
                    <Typography
                      group="heading"
                      styleName={styleKey("h6", headingWeight)}
                      as="h4"
                    >
                      วางแผนองค์กร
                    </Typography>
                    <Typography
                      group="article"
                      styleName={styleKey("md", articleWeight)}
                      as="p"
                    >
                      บริหารและเชื่อมโยงฟังก์ชันหลักของธุรกิจในที่เดียว
                      เพื่อความโปร่งใสและประสิทธิภาพ ทัชแพด
                      ไซเบอร์โฟลเดอร์ซัลเฟต
                      สแต็กเวิร์ดโปรโตคอลซัพพอร์ททรานแซกชัน แอนะล็อกโซลูชัน
                      แอสเซมเบลอร์โฟลเดอร์ เซิร์ฟเวอร์ดีไวซ์ เซิร์ฟเวอร์ไบต์
                      อัลคาไลน์มอนิเตอร์อันโดรเมดา
                      โนวาอินทิเกรเตอร์เน็ตบุคเมลามีน
                      โพรเซสเซอร์เลเยอร์พันธุศาสตร์โซลูชั่น เน็ตเวิร์กอัพเกรด
                      โพรเซส ออนไลน์โซนาร์โพลาไรซ์ชิพ สเปซทรานแซ็คชั่น เทมเพลต
                      ไดนามิกอะมิโนโค้ด
                    </Typography>
                  </div>
                  <div className="typography-realworld-col">
                    <Typography
                      group="heading"
                      styleName={styleKey("h6", headingWeight)}
                      as="h4"
                    >
                      จัดการโปรเจกต์
                    </Typography>
                    <Typography
                      group="article"
                      styleName={styleKey("md", articleWeight)}
                      as="p"
                    >
                      วางแผนงาน มอบหมาย
                      และติดตามความคืบหน้าให้ทีมไปถึงเป้าหมายคอมไพล์ทัชแพดฟิชชัน
                      แอสเซมเบลอร์ แชนแนลโนวาสัมพัทธภาพโหลดไพธอน
                      สัมพัทธภาพพันธุศาสตร์ดาวน์เกรดจุลชีววิทยา
                      คอเลสเตอรอลโนวาเวิร์มอัพเกรด คอมไพเลอร์ดีบั๊ก กูเกิลเพจฟอสซิล
                      พารามิเตอร์อินพุท บลูเรย์ กูเกิ้ลเวิร์ดแอนดรอยด์
                      ดอปเพลอร์เพจเจอร์ แอปพลิเคชันไดรเวอร์
                      ควอนตัมไฟร์วอลล์อัลตราซาวนด์โค้ด
                      เซ็กเตอร์โดเมนแอนะล็อกฟอนต์ ดิจิทัลดอสบิต
                      บล็อกเกอร์ฟอนต์รีเฟรช
                    </Typography>
                  </div>
                  <div className="typography-realworld-col">
                    <Typography
                      group="heading"
                      styleName={styleKey("h6", headingWeight)}
                      as="h4"
                    >
                      วิเคราะห์และรายงาน
                    </Typography>
                    <Typography
                      group="article"
                      styleName={styleKey("md", articleWeight)}
                      as="p"
                    >
                      ใช้ข้อมูลเชิงลึกในการตัดสินใจและปรับกลยุทธ์ได้แม่นยำขึ้น
                      ซัพพอร์ต สล็อตแมคทรานแซคชัน
                      ดาวน์เกรดโมดูลฮาร์ดดิสก์เคอร์เนล
                      อัลตราซาวนด์เมลานินอัลตราซาวด์กำทอนอัปเดต
                      แบนด์วิดท์อีโบล่า พอร์ท อาร์กิวเมนต์ไดนามิกส์
                      โมดูลบลูทูธเอสเตอร์พันธุศาสตร์โนวา ซ็อกเก็ตอะลูมินา
                      ฟอนต์โซนาร์ คลอไรด์ แอมโมเนียมเวกเตอร์ เดเบียน
                      เวิร์กสเตชั่น แคโรทีนคอมไพเลอร์ฟอร์แมตคอมไพล์แคสสินี
                      อีโบลาเวอร์ชันแชนแนลลูปฟีเจอร์
                    </Typography>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <SpecimenSection
              previewLabel="ตัวอย่าง Heading — Prompt (h1–h6)"
              sizeAriaLabel="เลือกระดับหัวข้อ H1–H6"
              sizeValue={headingCodeLevel}
              sizeOptions={HEADING_LEVELS}
              onSizeChange={(v) =>
                setHeadingCodeLevel(v as (typeof HEADING_LEVELS)[number])
              }
              group="heading"
              weight={headingWeight}
              codeTitle="ตัวอย่างโค้ด — Heading"
              code={headingCode}
              codeAriaLabel="ตัวอย่างโค้ด Heading"
            />

            <SpecimenSection
              previewLabel="ตัวอย่าง Text — Prompt (xl–xs)"
              sizeAriaLabel="เลือกขนาด Text xl–xs"
              sizeValue={textCodeSize}
              sizeOptions={BODY_SIZES}
              onSizeChange={(v) =>
                setTextCodeSize(v as (typeof BODY_SIZES)[number])
              }
              group="text"
              weight={textWeight}
              codeTitle="ตัวอย่างโค้ด — Text"
              code={textCode}
              codeAriaLabel="ตัวอย่างโค้ด Text"
            />

            <SpecimenSection
              previewLabel="ตัวอย่าง Article — Sarabun (xl–xs)"
              sizeAriaLabel="เลือกขนาด Article xl–xs"
              sizeValue={articleCodeSize}
              sizeOptions={BODY_SIZES}
              onSizeChange={(v) =>
                setArticleCodeSize(v as (typeof BODY_SIZES)[number])
              }
              group="article"
              weight={articleWeight}
              codeTitle="ตัวอย่างโค้ด — Article"
              code={articleCode}
              codeAriaLabel="ตัวอย่างโค้ด Article"
            />
          </div>

          <aside
            className="playground-controls"
            aria-label="คุณสมบัติของคอมโพเนนต์"
          >
            <div className="playground-controls-header">
              <Typography
                group="text"
                styleName="lg-bold"
                as="div"
                className="playground-controls-title"
              >
                น้ำหนักตัวอักษร
              </Typography>
              <Typography
                group="text"
                styleName="sm-regular"
                as="p"
                className="playground-controls-sub-title"
              >
                ควบคุมแยกตามกลุ่ม — ใช้กับสเปซิเมนต์และตัวอย่างหน้าเว็บ
              </Typography>
            </div>
            <ControlField
              label="Heading (h1–h6)"
              hint="ใช้กับทุกระดับหัวข้อ Prompt"
            >
              <select
                className="control-select"
                value={headingWeight}
                onChange={(e) => setHeadingWeight(e.target.value as Weight)}
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {WEIGHT_LABELS[w]}
                  </option>
                ))}
              </select>
            </ControlField>
            <ControlField label="Text (xl–xs)" hint="ข้อความ UI ทั่วไป">
              <select
                className="control-select"
                value={textWeight}
                onChange={(e) => setTextWeight(e.target.value as Weight)}
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {WEIGHT_LABELS[w]}
                  </option>
                ))}
              </select>
            </ControlField>
            <ControlField label="Article (xl–xs)" hint="เนื้อหาบทความ Sarabun">
              <select
                className="control-select"
                value={articleWeight}
                onChange={(e) => setArticleWeight(e.target.value as Weight)}
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {WEIGHT_LABELS[w]}
                  </option>
                ))}
              </select>
            </ControlField>
          </aside>
        </div>
      </div>
    </article>
  );
}
