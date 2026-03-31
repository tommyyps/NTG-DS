import type { ReactNode } from "react";

type ControlFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function ControlField({ label, hint, children }: ControlFieldProps) {
  return (
    <label className="control-field">
      <span className="control-field-label">{label}</span>
      {hint ? <span className="control-field-hint">{hint}</span> : null}
      {children}
    </label>
  );
}
