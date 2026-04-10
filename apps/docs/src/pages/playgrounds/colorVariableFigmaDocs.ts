/**
 * ลำดับ ชื่อ badge รายละเอียดไทย และอ้างอิง primitive ตามตารางใน Figma
 * (ดึง context จาก MCP get_design_context — border @8559:12089, foreground @8559:13132,
 * backgrounds color @8559:13765 — เฟรม backgrounds color)
 */

import {
  FIGMA_DARK_HEX,
  FIGMA_SEMANTIC_HEX,
  isOpaqueCssColor,
  type VariableRow,
} from "./figmaColorTokens";

export const NTG_DS_FIGMA_FILE = "QgmoT5Uuvv3elB96F4nsTq";

export function figmaDesignSystemUrl(nodeIdWithHyphen: string): string {
  return `https://www.figma.com/design/${NTG_DS_FIGMA_FILE}/Nation-Group-Thailand----Design-System?node-id=${nodeIdWithHyphen}`;
}

export type MainColorCategory = "text" | "border" | "foreground" | "background";

export const MAIN_COLOR_CATEGORY_ORDER: MainColorCategory[] = [
  "text",
  "border",
  "foreground",
  "background",
];

export const MAIN_CATEGORY_LABELS_TH: Record<MainColorCategory, string> = {
  text: "Text — สีข้อความ",
  border: "Border — สีเส้นขอบ",
  foreground: "Foreground — ไอคอนและองค์ประกอบพื้นหน้า (ไม่ใช่ข้อความ)",
  background: "Background — สีพื้นหลัง",
};

export const MAIN_FIGMA_NODE_IDS: Record<
  MainColorCategory,
  { node: string; note?: string }
> = {
  text: {
    node: "8559-13765",
    note:
      "ลิงก์เดิม node 8558-8178 โหลดจาก API ไม่ได้; ตาราง text ในไฟล์จริงอยู่ที่เฟรมนี้ (หัวเฟรมใน Figma อาจชื่อ backgrounds color)",
  },
  border: { node: "8559-12089" },
  foreground: { node: "8559-13132" },
  background: {
    node: "8559-13765",
    note: "เฟรม backgrounds color — ตารางสีพื้นหลัง semantic (Figma MCP)",
  },
};

type DocDef = {
  orderLabel: string;
  badge: string;
  token: string;
  lightRef: string;
  darkRef: string;
  detailTh: string;
  /** ทับค่า dark เมื่อยังไม่มีใน FIGMA_DARK_HEX */
  darkHex?: string;
};

function rowFromDoc(d: DocDef): VariableRow | null {
  const lightHex = FIGMA_SEMANTIC_HEX[d.token];
  if (!lightHex) return null;
  const darkHex =
    d.darkHex ?? FIGMA_DARK_HEX[d.token] ?? null;
  return {
    orderLabel: d.orderLabel,
    token: d.token,
    lightHex,
    darkHex,
    detail: d.detailTh,
    figmaBadge: d.badge,
    lightRef: d.lightRef,
    darkRef: d.darkRef,
  };
}

function buildTable(docs: DocDef[]): VariableRow[] {
  return docs.map(rowFromDoc).filter((r): r is VariableRow => r != null);
}

function docRowOpaque(r: VariableRow): boolean {
  if (!isOpaqueCssColor(r.lightHex)) return false;
  if (
    r.darkHex != null &&
    r.darkHex !== "" &&
    !isOpaqueCssColor(r.darkHex)
  ) {
    return false;
  }
  return true;
}

