import { NavLink, Outlet } from "react-router-dom";
import { Typography } from "../design-system";
import { NAV_GROUPS, PLAYGROUND_PATHS } from "./nav";
import ntgLogo from "../assets/ntg-logo.svg";
import "./DocLayout.css";
import "./DocContent.css";

export function DocLayout() {
  return (
    <div className="doc-shell">
      <header className="doc-topbar">
        <div className="doc-topbar-inner">
          <NavLink
            to="/"
            className="doc-brand"
            aria-label="Nation Group Thailand Design System — หน้าแรก"
          >
            <img
              src={ntgLogo}
              alt=""
              className="doc-brand-logo"
              aria-hidden
            />
            <span className="doc-brand-text">
              <Typography
                group="text"
                styleName="md-semibold"
                as="span"
                className="doc-brand-heading"
              >
                NATION GROUP THAILAND
              </Typography>
              <Typography
                group="text"
                styleName="sm-regular"
                as="span"
                className="doc-brand-subheading"
              >
                Design System Version 1.0.0
              </Typography>
            </span>
          </NavLink>
        </div>
      </header>

      <div className="doc-body">
        <aside className="doc-sidebar" aria-label="เมนูคอมโพเนนต์">
          <nav className="doc-nav">
            {NAV_GROUPS.map((group) => (
              <div key={group.id} className="doc-nav-group">
                <div className="doc-nav-heading">
                  <Typography
                    group="text"
                    styleName="xs-bold"
                    as="span"
                    className="doc-nav-label"
                  >
                    {group.label}
                  </Typography>
                </div>
                <ul className="doc-nav-list">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      {PLAYGROUND_PATHS.has(item.path) ? (
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            isActive ? "doc-nav-link is-active" : "doc-nav-link"
                          }
                          end
                        >
                          {({ isActive }) => (
                            <Typography
                              group="text"
                              styleName={isActive ? "sm-semibold" : "sm-regular"}
                              as="span"
                            >
                              {item.label}
                            </Typography>
                          )}
                        </NavLink>
                      ) : (
                        <span
                          className="doc-nav-link doc-nav-link-disabled"
                          aria-disabled="true"
                          title="ยังไม่ได้พัฒนา component นี้"
                        >
                          <Typography group="text" styleName="sm-regular" as="span">
                            {item.label}
                          </Typography>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="doc-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
