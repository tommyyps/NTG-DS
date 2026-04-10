import { useMemo, useState } from "react";
import { Button, Typography } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { PlaygroundShell } from "../../site/PlaygroundShell";

export function ButtonPlayground() {
  const [variant, setVariant] = useState<"primary" | "secondary">("primary");
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState("กดฉัน");

  const code = useMemo(
    () => `import { Button } from "./design-system";

<Button variant="${variant}"${disabled ? " disabled" : ""}>
  ${label}
</Button>`,
    [variant, disabled, label],
  );

  return (
    <PlaygroundShell
      title="11 Buttons"
      description="ปุ่มกระทำหลัก/รอง — ข้อความใช้คลาส .ds-type-button-label (เทียบเท่า text/sm-semibold)"
      previewLabel="ตัวอย่าง — 11 Buttons"
      preview={
        <Button variant={variant} disabled={disabled}>
          {label}
        </Button>
      }
      controls={
        <>
          <ControlField label="รูปแบบ (variant)">
            <select
              className="control-select"
              value={variant}
              onChange={(e) =>
                setVariant(e.target.value as "primary" | "secondary")
              }
            >
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
            </select>
          </ControlField>
          <ControlField label="ปิดการใช้งาน (disabled)">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              <Typography group="text" styleName="sm-regular" as="span">
                disabled
              </Typography>
            </label>
          </ControlField>
          <ControlField label="ข้อความบนปุ่ม">
            <input
              className="control-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
            />
          </ControlField>
        </>
      }
      code={code}
    />
  );
}
