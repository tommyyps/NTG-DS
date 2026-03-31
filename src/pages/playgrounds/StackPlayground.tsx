import { useMemo, useState } from "react";
import { Stack } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { PlaygroundShell } from "../../site/PlaygroundShell";

const box = (label: string, color: string) => (
  <div
    key={label}
    style={{
      minWidth: 72,
      minHeight: 48,
      borderRadius: 8,
      background: color,
      color: "#fff",
      fontSize: 12,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {label}
  </div>
);

export function StackPlayground() {
  const [direction, setDirection] = useState<"row" | "column">("row");
  const [gap, setGap] = useState(16);
  const [wrap, setWrap] = useState(true);

  const code = useMemo(
    () => `import { Stack } from "./design-system";

<Stack direction="${direction}" gap={${gap}} wrap={${wrap}}>
  <div>A</div>
  <div>B</div>
  <div>C</div>
</Stack>`,
    [direction, gap, wrap],
  );

  return (
    <PlaygroundShell
      title="09 Frame"
      description="09 Frame — จัดวางอะตอมหลายตัวในแนว flex (ตัวอย่างจาก Stack layout)"
      preview={
        <Stack direction={direction} gap={gap} wrap={wrap}>
          {box("A", "#1e58f2")}
          {box("B", "#475467")}
          {box("C", "#039855")}
        </Stack>
      }
      controls={
        <>
          <ControlField label="ทิศทาง (direction)">
            <select
              className="control-select"
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as "row" | "column")
              }
            >
              <option value="row">row</option>
              <option value="column">column</option>
            </select>
          </ControlField>
          <ControlField label={`ระยะห่าง (gap): ${gap}px`}>
            <input
              type="range"
              min={4}
              max={40}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
            />
          </ControlField>
          <ControlField label="wrap">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={wrap}
                onChange={(e) => setWrap(e.target.checked)}
              />
              <span>flex-wrap</span>
            </label>
          </ControlField>
        </>
      }
      code={code}
    />
  );
}