const TEXT_DOCS: DocDef[] = [
  {
    orderLabel: "1",
    badge: "text-primary",
    token: "color/text/primary/default",
    lightRef: "gray-900",
    darkRef: "gray-50",
    detailTh: "ข้อความหลัก เช่น หัวเรื่องหน้า",
  },
  {
    orderLabel: "1.1",
    badge: "text-primary_on-brand",
    token: "color/text/primary/on-brand",
    lightRef: "white",
    darkRef: "gray-50",
    detailTh:
      "ข้อความหลักเมื่อใช้บนพื้นสีแบรนด์ทึบ ใช้บ่อยในส่วนเว็บที่เป็นแบรนด์ (เช่น แบนเนอร์ CTA)",
  },
  {
    orderLabel: "2",
    badge: "text-secondary",
    token: "color/text/secondary/default",
    lightRef: "gray-700",
    darkRef: "gray-300",
    detailTh: "ข้อความรอง เช่น ป้ายกำกับและหัวข้อย่อย",
  },
  {
    orderLabel: "2.1",
    badge: "text-secondary_hover",
    token: "color/text/secondary/hover",
    lightRef: "gray-800",
    darkRef: "gray-200",
    detailTh: "ข้อความรองในสถานะโฮเวอร์",
  },
  {
    orderLabel: "2.2",
    badge: "text-secondary_on-brand",
    token: "color/text/secondary/on-brand",
    lightRef: "brand-200",
    darkRef: "gray-300",
    detailTh:
      "ข้อความรองเมื่อใช้บนพื้นสีแบรนด์ทึบ ใช้บ่อยในส่วนเว็บที่เป็นแบรนด์ (เช่น แบนเนอร์ CTA)",
  },
  {
    orderLabel: "3",
    badge: "text-tertiary",
    token: "color/text/tertiary/default",
    lightRef: "gray-600",
    darkRef: "gray-400",
    detailTh: "ข้อความระดับที่สาม เช่น ข้อความประกอบและเนื้อหาย่อย",
  },
  {
    orderLabel: "3.1",
    badge: "text-tertiary_hover",
    token: "color/text/tertiary/hover",
    lightRef: "gray-700",
    darkRef: "gray-300",
    detailTh: "ข้อความระดับที่สามในสถานะโฮเวอร์",
  },
  {
    orderLabel: "3.2",
    badge: "text-tertiary_on-brand",
    token: "color/text/tertiary/on-brand",
    lightRef: "brand-200",
    darkRef: "gray-400",
    detailTh:
      "ข้อความระดับที่สามเมื่อใช้บนพื้นสีแบรนด์ทึบ ใช้บ่อยในส่วนเว็บที่เป็นแบรนด์ (เช่น แบนเนอร์ CTA)",
  },
  {
    orderLabel: "4",
    badge: "text-quaternary",
    token: "color/text/quaternary/default",
    lightRef: "gray-500",
    darkRef: "gray-400",
    detailTh:
      "ข้อความระดับที่สี่สำหรับข้อความที่เบาลงและคอนทราสต์ต่ำ เช่น หัวคอลัมน์ในส่วนท้าย",
  },
  {
    orderLabel: "4.1",
    badge: "text-quaternary_hover",
    token: "color/text/quaternary/hover",
    lightRef: "gray-600",
    darkRef: "gray-300",
    detailTh: "ข้อความระดับที่สี่ในสถานะโฮเวอร์",
  },
  {
    orderLabel: "4.2",
    badge: "text-quaternary_on-brand",
    token: "color/text/quaternary/on-brand",
    lightRef: "brand-300",
    darkRef: "gray-400",
    detailTh:
      "ข้อความระดับที่สี่เมื่อใช้บนพื้นสีแบรนด์ทึบ ใช้บ่อยในส่วนเว็บที่เป็นแบรนด์ (เช่น ส่วนท้าย)",
  },
  {
    orderLabel: "5",
    badge: "text-white",
    token: "color/text/system/white",
    lightRef: "white",
    darkRef: "white",
    detailTh: "ข้อความที่เป็นสีขาวเสมอ ไม่ขึ้นกับโหมด",
  },
  {
    orderLabel: "6",
    badge: "text-disabled",
    token: "color/text/system/disabled",
    lightRef: "gray-400",
    darkRef: "gray-500",
    detailTh:
      "สีเริ่มต้นสำหรับข้อความปิดใช้งาน เช่น ช่องกรอกหรือปุ่มที่ปิดใช้งาน — gray-500 ในโหมดมืดอ่านชัดกว่า",
  },
  {
    orderLabel: "6.1",
    badge: "text-disabled_subtle",
    token: "color/text/system/disabled-subtle",
    lightRef: "gray-300",
    darkRef: "gray-600",
    detailTh: "ทางเลือกข้อความปิดใช้งานที่เบาลง (คอนทราสต์ต่ำกว่า)",
  },
  {
    orderLabel: "7",
    badge: "text-placeholder",
    token: "color/text/system/placeholder",
    lightRef: "gray-500",
    darkRef: "gray-400",
    detailTh:
      "สีเริ่มต้นสำหรับข้อความตัวอย่างในช่องกรอก — gray-500 อ่านง่ายกว่าเพราะคอนทราสต์สูงกว่า",
  },
  {
    orderLabel: "7.1",
    badge: "text-placeholder_subtle",
    token: "color/text/system/placeholder-subtle",
    lightRef: "gray-300",
    darkRef: "gray-700",
    detailTh:
      "ทางเลือกข้อความตัวอย่างที่เบาลง เหมาะกับคอมโพเนนต์เช่น ช่องกรอกรหัสยืนยัน",
  },
  {
    orderLabel: "8",
    badge: "text-brand-primary",
    token: "color/text/brand/primary",
    lightRef: "brand-900",
    darkRef: "gray-50",
    detailTh:
      "ข้อความแบรนด์ระดับหลักสำหรับหัวเรื่อง (เช่น การ์ดในส่วนหน้าราคา) — hex ใน snapshot อาจต่างจากชื่อ primitive",
  },
  {
    orderLabel: "9",
    badge: "text-brand-secondary",
    token: "color/text/brand/secondary",
    lightRef: "brand-500",
    darkRef: "brand-500",
    detailTh:
      "ข้อความแบรนด์ระดับรองสำหรับจุดเน้นและหัวเรื่องย่อย (เช่น หัวเรื่องย่อยในการตัดบทความ)",
  },
  {
    orderLabel: "10",
    badge: "text-brand-tertiary",
    token: "color/text/brand/tertiary",
    lightRef: "brand-400",
    darkRef: "brand-500",
    detailTh:
      "ข้อความแบรนด์ระดับที่สามสำหรับจุดเน้นที่เบาลง (เช่น ตัวเลขในพาร์ตเมตริก)",
  },
  {
    orderLabel: "10.1",
    badge: "text-brand-tertiary_alt",
    token: "color/text/brand/tertiary-alt",
    lightRef: "brand-600",
    darkRef: "gray-50",
    detailTh:
      "ทางเลือกของข้อความแบรนด์ระดับที่สามที่เบาลงในโหมดมืด (เช่น ตัวเลขในพาร์ตเมตริก)",
  },
  {
    orderLabel: "11",
    badge: "text-error-primary",
    token: "color/text/system/error",
    lightRef: "error-600",
    darkRef: "error-400",
    detailTh:
      "สีข้อความแจ้งความหมายสำหรับสถานะข้อผิดพลาด (เช่น ช่องกรอกที่มีข้อผิดพลาด)",
  },
  {
    orderLabel: "11.1",
    badge: "text-error-primary_hover",
    token: "color/text/system/error-hover",
    lightRef: "error-700",
    darkRef: "error-300",
    detailTh: "สถานะโฮเวอร์ของข้อความแจ้งข้อผิดพลาด",
  },
  {
    orderLabel: "12",
    badge: "text-warning-primary",
    token: "color/text/system/warning",
    lightRef: "warning-600",
    darkRef: "warning-400",
    detailTh: "สีข้อความแจ้งความหมายสำหรับสถานะคำเตือน",
  },
  {
    orderLabel: "12.1",
    badge: "text-warning-primary_hover",
    token: "color/text/system/warning-hover",
    lightRef: "warning-700",
    darkRef: "warning-300",
    detailTh: "สถานะโฮเวอร์ของข้อความแจ้งคำเตือน",
  },
  {
    orderLabel: "13",
    badge: "text-success-primary",
    token: "color/text/system/success",
    lightRef: "success-600",
    darkRef: "success-400",
    detailTh: "สีข้อความแจ้งความหมายสำหรับสถานะสำเร็จ",
  },
  {
    orderLabel: "13.1",
    badge: "text-success-primary_hover",
    token: "color/text/system/success-hover",
    lightRef: "success-700",
    darkRef: "success-300",
    detailTh: "สถานะโฮเวอร์ของข้อความแจ้งความสำเร็จ",
  },
];

