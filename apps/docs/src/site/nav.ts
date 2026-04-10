/**
 * เมนูซ้ายตามโครง Design System ใน Figma (Nation Group Thailand)
 * @see https://www.figma.com/design/QgmoT5Uuvv3elB96F4nsTq/Nation-Group-Thailand----Design-System?node-id=0-1&p=f
 */

export type NavItem = {
  path: string;
  label: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "atoms-identity",
    label: "Atoms (Identity)",
    items: [
      { path: "/atoms/color", label: "01 Color" },
      { path: "/atoms/icon", label: "02 Icon" },
      { path: "/atoms/typography", label: "03 Typography" },
      { path: "/atoms/grid", label: "04 Grid" },
      { path: "/atoms/effect", label: "05 Effect" },
      { path: "/atoms/shape", label: "06 Shape" },
      { path: "/atoms/space", label: "07 Space" },
      { path: "/atoms/logo", label: "08 Logo" },
    ],
  },
  {
    id: "molecules-element",
    label: "Molecules (Element)",
    items: [
      { path: "/molecules/frame", label: "09 Frame" },
      { path: "/molecules/avatar", label: "10 Avatar" },
      { path: "/molecules/buttons", label: "11 Buttons" },
      { path: "/molecules/input", label: "12 Input" },
      { path: "/molecules/toggles", label: "13 Toggles" },
      { path: "/molecules/checkbox", label: "14 Checkbox" },
      { path: "/molecules/radio", label: "15 Radio" },
      { path: "/molecules/sliders", label: "16 Sliders" },
      { path: "/molecules/tabs", label: "18 Tabs" },
      { path: "/molecules/toasts-banners", label: "19 Toasts & Banners" },
      { path: "/molecules/tooltips", label: "20 Tooltips" },
      { path: "/molecules/tags", label: "21 Tags" },
      { path: "/molecules/badges", label: "22 Badges" },
      { path: "/molecules/progress-bars", label: "23 Progress Bars" },
      { path: "/molecules/pagination", label: "24 Pagination" },
      { path: "/molecules/dropdowns", label: "25 Dropdowns" },
    ],
  },
  {
    id: "organisms-component",
    label: "Organisms (Component)",
    items: [
      { path: "/organisms/image-carousel", label: "26 Image And Carousel" },
      { path: "/organisms/lists", label: "27 Lists" },
      { path: "/organisms/content", label: "28 Content" },
      { path: "/organisms/panels", label: "29 Panels" },
      { path: "/organisms/dividers", label: "30 Dividers" },
    ],
  },
  {
    id: "template-composition",
    label: "Template (Composition)",
    items: [
      { path: "/template/modals", label: "31 Modals" },
      { path: "/template/sidebars", label: "32 Sidebars" },
      { path: "/template/header", label: "33 Header" },
      { path: "/template/footer", label: "34 Footer" },
      { path: "/template/templates", label: "35 Templates" },
    ],
  },
];

/** เส้นทางที่มีหน้า playground พร้อมใช้งานแล้ว */
export const PLAYGROUND_PATHS = new Set([
  "/atoms/color",
  "/atoms/typography",
  "/molecules/buttons",
  "/molecules/badges",
  "/molecules/frame",
  "/organisms/content",
  "/template/header",
]);

export function findNavItemByPath(pathname: string): NavItem | undefined {
  for (const group of NAV_GROUPS) {
    const hit = group.items.find((item) => item.path === pathname);
    if (hit) return hit;
  }
  return undefined;
}
