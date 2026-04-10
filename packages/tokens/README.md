# @ntgds/tokens

แพ็กเกจโทเค็นกลางของ Design System — สร้างจาก `ntgds-figma-tokens` ผ่าน `npm run tokens:generate` ที่ราก monorepo

## สิ่งที่ได้

| Export | รายละเอียด |
|--------|------------|
| `@ntgds/tokens/css-variables.css` | ตัวแปร `:root` สำหรับสี, spacing, typography, layout |
| `@ntgds/tokens/tokens` | `export const dsTokens` (ESM `.mjs`) — ข้อมูลโทเค็นแบบ object |
| `@ntgds/tokens/tokens.json` | โทเค็นแบบ JSON สำหรับ tooling / โปรเจกต์ที่ไม่ใช้ ESM |

## React / Next.js

```tsx
// layout.tsx หรือ main.tsx — โหลดครั้งเดียว
import "@ntgds/tokens/css-variables.css";
```

```tsx
import { dsTokens } from "@ntgds/tokens/tokens";
// ใช้อ่านค่าใน JS/TS (เช่น ขนาดฟอนต์) — ส่วนใหญ่ใช้ var(--*) ใน CSS ก็พอ
```

## Vue / Nuxt

```ts
// main.ts หรือ plugins
import "@ntgds/tokens/css-variables.css";
```

```vue
<style scoped>
.title {
  color: var(--color-text-primary-default);
  font-size: var(--font-size-body);
}
</style>
```

## การอัปเดต

แก้ที่ `ntgds-figma-tokens/*.json` แล้วรัน `npm run tokens:generate` ที่ราก repo