const BORDER_DOCS: DocDef[] = [
  {
    orderLabel: "1",
    badge: "border-primary",
    token: "color/border/general/primary",
    lightRef: "gray-300",
    darkRef: "gray-700",
    detailTh:
      "เส้นขอบคอนทราสต์สูง ใช้กับคอมโพเนนต์เช่น ช่องกรอก กลุ่มปุ่ม และช่องทำเครื่องหมาย",
  },
  {
    orderLabel: "2",
    badge: "border-secondary",
    token: "color/border/general/secondary",
    lightRef: "gray-200",
    darkRef: "gray-800",
    detailTh:
      "เส้นขอบคอนทราสต์ปานกลาง ใช้บ่อยที่สุด เป็นค่าเริ่มต้นของคอมโพเนนต์ส่วนใหญ่ (เช่น อัปโหลดไฟล์ การ์ดตาราง และตัวแบ่งเนื้อหา)",
  },
  {
    orderLabel: "3",
    badge: "border-tertiary",
    token: "color/border/general/tertiary",
    lightRef: "gray-100",
    darkRef: "gray-800",
    detailTh:
      "เส้นขอบคอนทราสต์ต่ำสำหรับตัวแบ่งที่ละเอียดมาก เช่น แกนของกราฟเส้นหรือแท่ง",
  },
  {
    orderLabel: "4",
    badge: "border-disabled",
    token: "color/border/system/disabled",
    lightRef: "gray-300",
    darkRef: "gray-700",
    detailTh:
      "สีเส้นขอบเริ่มต้นสำหรับสถานะปิดใช้งาน เช่น ช่องกรอกและช่องทำเครื่องหมาย",
  },
  {
    orderLabel: "4.1",
    badge: "border-disabled_subtle",
    token: "color/border/system/disabled-subtle",
    lightRef: "gray-200",
    darkRef: "gray-800",
    detailTh:
      "ทางเลือกเส้นขอบปิดใช้งานที่เบาลง (คอนทราสต์ต่ำกว่า) เช่น ปุ่มที่ปิดใช้งาน",
  },
  {
    orderLabel: "5",
    badge: "border-brand",
    token: "color/border/brand/default",
    lightRef: "brand-300",
    darkRef: "brand-400",
    detailTh:
      "สีเส้นขอบแบรนด์เริ่มต้น เหมาะกับสถานะกำลังใช้งาน เช่น ช่องกรอกที่โฟกัส",
  },
  {
    orderLabel: "6",
    badge: "border-brand-solid",
    token: "color/border/brand/solid",
    lightRef: "brand-600",
    darkRef: "brand-500",
    detailTh:
      "สีเส้นขอบแบรนด์ทึบ (เข้ม) เหมาะกับสถานะกำลังใช้งาน เช่น ช่องทำเครื่องหมายที่เลือก",
  },
  {
    orderLabel: "6.1",
    badge: "border-brand-solid_alt",
    token: "color/border/brand/solid-alt",
    lightRef: "brand-600",
    darkRef: "brand-700",
    detailTh:
      "ทางเลือกเส้นขอบแบรนด์ทึบที่เปลี่ยนเป็นเทาในโหมดมืด เหมาะกับรายการเมตริกหรือคำคม",
  },
  {
    orderLabel: "7",
    badge: "border-error",
    token: "color/border/system/error",
    lightRef: "error-300",
    darkRef: "error-400",
    detailTh: "สีเส้นขอบเชิงความหมายสำหรับข้อผิดพลาด เช่น ช่องกรอก",
  },
  {
    orderLabel: "8",
    badge: "border-error-solid",
    token: "color/border/system/error-solid",
    lightRef: "error-600",
    darkRef: "error-500",
    detailTh: "สีเส้นขอบทึบสำหรับข้อผิดพลาด เช่น อัปโหลดไฟล์",
  },
  {
    orderLabel: "8.1",
    badge: "border-error-solid-hover",
    token: "color/border/system/error-solid-hover",
    lightRef: "error-700",
    darkRef: "error-400",
    detailTh: "สถานะโฮเวอร์ของเส้นขอบทึบข้อผิดพลาด",
  },
  {
    orderLabel: "9",
    badge: "border-warning",
    token: "color/border/system/warning",
    lightRef: "warning-300",
    darkRef: "warning-400",
    detailTh:
      "สีเส้นขอบเชิงความหมายสำหรับคำเตือน (ใน Figma ป้าย primitive บางแถวอาจคัดลักผิดเป็น error)",
  },
  {
    orderLabel: "10",
    badge: "border-warning-solid",
    token: "color/border/system/warning-solid",
    lightRef: "warning-600",
    darkRef: "warning-500",
    detailTh: "สีเส้นขอบทึบสำหรับคำเตือน เช่น อัปโหลดไฟล์",
  },
  {
    orderLabel: "10.1",
    badge: "border-warning-solid-hover",
    token: "color/border/system/warning-solid-hover",
    lightRef: "warning-700",
    darkRef: "warning-400",
    detailTh: "สถานะโฮเวอร์ของเส้นขอบทึบคำเตือน",
  },
  {
    orderLabel: "11",
    badge: "border-success",
    token: "color/border/system/success",
    lightRef: "success-300",
    darkRef: "success-400",
    detailTh:
      "สีเส้นขอบเชิงความหมายสำหรับความสำเร็จ (ชื่อเฟรมใน Figma สะกด success ผิดเป็น seccess)",
  },
  {
    orderLabel: "12",
    badge: "border-success-solid",
    token: "color/border/system/success-solid",
    lightRef: "success-600",
    darkRef: "success-500",
    detailTh: "สีเส้นขอบทึบสำหรับความสำเร็จ เช่น อัปโหลดไฟล์",
  },
  {
    orderLabel: "12.1",
    badge: "border-success-solid-hover",
    token: "color/border/system/success-solid-hover",
    lightRef: "success-700",
    darkRef: "success-400",
    detailTh: "สถานะโฮเวอร์ของเส้นขอบทึบความสำเร็จ",
  },
];

