import { Link } from "react-router-dom";
import { Typography } from "../design-system";
import { NAV_GROUPS, PLAYGROUND_PATHS } from "../site/nav";
import "./HomePage.css";

export function HomePage() {
  return (
    <article className="doc-article">
      <header className="doc-header">
        <h1 className="doc-title">ยินดีต้อนรับสู่ Nation Group Thailand Design System</h1>
        <p className="doc-lead">
          เลือกหัวข้อจากเมนูด้านซ้ายตามโครงสร้างใน Figma (Atoms · Molecules ·
          Organisms · Template) เพื่อดูตัวอย่างหรือหน้า placeholder สำหรับส่วนที่กำลังพัฒนา
        </p>
      </header>

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
                      {item.label}
                      <span className="home-badge">Demo</span>
                    </Link>
                  ) : (
                    <span
                      className="home-link home-link-disabled"
                      aria-disabled="true"
                      title="ยังไม่ได้พัฒนา component นี้"
                    >
                      {item.label}
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
