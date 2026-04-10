import { Button } from "./Button";
import { Typography } from "./Typography";
import { Stack } from "./Stack";

type HeroProps = {
  title: string;
  subtitle?: string;
  headingLevel?: "h1" | "h2" | "h3";
  showActions?: boolean;
};

const headingStyles = {
  h1: "h2-bold" as const,
  h2: "h3-bold" as const,
  h3: "h4-semibold" as const,
};

export function Hero({
  title,
  subtitle,
  headingLevel = "h1",
  showActions = true,
}: HeroProps) {
  const styleName = headingStyles[headingLevel];
  const Tag = headingLevel;

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #eef2ff 0%, var(--color-surface) 100%)",
        border: "1px solid var(--color-border)",
        borderRadius: 20,
        padding: "var(--space-md-sm) var(--space-md-md)",
      }}
    >
      <Stack gap={12}>
        <Typography group="heading" styleName={styleName} as={Tag}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography group="text" styleName="md-regular" as="p">
            {subtitle}
          </Typography>
        ) : null}
        {showActions ? (
          <Stack direction="row" gap={12} wrap>
            <Button>หลัก</Button>
            <Button variant="secondary">รอง</Button>
          </Stack>
        ) : null}
      </Stack>
    </section>
  );
}