/** fg-* ใน Figma — path ใน export ตรงกับ color/foreground/* (ไม่มี color/icon/* ใน semantics snapshot) */
const FOREGROUND_DOCS: DocDef[] = [
  {
    orderLabel: "1",
    badge: "fg-primary",
    token: "color/foreground/primary/default",
    lightRef: "gray-900",
    darkRef: "white",
    detailTh:
      "องค์ประกอบพื้นหน้า (ไม่ใช่ข้อความ) คอนทราสต์สูงสุด เช่น ไอคอน",
  },
  {
    orderLabel: "2",
    badge: "fg-secondary",
    token: "color/foreground/secondary/default",
    lightRef: "gray-700",
    darkRef: "gray-300",
    detailTh:
      "องค์ประกอบพื้นหน้า (ไม่ใช่ข้อความ) คอนทราสต์สูง เช่น ไอคอน",
  },
  {
    orderLabel: "2.1",
    badge: "fg-secondary_hover",
    token: "color/foreground/secondary/hover",
    lightRef: "gray-800",
    darkRef: "gray-200",
    detailTh: "องค์ประกอบพื้นหน้าระดับรองในสถานะโฮเวอร์",
  },
  {
    orderLabel: "3",
    badge: "fg-tertiary",
    token: "color/foreground/tertiary/default",
    lightRef: "gray-600",
    darkRef: "gray-400",
    detailTh:
      "องค์ประกอบพื้นหน้า (ไม่ใช่ข้อความ) คอนทราสต์ปานกลาง เช่น ไอคอน",
  },
  {
    orderLabel: "3.1",
    badge: "fg-tertiary_hover",
    token: "color/foreground/tertiary/hover",
    lightRef: "gray-700",
    darkRef: "gray-300",
    detailTh: "องค์ประกอบพื้นหน้าระดับที่สามในสถานะโฮเวอร์",
  },
  {
    orderLabel: "4",
    badge: "fg-quaternary",
    token: "color/foreground/quaternary/default",
    lightRef: "gray-500",
    darkRef: "gray-400",
    detailTh:
      "องค์ประกอบพื้นหน้า (ไม่ใช่ข้อความ) คอนทราสต์ปานกลาง–ต่ำ เช่น ไอคอน",
  },
  {
    orderLabel: "4.1",
    badge: "fg-quaternary_hover",
    token: "color/foreground/quaternary/hover",
    lightRef: "gray-600",
    darkRef: "gray-300",
    detailTh: "องค์ประกอบพื้นหน้าระดับที่สี่ในสถานะโฮเวอร์",
  },
  {
    orderLabel: "5",
    badge: "fg-quinary",
    token: "color/foreground/quinary/default",
    lightRef: "gray-400",
    darkRef: "gray-500",
    detailTh:
      "องค์ประกอบพื้นหน้า (ไม่ใช่ข้อความ) คอนทราสต์ต่ำ เช่น ไอคอนช่วยเหลือ",
  },
  {
    orderLabel: "5.1",
    badge: "fg-quinary_hover",
    token: "color/foreground/quinary/hover",
    lightRef: "gray-500",
    darkRef: "gray-400",
    detailTh:
      "องค์ประกอบพื้นหน้าระดับที่ห้าในสถานะโฮเวอร์ เช่น ไอคอนช่วยเหลือ",
  },
  {
    orderLabel: "6",
    badge: "fg-senary",
    token: "color/foreground/senary/default",
    lightRef: "gray-300",
    darkRef: "gray-600",
    detailTh:
      "องค์ประกอบพื้นหน้า (ไม่ใช่ข้อความ) คอนทราสต์ต่ำสุด เช่น ตัวแบ่ง breadcrumb หรือแผนที่เวกเตอร์ ใช้เท่าที่จำเป็น",
  },
  {
    orderLabel: "7",
    badge: "fg-disabled",
    token: "color/foreground/system/disabled",
    lightRef: "gray-400",
    darkRef: "gray-500",
    detailTh:
      "สีเริ่มต้นสำหรับองค์ประกอบพื้นหน้าที่ปิดใช้งาน เช่น ไอคอนในกลุ่มปุ่มหรือรายการเมนูดรอปดาวน์",
  },
  {
    orderLabel: "7.1",
    badge: "fg-disabled_subtle",
    token: "color/foreground/system/disabled-subtle",
    lightRef: "gray-300",
    darkRef: "gray-600",
    detailTh:
      "ทางเลือกที่เบาลงสำหรับองค์ประกอบพื้นหน้าที่ปิดใช้งาน (ไม่ใช่ข้อความ) เช่น ช่องทำเครื่องหมายที่เลือกแต่ปิดใช้งาน",
  },
  {
    orderLabel: "8",
    badge: "fg-white",
    token: "color/foreground/system/white",
    lightRef: "white",
    darkRef: "white",
    detailTh: "องค์ประกอบพื้นหน้าที่เป็นสีขาวเสมอ ไม่ขึ้นกับโหมด",
  },
  {
    orderLabel: "9",
    badge: "fg-brand-primary",
    token: "color/foreground/brand/primary",
    lightRef: "brand-600",
    darkRef: "brand-500",
    detailTh:
      "องค์ประกอบพื้นหน้าสีแบรนด์หลัก (ไม่ใช่ข้อความ) เช่น ไอคอนเด่นหรือแถบความคืบหน้า",
  },
  {
    orderLabel: "9.1",
    badge: "fg-brand-primary_alt",
    token: "color/foreground/brand/primary-alt",
    lightRef: "brand-600",
    darkRef: "gray-300",
    detailTh:
      "ทางเลือกสีแบรนด์หลักสำหรับพื้นหน้า (ไม่ใช่ข้อความ) ที่เปลี่ยนเป็นเทาในโหมดมืด เช่น เส้นแถบแนวนอนที่กำลังใช้งาน",
  },
  {
    orderLabel: "10",
    badge: "fg-brand-secondary",
    token: "color/foreground/brand/secondary",
    lightRef: "brand-500",
    darkRef: "brand-500",
    detailTh:
      "สีแบรนด์รองสำหรับพื้นหน้า (ไม่ใช่ข้อความ) เช่น จุดเน้นและลูกศรในส่วนมาร์เก็ตติ้ง (เช่น ฮีโร่)",
  },
  {
    orderLabel: "11",
    badge: "fg-error-primary",
    token: "color/foreground/system/error-primary",
    lightRef: "error-600",
    darkRef: "error-500",
    detailTh:
      "สีข้อผิดพลาดหลักสำหรับพื้นหน้า (ไม่ใช่ข้อความ) เช่น ไอคอนเด่น",
  },
  {
    orderLabel: "12",
    badge: "fg-error-secondary",
    token: "color/foreground/system/error-secondary",
    lightRef: "error-500",
    darkRef: "error-400",
    detailTh:
      "สีข้อผิดพลาดรองสำหรับพื้นหน้า (ไม่ใช่ข้อความ) เช่น ไอคอนในสถานะผิดพลาดหรือกราฟิกเชิงลบ",
  },
  {
    orderLabel: "13",
    badge: "fg-warning-primary",
    token: "color/foreground/system/warning-primary",
    lightRef: "warning-600",
    darkRef: "warning-500",
    detailTh:
      "สีคำเตือนหลักสำหรับพื้นหน้า (ไม่ใช่ข้อความ) เช่น ไอคอนเด่น",
  },
  {
    orderLabel: "14",
    badge: "fg-warning-secondary",
    token: "color/foreground/system/warning-secondary",
    lightRef: "warning-500",
    darkRef: "warning-400",
    detailTh: "สีคำเตือนรองสำหรับพื้นหน้า (ไม่ใช่ข้อความ)",
  },
  {
    orderLabel: "15",
    badge: "fg-success-primary",
    token: "color/foreground/system/success-primary",
    lightRef: "success-600",
    darkRef: "success-500",
    detailTh:
      "สีความสำเร็จหลักสำหรับพื้นหน้า (ไม่ใช่ข้อความ) เช่น ไอคอนเด่น",
  },
  {
    orderLabel: "16",
    badge: "fg-success-secondary",
    token: "color/foreground/system/success-secondary",
    lightRef: "success-500",
    darkRef: "success-400",
    detailTh:
      "สีความสำเร็จรองสำหรับพื้นหน้า (ไม่ใช่ข้อความ) เช่น จุดบนปุ่ม จุดอ่อนในมิติตัวหาร หรือกราฟิกเชิงบวก",
  },
];

