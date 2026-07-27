import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Header } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";

import { Catalog } from "./pages/Catalog";
import { ProductDetail } from "./pages/ProductDetail";
import { ProductShare } from "./pages/ProductShare";
import { ExportAssets } from "./pages/ExportAssets";
import { MobileTools } from "./pages/MobileTools";
import { MobileCollages } from "./pages/MobileCollages";
import { MobileExportTemplates } from "./pages/MobileExportTemplates";
import { AdminLogin } from "./admin/pages/AdminLogin";
import { AdminProducts } from "./admin/pages/AdminProducts";
import { AdminProductEdit } from "./admin/pages/AdminProductEdit";
import { RequireAdmin } from "./admin/RequireAdmin";
import { AdminSeed } from "./admin/pages/AdminSeed";

// ...

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/producto/:slug" element={<ProductDetail />} />
        <Route path="/share/:slug" element={<ProductShare />} />
        <Route path="/export" element={<ExportAssets />} />
        <Route path="/mobile" element={<MobileTools />} />
        <Route path="/mobile-collages" element={<MobileCollages />} />
        <Route path="/mobile-export" element={<MobileExportTemplates />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
        <Route path="/admin/products/new" element={<RequireAdmin><AdminProductEdit /></RequireAdmin>} />
        <Route path="/admin/seed" element={<RequireAdmin><AdminSeed /></RequireAdmin>} />
        <Route path="/admin/products/:id" element={<RequireAdmin><AdminProductEdit /></RequireAdmin>} />
      </Routes>

      <CartDrawer />
    </BrowserRouter>
  );
}