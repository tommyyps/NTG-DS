import { useMemo, useState } from "react";
import { Badge } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { PlaygroundShell } from "../../site/PlaygroundShell";

export function BadgePlayground() {
  const [variant, setVariant] = useState<
    "brand" | "neutral" | "success" | "warning"
  >("brand");
  const [text, setText] = useState("ใหม่");

  const code = useMemo(
    () => `import { Badge } from "./design-system";

<Badge variant="${variant}">${text}</Badge>`,
    [variant, text],
  );

  return (
    <PlaygroundShell
      title="22 Badges"
      description="ป้ายสถานะขนาดเล็ก ใช้ประกอบป้ายหมวดหมู่ หรือสถานะสั้นๆ"
      preview={<Badge variant={variant}>{text}</Badge>}
      controls={
        <>
          <ControlField label="variant">
            <select
              className="control-select"
              value={variant}
              onChange={(e) =>
                setVariant(
                  e.target.value as "brand" | "neutral" | "success" | "warning",
                )
              }
            >
              <option value="brand">brand</option>
              <option value="neutral">neutral</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
            </select>
          </ControlField>
          <ControlField label="ข้อความ">
            <input
              className="control-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={24}
            />
          </ControlField>
        </>
      }
      code={code}
    />
  );
}
