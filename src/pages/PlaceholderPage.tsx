import { Link, useLocation } from "react-router-dom";
import { findNavItemByPath } from "../site/nav";
import "./PlaceholderPage.css";

export function PlaceholderPage() {
  const { pathname } = useLocation();
  const item = findNavItemByPath(pathname);

  return (
    <article className="doc-article">
      <header className="doc-header">
        <h1 className="doc-title">{item?.label ?? "ไม่พบหน้า"}</h1>
        <p className="doc-lead">
          ส่วนนี้สอดคล้องกับเมนูในไฟล์ Figma Design System — ยังไม่ได้เชื่อมตัวอย่าง
          interactive ในโปรเจกต์นี้ หากต้องการให้ทีมพัฒนาคอมโพเนนต์ถัดไปให้ใช้เมนูนี้เป็นต้นแบบโครงสร้าง
        </p>
      </header>
      <p className="doc-lead">
        <Link to="/">← กลับหน้าแรก</Link>
      </p>
    </article>
  );
}
