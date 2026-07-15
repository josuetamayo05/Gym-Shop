import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";
import { Catalog } from "./pages/Catalog";
import { ProductDetail } from "./pages/ProductDetail";
import { ProductShare } from "./pages/ProductShare";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/producto/:slug" element={<ProductDetail />} />
        <Route path="/share/:slug" element={<ProductShare />} />
      </Routes>
      <CartDrawer />
    </BrowserRouter>
  );
}