import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Badge, ColorSwatchBadge, Typography } from "../../design-system";
import { ControlField } from "../../site/ControlField";
import { DocPageHeader } from "../../site/DocPageHeader";
import "../../site/PlaygroundShell.css";

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

export function BadgePlayground() {
  const [variant, setVariant] = useState<
    "brand" | "neutral" | "success" | "warning"
  >("brand");
  const [text, setText] = useState("ใหม่");

  const statusCode = useMemo(
    () => `import { Badge } from "./design-system";

<Badge variant="${variant}">${text}</Badge>`,
    [variant, text],
  );

  const colorSwatchCode = useMemo(
    () => `import { ColorSwatchBadge } from "./design-system";

<ColorSwatchBadge
  label="brand-500"
  hex="#1E58F2"
  placement="swatch-first"
/>`,
    [],
  );

  return (
    <article className="doc-article">
      <DocPageHeader
        title="22 Badges"
        lead={
          <>
            แยกการ์ดตามคอมโพเนนต์ — แต่ละการ์ดมีพรีวิวหนึ่งชิ้นและตัวอย่างโค้ดที่สอดคล้องกัน
            ปรับ variant และข้อความของ Status ได้จากแถบด้านขวา
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
                ตัวอย่าง — Status
              </Typography>
              <div className="playground-preview-pane">
                <div className="playground-canvas">
                  <Badge variant={variant}>{text}</Badge>
                </div>
              </div>
              <div className="playground-preview-code-wrap">
                <CodeExampleBox
                  title="ตัวอย่างโค้ด — Status"
                  code={statusCode}
                  ariaLabel="ตัวอย่างโค้ด Status"
                />
              </div>
            </div>

            <div className="playground-preview">
              <Typography
                group="text"
                styleName="md-semibold"
                as="div"
                className="playground-preview-label"
              >
                ตัวอย่าง — Color swatch badge
              </Typography>
              <div className="playground-preview-pane">
                <div className="playground-canvas">
                  <ColorSwatchBadge
                    label="brand-500"
                    hex="#1E58F2"
                    placement="swatch-first"
                  />
                </div>
              </div>
              <div className="playground-preview-code-wrap">
                <CodeExampleBox
                  title="ตัวอย่างโค้ด — Color swatch badge"
                  code={colorSwatchCode}
                  ariaLabel="ตัวอย่างโค้ด Color swatch badge"
                />
              </div>
            </div>
          </div>

          <aside
            className="playground-controls"
            aria-label="คุณสมบัติของคอมโพเนนต์ Status"
          >
            <div className="playground-controls-header">
              <Typography
                group="text"
                styleName="lg-bold"
                as="div"
                className="playground-controls-title"
              >
                คุณสมบัติ
              </Typography>
              <Typography
                group="text"
                styleName="sm-regular"
                as="p"
                className="playground-controls-sub-title"
              >
                ใช้กับ Status เท่านั้น — Color swatch badge
                เป็นค่าคงที่ในตัวอย่าง
              </Typography>
            </div>
            <ControlField label="variant">
              <select
                className="control-select"
                value={variant}
                onChange={(e) =>
                  setVariant(
                    e.target.value as
                      | "brand"
                      | "neutral"
                      | "success"
                      | "warning",
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
          </aside>
        </div>
      </div>
    </article>
  );
}
