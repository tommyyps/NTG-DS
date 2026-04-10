import { useCallback, useState, type ReactNode } from "react";
import { Typography } from "../design-system";
import "./PlaygroundShell.css";

type PlaygroundShellProps = {
  title: string;
  description: string;
  /** หัวข้อแถบพรีวิว (ค่าเริ่มต้น: ตัวอย่าง) — ให้สอดคล้องกับหน้าอื่น เช่น Typography */
  previewLabel?: string;
  preview: ReactNode;
  controls: ReactNode;
  code: string;
};

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

export function PlaygroundShell({
  title,
  description,
  previewLabel = "ตัวอย่าง",
  preview,
  controls,
  code,
}: PlaygroundShellProps) {
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
    <article className="doc-article">
      <header className="doc-header">
        <Typography group="heading" styleName="h5-bold" as="h1" className="doc-title">
          {title}
        </Typography>
        <Typography group="text" styleName="lg-regular" as="p" className="doc-lead">
          {description}
        </Typography>
      </header>

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
                {previewLabel}
              </Typography>
              <div className="playground-preview-pane">
                <div className="playground-canvas">{preview}</div>
              </div>
              <div className="playground-preview-code-wrap">
                <section className="code-block" aria-label="ตัวอย่างโค้ด">
                  <div className="code-block-header">
                    <Typography group="text" styleName="sm-regular" as="span">
                      ตัวอย่างโค้ด
                    </Typography>
                    <button
                      type="button"
                      className="code-block-copy"
                      onClick={() => void handleCopy()}
                      aria-label="คัดลอกตัวอย่างโค้ดไปยังคลิปบอร์ด"
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
              </div>
            </div>
          </div>
          <aside
            className="playground-controls"
            aria-label="คุณสมบัติของคอมโพเนนต์"
          >
            <Typography
              group="text"
              styleName="lg-bold"
              as="div"
              className="playground-controls-title"
            >
              คุณสมบัติ
            </Typography>
            {controls}
          </aside>
        </div>
      </div>
    </article>
  );
}
