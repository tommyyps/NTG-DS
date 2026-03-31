import { useCallback, useState, type ReactNode } from "react";
import "./PlaygroundShell.css";

type PlaygroundShellProps = {
  title: string;
  description: string;
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
        <h1 className="doc-title">{title}</h1>
        <p className="doc-lead">{description}</p>
      </header>

      <div className="doc-playground-bleed">
        <div className="playground">
          <div className="playground-main">
            <div className="playground-preview">
              <div className="playground-preview-label">ตัวอย่าง</div>
              <div className="playground-canvas">{preview}</div>
            </div>
            <section className="code-block" aria-label="ตัวอย่างโค้ด">
              <div className="code-block-header">
                <span>ตัวอย่างโค้ด</span>
                <button
                  type="button"
                  className="code-block-copy"
                  onClick={() => void handleCopy()}
                  aria-label="คัดลอกตัวอย่างโค้ดไปยังคลิปบอร์ด"
                >
                  {copyButtonText}
                </button>
              </div>
              <pre>
                <code>{code}</code>
              </pre>
            </section>
          </div>
          <aside
            className="playground-controls"
            aria-label="คุณสมบัติของคอมโพเนนต์"
          >
            <div className="playground-controls-title">คุณสมบัติ</div>
            {controls}
          </aside>
        </div>
      </div>
    </article>
  );
}
