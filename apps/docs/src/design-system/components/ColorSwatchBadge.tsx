import "./ColorSwatchBadge.css";

export type ColorSwatchBadgeProps = {
  /** ข้อความป้าย (เช่น ชื่อ primitive หรือ hex) */
  label: string;
  /** สีที่แสดงในวงสวอช — ถ้าไม่มีจะแสดง placeholder */
  hex?: string | null;
  /**
   * พื้นป้าย — `onDark` ตาม Figma color-variable-row (พื้น #0c111d + ข้อความอ่อน)
   */
  surface?: "default" | "onDark";
  /** สวอชอยู่ซ้ายหรือขวาของข้อความ */
  placement?: "label-first" | "swatch-first";
  /** ใช้ monospace + สีรองสำหรับชื่อโทเค็น (ทางเลือก) */
  labelMono?: boolean;
  /** ตัดข้อความยาวด้วย ellipsis (ใช้คู่กับคอลัมน์แคบในตาราง) */
  truncateLabel?: boolean;
  title?: string;
  emptyHint?: string;
  className?: string;
};

/**
 * ป้ายตัวอย่างสีตามเอกสาร Tiers Color — วงแหวนรอบสวอช 32px
 */
export function ColorSwatchBadge({
  label,
  hex,
  surface = "default",
  placement = "label-first",
  labelMono = false,
  truncateLabel = false,
  title,
  emptyHint,
  className = "",
}: ColorSwatchBadgeProps) {
  const hasHex = hex != null && hex !== "";
  const rootClass = [
    "ds-color-swatch-badge",
    surface === "onDark" && "ds-color-swatch-badge--on-dark",
    !hasHex && "ds-color-swatch-badge--empty",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClass = [
    "ds-type-badge-label",
    "ds-color-swatch-badge__label",
    labelMono && "ds-color-swatch-badge__label--mono",
    truncateLabel && "ds-color-swatch-badge__label--truncate",
  ]
    .filter(Boolean)
    .join(" ");

  const labelEl = <span className={labelClass}>{label}</span>;

  const swatchInner = hasHex ? (
    <span
      className="ds-color-swatch-badge__swatch"
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  ) : (
    <span
      className="ds-color-swatch-badge__swatch ds-color-swatch-badge__swatch--placeholder"
      aria-hidden
    />
  );

  const swatchEl = (
    <span className="ds-color-swatch-badge__ring" aria-hidden>
      {swatchInner}
    </span>
  );

  return (
    <span
      className={rootClass}
      title={hasHex ? (title ?? hex) : emptyHint}
    >
      {placement === "swatch-first" ? (
        <>
          {swatchEl}
          {labelEl}
        </>
      ) : (
        <>
          {labelEl}
          {swatchEl}
        </>
      )}
    </span>
  );
}
