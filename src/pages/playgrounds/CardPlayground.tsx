import { useMemo, useState } from "react";
import { Button, Card, Typography } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { PlaygroundShell } from "../../site/PlaygroundShell";

export function CardPlayground() {
  const [title, setTitle] = useState("หัวข้อการ์ด");
  const [showDescription, setShowDescription] = useState(true);
  const [description, setDescription] = useState(
    "คำอธิบายสั้นๆ ใต้หัวข้อ ใช้สีรองจาก token",
  );
  const [showFooter, setShowFooter] = useState(true);
  const [elevated, setElevated] = useState(false);

  const code = useMemo(() => {
    const lines = [
      `import { Button, Card, Typography } from "./design-system";`,
      ``,
      `<Card`,
      `  title={<Typography group="text" styleName="lg-semibold">${title}</Typography>}`,
    ];
    if (showDescription) {
      lines.push(`  description="${description}"`);
    }
    lines.push(`>`);
    if (showFooter) lines.push(`  <Button>ดำเนินการ</Button>`);
    lines.push(`</Card>`);
    return lines.join("\n");
  }, [title, showDescription, description, showFooter]);

  const cardStyle = elevated
    ? { boxShadow: "0 12px 30px rgba(18, 25, 38, 0.08)" }
    : {};

  return (
    <PlaygroundShell
      title="28 Content"
      description="28 Content — บล็อกเนื้อหา (การ์ด + หัวข้อ / คำอธิบาย / children)"
      preview={
        <div style={cardStyle}>
          <Card
            title={
              <Typography group="text" styleName="lg-semibold">
                {title}
              </Typography>
            }
            description={showDescription ? description : undefined}
          >
            {showFooter ? <Button>ดำเนินการ</Button> : null}
          </Card>
        </div>
      }
      controls={
        <>
          <ControlField label="หัวข้อ">
            <input
              className="control-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
            />
          </ControlField>
          <ControlField label="แสดงคำอธิบาย">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={showDescription}
                onChange={(e) => setShowDescription(e.target.checked)}
              />
              <span>description</span>
            </label>
          </ControlField>
          {showDescription ? (
            <ControlField label="เนื้อหาคำอธิบาย">
              <textarea
                className="control-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </ControlField>
          ) : null}
          <ControlField label="แสดงพื้นที่ท้าย (children)">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={showFooter}
                onChange={(e) => setShowFooter(e.target.checked)}
              />
              <span>ปุ่มตัวอย่าง</span>
            </label>
          </ControlField>
          <ControlField label="เงา (demo)">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={elevated}
                onChange={(e) => setElevated(e.target.checked)}
              />
              <span>elevated</span>
            </label>
          </ControlField>
        </>
      }
      code={code}
    />
  );
}
