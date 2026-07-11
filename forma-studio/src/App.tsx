import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";
import { Catalog } from "./pages/Catalog";
import { ProductDetail } from "./pages/ProductDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
      </Routes>
      <CartDrawer />
    </BrowserRouter>
  );
}