import type { ReactNode } from "react";
import { Typography } from "../design-system";

type DocPageHeaderProps = {
  title: string;
  lead: ReactNode;
};

export function DocPageHeader({ title, lead }: DocPageHeaderProps) {
  return (
    <header className="doc-header">
      <Typography group="heading" styleName="h5-bold" as="h1" className="doc-title">
        {title}
      </Typography>
      <Typography group="text" styleName="lg-regular" as="p" className="doc-lead">
        {lead}
      </Typography>
    </header>
  );
}
