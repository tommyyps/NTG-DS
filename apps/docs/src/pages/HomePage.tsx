import { Link } from "react-router-dom";
import { Typography } from "../design-system";
import { DocPageHeader } from "../site/DocPageHeader";
import { NAV_GROUPS, PLAYGROUND_PATHS } from "../site/nav";
import "./HomePage.css";

export function HomePage() {
  return (
    <article className="doc-article">
      <DocPageHeader
        title="ยินดีต้อนรับสู่ Nation Group Thailand Design System"
        lead={
          <>
            เลือกหัวข้อจากเมนูด้านซ้ายตามโครงสร้างใน Figma (Atoms · Molecules ·
            Organisms · Template) เพื่อดูตัวอย่างหรือหน้า placeholder สำหรับส่วนที่กำลังพัฒนา
          </>
        }
      />

      <div className="home-grid">
        {NAV_GROUPS.map((group) => (
          <section key={group.id} className="home-card">
            <Typography group="text" styleName="lg-semibold" as="h2">
              {group.label}
            </Typography>
            <ul className="home-link-list">
              {group.items.map((item) => (
                <li key={item.path}>
                  {PLAYGROUND_PATHS.has(item.path) ? (
                    <Link to={item.path} className="home-link">
                      <Typography group="text" styleName="md-regular" as="span">
                        {item.label}
                      </Typography>
                      <Typography
                        group="text"
                        styleName="xs-bold"
                        as="span"
                        className="home-badge"
                      >
                        Demo
                      </Typography>
                    </Link>
                  ) : (
                    <span
                      className="home-link home-link-disabled"
                      aria-disabled="true"
                      title="ยังไม่ได้พัฒนา component นี้"
                    >
                      <Typography group="text" styleName="md-regular" as="span">
                        {item.label}
                      </Typography>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
