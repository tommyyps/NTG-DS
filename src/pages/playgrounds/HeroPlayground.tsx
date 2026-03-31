import { useMemo, useState } from "react";
import { Hero } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { PlaygroundShell } from "../../site/PlaygroundShell";

export function HeroPlayground() {
  const [headingLevel, setHeadingLevel] = useState<"h1" | "h2" | "h3">("h1");
  const [title, setTitle] = useState("พาคุณสู่ประสบการณ์ข่าวดีกว่าเดิม");
  const [subtitle, setSubtitle] = useState(
    "Hero เป็น organism ที่ประกอบ Typography + Button หลายตัวเพื่อเปิดหน้า",
  );
  const [showActions, setShowActions] = useState(true);

  const code = useMemo(
    () => `import { Hero } from "./design-system";

<Hero
  headingLevel="${headingLevel}"
  title="${title.replace(/"/g, '\\"')}"
  subtitle="${subtitle.replace(/"/g, '\\"')}"
  showActions={${showActions}}
/>`,
    [headingLevel, title, subtitle, showActions],
  );

  return (
    <PlaygroundShell
      title="33 Header"
      description="33 Header — โซนหัวหน้า: หัวข้อ คำโปรย และปุ่มกระทำ (ตัวอย่างจาก Hero)"
      preview={
        <Hero
          headingLevel={headingLevel}
          title={title}
          subtitle={subtitle}
          showActions={showActions}
        />
      }
      controls={
        <>
          <ControlField label="ระดับหัวข้อ (Typography mapping)">
            <select
              className="control-select"
              value={headingLevel}
              onChange={(e) =>
                setHeadingLevel(e.target.value as "h1" | "h2" | "h3")
              }
            >
              <option value="h1">h1 → heading/h2-bold (demo)</option>
              <option value="h2">h2 → heading/h3-bold</option>
              <option value="h3">h3 → heading/h4-semibold</option>
            </select>
          </ControlField>
          <ControlField label="หัวเรื่อง">
            <input
              className="control-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
          </ControlField>
          <ControlField label="คำโปรย">
            <textarea
              className="control-textarea"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={3}
              maxLength={240}
            />
          </ControlField>
          <ControlField label="แสดงปุ่ม">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={showActions}
                onChange={(e) => setShowActions(e.target.checked)}
              />
              <span>showActions</span>
            </label>
          </ControlField>
        </>
      }
      code={code}
    />
  );
}
