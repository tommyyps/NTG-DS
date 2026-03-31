import type { ElementType } from "react";
import { useMemo, useState } from "react";
import { Typography, dsTokens } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { PlaygroundShell } from "../../site/PlaygroundShell";

const WEIGHTS = ["bold", "semibold", "medium", "regular"] as const;
const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const TEXT_SIZES = ["xl", "lg", "md", "sm", "xs"] as const;
type Group = "heading" | "text" | "article";

export function TypographyPlayground() {
  const [group, setGroup] = useState<Group>("heading");
  const [level, setLevel] = useState<string>("h2");
  const [weight, setWeight] = useState<(typeof WEIGHTS)[number]>("bold");

  const sizeOptions = group === "heading" ? HEADING_LEVELS : TEXT_SIZES;
  const resolvedLevel = (sizeOptions as readonly string[]).includes(level)
    ? level
    : group === "heading"
      ? "h2"
      : "md";

  const styleName = useMemo(
    () => `${resolvedLevel}-${weight}`,
    [resolvedLevel, weight],
  );

  const tokenGroup = dsTokens.typography[group] as Record<string, unknown>;
  const tokenOk = Boolean(tokenGroup[styleName]);

  const asTag: ElementType =
    group === "heading" &&
    (HEADING_LEVELS as readonly string[]).includes(resolvedLevel)
      ? (resolvedLevel as ElementType)
      : "p";

  const sampleText =
    group === "article"
      ? "บทความยาวอ่านสบาย ใช้ Sarabun และ line-height ตาม token ของ Article"
      : group === "heading"
        ? "หัวข้อหลักของหน้าเว็บ (Prompt)"
        : "ข้อความหน้าเว็บทั่วไป (Prompt)";

  const codeAs =
    group === "heading" &&
    (HEADING_LEVELS as readonly string[]).includes(resolvedLevel)
      ? resolvedLevel
      : "p";

  const code = `import { Typography } from "./design-system";

<Typography group="${group}" styleName="${styleName}" as="${codeAs}">
  ${sampleText}
</Typography>`;

  return (
    <PlaygroundShell
      title="03 Typography"
      description="แสดงสไตล์ตัวอักษรจาก tokens/typography.json — เลือกกลุ่ม Heading (หน้า UI), Text (ทั่วไป), หรือ Article (บทความ) แล้วปรับระดับและน้ำหนัก"
      preview={
        tokenOk ? (
          <Typography group={group} styleName={styleName} as={asTag}>
            {sampleText}
          </Typography>
        ) : (
          <p className="playground-error">ไม่พบ token สำหรับ {styleName}</p>
        )
      }
      controls={
        <>
          <ControlField label="กลุ่ม (Group)" hint="ตรงกับ Text styles ใน Figma">
            <select
              className="control-select"
              value={group}
              onChange={(e) => {
                const next = e.target.value as Group;
                setGroup(next);
                setLevel(next === "heading" ? "h2" : "md");
              }}
            >
              <option value="heading">Heading</option>
              <option value="text">Text</option>
              <option value="article">Article</option>
            </select>
          </ControlField>
          <ControlField
            label={group === "heading" ? "ระดับหัวข้อ" : "ขนาด (xl–xs)"}
            hint="สัมพันธ์ semantics.typography.size"
          >
            <select
              className="control-select"
              value={resolvedLevel}
              onChange={(e) => setLevel(e.target.value)}
            >
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </ControlField>
          <ControlField label="น้ำหนัก" hint="bold / semibold / medium / regular">
            <select
              className="control-select"
              value={weight}
              onChange={(e) =>
                setWeight(e.target.value as (typeof WEIGHTS)[number])
              }
            >
              {WEIGHTS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </ControlField>
        </>
      }
      code={code}
    />
  );
}