/**
 * ตาราง backgrounds color — Figma node 8559:13765 (ข้ามแถวที่ badge ซ้ำ bg-primary-solid กับแถว primary/solid)
 */
const BACKGROUND_DOCS: DocDef[] = [
  {
    orderLabel: "1",
    badge: "bg-primary",
    token: "color/background/primary/default",
    lightRef: "white",
    darkRef: "gray-950",
    detailTh:
      "สีพื้นหลัก (ขาว) ใช้ทั่วเลย์เอาต์และคอมโพเนนต์",
  },
  {
    orderLabel: "1.1",
    badge: "bg-primary_alt",
    token: "color/background/primary/alt",
    lightRef: "white",
    darkRef: "gray-900",
    detailTh:
      "ทางเลือกพื้นหลัก (ขาว) ที่เปลี่ยนเป็น bg-secondary ในโหมดมืด",
  },
  {
    orderLabel: "1.2",
    badge: "bg-primary_hover",
    token: "color/background/primary/hover",
    lightRef: "gray-50",
    darkRef: "gray-800",
    detailTh:
      "สีพื้นหลักเมื่อโฮเวอร์ เป็นค่าเริ่มต้นสำหรับคอมโพเนนต์ที่พื้นขาว (เช่น รายการเมนูดรอปดาวน์)",
  },
  {
    orderLabel: "2",
    badge: "bg-primary-solid",
    token: "color/background/primary/solid",
    lightRef: "gray-950",
    darkRef: "gray-900",
    detailTh:
      "พื้นหลักเข้มหลัก เปลี่ยนเป็น bg-secondary ในโหมดมืด เหมาะกับทูลทิปหรือแก้ว WYSIWYG",
  },
  {
    orderLabel: "3",
    badge: "bg-secondary",
    token: "color/background/secondary/default",
    lightRef: "gray-light-50",
    darkRef: "gray-dark-900",
    detailTh:
      "พื้นรองสำหรับสร้างคอนทราสต์กับพื้นขาว เช่น พื้นของแต่ละส่วนเว็บ",
  },
  {
    orderLabel: "3.1",
    badge: "bg-secondary_alt",
    token: "color/background/secondary/alt",
    lightRef: "gray-light-50",
    darkRef: "gray-dark-950",
    detailTh:
      "ทางเลือกพื้นหลัก (ขาว) ที่เปลี่ยนเป็น bg-primary ในโหมดมืด",
  },
  {
    orderLabel: "3.2",
    badge: "bg-secondary_hover",
    token: "color/background/secondary/hover",
    lightRef: "gray-100",
    darkRef: "gray-800",
    detailTh:
      "สีพื้นรองเมื่อโฮเวอร์ เหมาะกับคอมโพเนนต์บนพื้นเทา 50 เช่น รายการนำทางหรือตัวเลือกวันที่",
  },
  {
    orderLabel: "3.3",
    badge: "bg-secondary_subtle",
    token: "color/background/secondary/subtle",
    lightRef: "gray-25",
    darkRef: "gray-900",
    detailTh:
      "ทางเลือกพื้นรองที่เบาลงเล็กน้อยในโหมดสว่าง เหมาะกับแบนเนอร์",
  },
  {
    orderLabel: "4",
    badge: "bg-secondary-solid",
    token: "color/background/secondary/solid",
    lightRef: "gray-600",
    darkRef: "gray-600",
    detailTh: "พื้นเข้มรอง ใช้ทั่วเลย์เอาต์ เหมาะกับไอคอนเด่น",
  },
  {
    orderLabel: "5",
    badge: "bg-tertiary",
    token: "color/background/tertiary/default",
    lightRef: "gray-100",
    darkRef: "gray-800",
    detailTh:
      "พื้นระดับที่สามสำหรับคอนทราสต์กับพื้นสว่าง เช่น สวิตช์",
  },
  {
    orderLabel: "6",
    badge: "bg-quaternary",
    token: "color/background/quaternary/default",
    lightRef: "gray-200",
    darkRef: "gray-700",
    detailTh:
      "พื้นระดับที่สี่สำหรับคอนทราสต์กับพื้นสว่าง เช่น สไลเดอร์หรือแถบความคืบหน้า",
  },
  {
    orderLabel: "7",
    badge: "bg-active",
    token: "color/background/system/active",
    lightRef: "gray-50",
    darkRef: "gray-800",
    detailTh:
      "สีพื้นเมื่อกำลังใช้งาน เช่น รายการที่เลือกในเมนูดรอปดาวน์",
  },
  {
    orderLabel: "8",
    badge: "bg-disabled",
    token: "color/background/system/disabled",
    lightRef: "gray-100",
    darkRef: "gray-800",
    detailTh:
      "สีพื้นเมื่อปิดใช้งาน เช่น ปุ่มหลักหรือสวิตช์ที่ปิดใช้งาน",
  },
  {
    orderLabel: "8.1",
    badge: "bg-disabled_subtle",
    token: "color/background/system/disabled-subtle",
    lightRef: "gray-50",
    darkRef: "gray-900",
    detailTh:
      "ทางเลือกพื้นปิดใช้งานที่เบาลง เหมาะกับช่องกรอกหรือช่องทำเครื่องหมายที่ปิดใช้งาน",
  },
  {
    orderLabel: "9",
    badge: "bg-overlay",
    token: "color/background/system/overlay",
    lightRef: "gray-950",
    darkRef: "gray-800",
    detailTh: "สีพื้นสำหรับเลเยอร์ทับ เช่น โมดัล",
  },
  {
    orderLabel: "10",
    badge: "bg-brand-primary",
    token: "color/background/brand/primary",
    lightRef: "brand-50",
    darkRef: "brand-500",
    detailTh: "พื้นสีแบรนด์หลัก เหมาะกับไอคอนเครื่องหมายถูก",
  },
  {
    orderLabel: "10.1",
    badge: "bg-brand-primary_alt",
    token: "color/background/brand/primary-alt",
    lightRef: "brand-50",
    darkRef: "gray-800",
    detailTh:
      "ทางเลือกพื้นแบรนด์หลักที่เปลี่ยนเป็น bg-secondary ในโหมดมืด เช่น แท็บแนวนอนที่ใช้งาน",
  },
  {
    orderLabel: "11",
    badge: "bg-brand-secondary",
    token: "color/background/brand/secondary",
    lightRef: "brand-100",
    darkRef: "brand-600",
    detailTh: "พื้นสีแบรนด์รอง เหมาะกับไอคอนเด่น",
  },
  {
    orderLabel: "12",
    badge: "bg-brand-solid",
    token: "color/background/brand/solid",
    lightRef: "brand-600",
    darkRef: "brand-600",
    detailTh:
      "พื้นแบรนด์ทึบ (เข้ม) เหมาะกับสวิตช์หรือข้อความแจ้งเตือน",
  },
  {
    orderLabel: "12.1",
    badge: "bg-brand-solid_hover",
    token: "color/background/brand/solid-hover",
    lightRef: "brand-700",
    darkRef: "brand-500",
    detailTh: "พื้นแบรนด์ทึบเมื่อโฮเวอร์ เช่น สวิตช์",
  },
  {
    orderLabel: "13",
    badge: "bg-brand-section",
    token: "color/background/brand/section",
    lightRef: "brand-800",
    darkRef: "gray-800",
    detailTh:
      "พื้นแบรนด์เข้มเริ่มต้นสำหรับส่วนเว็บเช่น CTA หรือเสียงชม เปลี่ยนเป็น bg-secondary ในโหมดมืด",
  },
  {
    orderLabel: "13.1",
    badge: "bg-brand-section_subtle",
    token: "color/background/brand/section-subtle",
    lightRef: "brand-700",
    darkRef: "gray-950",
    detailTh:
      "ทางเลือกพื้นส่วนแบรนด์เพื่อคอนทราสต์ เช่น FAQ เปลี่ยนเป็น bg-primary ในโหมดมืด",
  },
  {
    orderLabel: "14",
    badge: "bg-error-primary",
    token: "color/background/system/error-primary",
    lightRef: "error-50",
    darkRef: "error-500",
    detailTh: "สีพื้นหลักสถานะข้อผิดพลาดหลัก",
  },
  {
    orderLabel: "15",
    badge: "bg-error-secondary",
    token: "color/background/system/error-secondary",
    lightRef: "error-100",
    darkRef: "error-600",
    detailTh: "สีพื้นรองสถานะข้อผิดพลาด",
  },
  {
    orderLabel: "16",
    badge: "bg-error-solid",
    token: "color/background/system/error-solid",
    lightRef: "error-600",
    darkRef: "error-600",
    detailTh: "สีพื้นทึบสถานะข้อผิดพลาด",
  },
  {
    orderLabel: "16.1",
    badge: "bg-error-solid_hover",
    token: "color/background/system/error-solid-hover",
    lightRef: "error-700",
    darkRef: "error-500",
    detailTh: "สีพื้นทึบเมื่อโฮเวอร์ของสถานะข้อผิดพลาด",
  },
  {
    orderLabel: "17",
    badge: "bg-warning-primary",
    token: "color/background/system/warning-primary",
    lightRef: "warning-50",
    darkRef: "warning-500",
    detailTh: "สีพื้นหลักสถานะคำเตือนหลัก",
  },
  {
    orderLabel: "18",
    badge: "bg-warning-secondary",
    token: "color/background/system/warning-secondary",
    lightRef: "warning-100",
    darkRef: "warning-600",
    detailTh: "สีพื้นรองสถานะคำเตือน",
  },
  {
    orderLabel: "19",
    badge: "bg-warning-solid",
    token: "color/background/system/warning-solid",
    lightRef: "warning-600",
    darkRef: "warning-600",
    detailTh: "สีพื้นทึบสถานะคำเตือน",
  },
  {
    orderLabel: "19.1",
    badge: "bg-warning-solid_hover",
    token: "color/background/system/warning-solid-hover",
    lightRef: "warning-700",
    darkRef: "warning-500",
    detailTh: "สีพื้นทึบเมื่อโฮเวอร์ของสถานะคำเตือน",
  },
  {
    orderLabel: "20",
    badge: "bg-success-primary",
    token: "color/background/system/success-primary",
    lightRef: "success-50",
    darkRef: "success-500",
    detailTh: "สีพื้นหลักสถานะสำเร็จ",
  },
  {
    orderLabel: "21",
    badge: "bg-success-secondary",
    token: "color/background/system/success-secondary",
    lightRef: "success-100",
    darkRef: "success-600",
    detailTh: "สีพื้นรองสถานะสำเร็จ",
  },
  {
    orderLabel: "22",
    badge: "bg-success-solid",
    token: "color/background/system/success-solid",
    lightRef: "success-600",
    darkRef: "success-600",
    detailTh: "สีพื้นทึบสถานะสำเร็จ",
  },
  {
    orderLabel: "22.1",
    badge: "bg-success-solid_hover",
    token: "color/background/system/success-solid-hover",
    lightRef: "success-700",
    darkRef: "success-500",
    detailTh: "สีพื้นทึบเมื่อโฮเวอร์ของสถานะสำเร็จ",
  },
];

function buildBackgroundDocs(): DocDef[] {
  return BACKGROUND_DOCS.filter((d) => FIGMA_SEMANTIC_HEX[d.token]);
}

/** ตารางหลัก 4 ประเภทตามเอกสาร Figma — ลำดับและรายละเอียดไทยจากไฟล์ดีไซน์ */
export function buildMainColorVariableRows(): Record<
  MainColorCategory,
  VariableRow[]
> {
  return {
    text: buildTable(TEXT_DOCS).filter(docRowOpaque),
    border: buildTable(BORDER_DOCS).filter(docRowOpaque),
    foreground: buildTable(FOREGROUND_DOCS).filter(docRowOpaque),
    background: buildTable(buildBackgroundDocs()).filter(docRowOpaque),
  };
}
