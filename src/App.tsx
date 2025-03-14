import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import GoldCalculatorPage from "@/pages/gold-calculator";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<GoldCalculatorPage />} path="/gold-calculator" />
    </Routes>
  );
}

export default App;
