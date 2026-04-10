import { Link, useLocation } from "react-router-dom";
import { Typography } from "../design-system";
import { DocPageHeader } from "../site/DocPageHeader";
import { findNavItemByPath } from "../site/nav";
import "./PlaceholderPage.css";

export function PlaceholderPage() {
  const { pathname } = useLocation();
  const item = findNavItemByPath(pathname);

  return (
    <article className="doc-article">
      <DocPageHeader
        title={item?.label ?? "ไม่พบหน้า"}
        lead={
          <>
            ส่วนนี้สอดคล้องกับเมนูในไฟล์ Figma Design System — ยังไม่ได้เชื่อมตัวอย่าง
            interactive ในโปรเจกต์นี้ หากต้องการให้ทีมพัฒนาคอมโพเนนต์ถัดไปให้ใช้เมนูนี้เป็นต้นแบบโครงสร้าง
          </>
        }
      />
      <Typography group="text" styleName="lg-regular" as="p" className="doc-lead">
        <Link to="/">← กลับหน้าแรก</Link>
      </Typography>
    </article>
  );
}
