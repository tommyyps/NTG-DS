import { Navigate, Route, Routes } from "react-router-dom";
import { DocLayout } from "./site/DocLayout";
import { NAV_GROUPS, PLAYGROUND_PATHS } from "./site/nav";
import { HomePage } from "./pages/HomePage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { ColorPlayground } from "./pages/playgrounds/ColorPlayground";
import { TypographyPlayground } from "./pages/playgrounds/TypographyPlayground";
import { ButtonPlayground } from "./pages/playgrounds/ButtonPlayground";
import { BadgePlayground } from "./pages/playgrounds/BadgePlayground";
import { CardPlayground } from "./pages/playgrounds/CardPlayground";
import { StackPlayground } from "./pages/playgrounds/StackPlayground";
import { HeroPlayground } from "./pages/playgrounds/HeroPlayground";

function App() {
  const placeholderPaths = NAV_GROUPS.flatMap((g) => g.items).filter(
    (item) => !PLAYGROUND_PATHS.has(item.path),
  );

  return (
    <Routes>
      <Route element={<DocLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/atoms/color" element={<ColorPlayground />} />
        <Route path="/atoms/typography" element={<TypographyPlayground />} />
        <Route path="/molecules/buttons" element={<ButtonPlayground />} />
        <Route path="/molecules/badges" element={<BadgePlayground />} />
        <Route path="/molecules/frame" element={<StackPlayground />} />
        <Route path="/organisms/content" element={<CardPlayground />} />
        <Route path="/template/header" element={<HeroPlayground />} />
        {placeholderPaths.map((item) => (
          <Route
            key={item.path}
            path={item.path}
            element={<PlaceholderPage />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
