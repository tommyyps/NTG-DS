import type { ElementType } from "react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Typography, dsTokens } from "../../design-system";
import { ControlField } from "../../site/ControlField";
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
        Nation Group Thailand Design System
        <br />
        หัวข้อจำลองภาษาไทยหนึ่งบรรทัด สำหรับดูน้ำหนักและระยะบรรทัด
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
        <span>{title}</span>
        <button
          type="button"
          className="code-block-copy"
          onClick={() => void handleCopy()}
          aria-label={`คัดลอก${ariaLabel}ไปยังคลิปบอร์ด`}
        >
          {copyButtonText}
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
        <div className="typography-specimen-label">{label}</div>
        <div className="typography-specimen-meta">{meta}</div>
      </div>
      <div className="typography-specimen-sample">
        {ok ? (
          <Typography group={group} styleName={sk} as={as}>
            {specimenSampleForGroup(group)}
          </Typography>
        ) : (
          <p className="playground-error">ไม่พบ token {sk}</p>
        )}
      </div>
    </div>
  );
}

export function TypographyPlayground() {
  const [headingWeight, setHeadingWeight] = useState<Weight>("bold");
  const [textWeight, setTextWeight] = useState<Weight>("regular");
  const [articleWeight, setArticleWeight] = useState<Weight>("regular");

  const headingCode = useMemo(() => {
    const h = styleKey("h2", headingWeight);
    return `import { Typography } from "./design-system";

<Typography group="heading" styleName="${h}" as="h2">
  การเปลี่ยนผ่านสู่ดิจิทัลของคุณเริ่มต้นที่นี่
</Typography>`;
  }, [headingWeight]);

  const textCode = useMemo(() => {
    const t = styleKey("md", textWeight);
    return `import { Typography } from "./design-system";

<Typography group="text" styleName="${t}" as="p">
  ปลดล็อกศักยภาพธุรกิจของคุณให้เต็มที่
</Typography>`;
  }, [textWeight]);

  const articleCode = useMemo(() => {
    const a = styleKey("lg", articleWeight);
    return `import { Typography } from "./design-system";

<Typography group="article" styleName="${a}" as="p">
  บทความและเนื้อหายาวใช้ฟอนต์ Sarabun พร้อม line-height ที่อ่านสบายตา
</Typography>`;
  }, [articleWeight]);

  return (
    <article className="doc-article">
      <header className="doc-header">
        <h1 className="doc-title">03 Typography</h1>
        <p className="doc-lead">
          สเปซิเมนต์ครบทุกสไตล์จาก tokens — Heading (h1–h6), Text และ Article
          (xl–xs) ปรับน้ำหนักตัวอักษรแยกตามกลุ่มทางแถบด้านขวา
          แล้วดูตัวอย่างหน้าเว็บจริงและโค้ดด้านล่าง
        </p>
      </header>

      <div className="doc-playground-bleed">
        <div className="playground">
          <div className="playground-main">
            <div className="playground-preview typography-specimen-wrap">
              <div className="playground-preview-label">
                ตัวอย่าง Font ทุกรูปแบบใน Design System
              </div>
              <div className="typography-specimen-body">
                <section className="typography-specimen-group">
                  <h2 className="typography-specimen-group-title">
                    Heading — Prompt (h1–h6)
                  </h2>
                  {HEADING_LEVELS.map((level) => (
                    <SpecimenRow
                      key={level}
                      group="heading"
                      level={level}
                      weight={headingWeight}
                      as={level as ElementType}
                      label={level.toUpperCase()}
                    />
                  ))}
                </section>

                <section className="typography-specimen-group">
                  <h2 className="typography-specimen-group-title">
                    Text — Prompt (xl–xs)
                  </h2>
                  {BODY_SIZES.map((size) => (
                    <SpecimenRow
                      key={size}
                      group="text"
                      level={size}
                      weight={textWeight}
                      as="p"
                      label={size.toUpperCase()}
                    />
                  ))}
                </section>

                <section className="typography-specimen-group">
                  <h2 className="typography-specimen-group-title">
                    Article — Sarabun (xl–xs)
                  </h2>
                  {BODY_SIZES.map((size) => (
                    <SpecimenRow
                      key={size}
                      group="article"
                      level={size}
                      weight={articleWeight}
                      as="p"
                      label={size.toUpperCase()}
                    />
                  ))}
                </section>
              </div>
            </div>

            <div className="playground-preview">
              <div className="playground-preview-label">
                ตัวอย่างการใช้งานจริงบนหน้าเว็บ
              </div>
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
                    สำรวจชุดซอฟต์แวร์ที่ช่วยให้ทีมทำงานได้คล่องขึ้น ฟอนต์ดอปเพลอร์ อินทิเกรตสกรีนคีย์บอร์ดเทฟลอนดอปเพลอร์ เวก้าโน้ตบุคฟอร์เวิร์ดแอพพลิเคชันโซนาร์
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
                      เพื่อความโปร่งใสและประสิทธิภาพ ทัชแพด ไซเบอร์โฟลเดอร์ซัลเฟต สแต็กเวิร์ดโปรโตคอลซัพพอร์ททรานแซกชัน แอนะล็อกโซลูชัน แอสเซมเบลอร์โฟลเดอร์ เซิร์ฟเวอร์ดีไวซ์ เซิร์ฟเวอร์ไบต์ อัลคาไลน์มอนิเตอร์อันโดรเมดา โนวาอินทิเกรเตอร์เน็ตบุคเมลามีน โพรเซสเซอร์เลเยอร์พันธุศาสตร์โซลูชั่น เน็ตเวิร์กอัพเกรด โพรเซส ออนไลน์โซนาร์โพลาไรซ์ชิพ สเปซทรานแซ็คชั่น เทมเพลต ไดนามิกอะมิโนโค้ด
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
                      วางแผนงาน มอบหมาย และติดตามความคืบหน้าให้ทีมไปถึงเป้าหมายคอมไพล์ทัชแพดฟิชชัน แอสเซมเบลอร์ แชนแนลโนวาสัมพัทธภาพโหลดไพธอน สัมพัทธภาพพันธุศาสตร์ดาวน์เกรดจุลชีววิทยา คอเลสเตอรอลโนวาเวิร์มอัพเกรด คอมไพเลอร์ดีบั๊ก กูเกิลเพจฟอสซิล พารามิเตอร์อินพุท บลูเรย์ กูเกิ้ลเวิร์ดแอนดรอยด์ ดอปเพลอร์เพจเจอร์ แอปพลิเคชันไดรเวอร์ ควอนตัมไฟร์วอลล์อัลตราซาวนด์โค้ด เซ็กเตอร์โดเมนแอนะล็อกฟอนต์ ดิจิทัลดอสบิต บล็อกเกอร์ฟอนต์รีเฟรช
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
                      ใช้ข้อมูลเชิงลึกในการตัดสินใจและปรับกลยุทธ์ได้แม่นยำขึ้น ซัพพอร์ต สล็อตแมคทรานแซคชัน ดาวน์เกรดโมดูลฮาร์ดดิสก์เคอร์เนล อัลตราซาวนด์เมลานินอัลตราซาวด์กำทอนอัปเดต แบนด์วิดท์อีโบล่า พอร์ท อาร์กิวเมนต์ไดนามิกส์ โมดูลบลูทูธเอสเตอร์พันธุศาสตร์โนวา ซ็อกเก็ตอะลูมินา ฟอนต์โซนาร์ คลอไรด์ แอมโมเนียมเวกเตอร์ เดเบียน เวิร์กสเตชั่น แคโรทีนคอมไพเลอร์ฟอร์แมตคอมไพล์แคสสินี อีโบลาเวอร์ชันแชนแนลลูปฟีเจอร์
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="typography-code-blocks"
              aria-label="ตัวอย่างโค้ด Typography"
            >
              <CodeExampleBox
                title="Heading — หน้า UI (Prompt)"
                code={headingCode}
                ariaLabel="ตัวอย่างโค้ด Heading"
              />
              <CodeExampleBox
                title="Text — ข้อความทั่วไป (Prompt)"
                code={textCode}
                ariaLabel="ตัวอย่างโค้ด Text"
              />
              <CodeExampleBox
                title="Article — เนื้อหาบทความ (Sarabun)"
                code={articleCode}
                ariaLabel="ตัวอย่างโค้ด Article"
              />
            </div>
          </div>

          <aside
            className="playground-controls"
            aria-label="คุณสมบัติของคอมโพเนนต์"
          >
            <div className="playground-controls-header">
              <div className="playground-controls-title">น้ำหนักตัวอักษร</div>
              <p className="playground-controls-sub-title">
                ควบคุมแยกตามกลุ่ม — ใช้กับสเปซิเมนต์ ตัวอย่างหน้าเว็บ และตัวอย่างโค้ด
              </p>
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
