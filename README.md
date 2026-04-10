# Nation Group Thailand Design System

Monorepo สำหรับดีไซน์ซิสเท็มกลาง — แยก **โทเค็น** (ใช้ข้าม framework) กับ **ไซต์เอกสาร** (React)

## โครงสร้าง

| โฟลเดอร์ | บทบาท |
|-----------|--------|
| `packages/tokens` | **`@ntgds/tokens`** — `css-variables.css`, `tokens.mjs`, `tokens.json` (สำหรับ React, Next.js, Vue, ฯลฯ) |
| `apps/docs` | **`@ntgds/docs`** — ไซต์ Vite + React (playground / เอกสาร) |
| `ntgds-figma-tokens/` | JSON จาก Figma / Token Press (แหล่งอ้างอิง) |
| `scripts/generate-tokens.mjs` | สร้างไฟล์จาก JSON → แพ็กเกจโทเค็น + ไฟล์ใน `apps/docs` |

## คำสั่ง (รันที่ราก repo)

```bash
npm install
npm run dev          # generate โทเค็น + เปิดไซต์เอกสาร
npm run build
npm run tokens:generate
```

## นำไปใช้ในโปรเจกต์อื่น

ดู **`packages/tokens/README.md`** — ติดตั้งแพ็กเกจ `@ntgds/tokens` แล้ว import CSS และ/หรือ `tokens.mjs`

(การ publish ไป npm registry ยังต้องตั้งค่า scope/เวอร์ชันตามนโยบายทีม)
