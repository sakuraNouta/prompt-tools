import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import IndexPage from '@/pages/index';
import GoldCalculatorPage from '@/pages/gold-calculator';
import { siteConfig } from '@/config/site';

function App() {
  const location = useLocation();

  useEffect(() => {
    const currentRoute = siteConfig.navItems.find(
      (item) => item.href === location.pathname,
    );
    const currentTitle = currentRoute?.label || siteConfig.name;
    const iconPath = currentRoute?.icon || '/toolbox.svg';

    document.title = currentTitle;
    const favicons = document.querySelectorAll('link[rel="icon"]');

    if (favicons) {
      favicons.forEach((favicon) => favicon.setAttribute('href', iconPath));
    }
  }, [location]);

  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<GoldCalculatorPage />} path="/gold-calculator" />
    </Routes>
  );
}

export default App;
