import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

import Shipping from './pages/info/Shipping';
import Returns from './pages/info/Returns';
import SizeGuide from './pages/info/SizeGuide';
import Faq from './pages/info/Faq';
import Contact from './pages/info/Contact';
import Legal from './pages/info/Legal';
import Privacy from './pages/info/Privacy';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import RequireAuth from './components/RequireAuth';

import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Header />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/catalogue" element={<Catalog />} />
        <Route path="/produit/:idOrSlug" element={<ProductDetail />} />
        <Route path="/panier" element={<Cart />} />
        <Route path="/commande" element={<Checkout />} />
        <Route path="/commande/confirmation/:orderNumber" element={<OrderConfirmation />} />

        {/* Info */}
        <Route path="/livraison" element={<Shipping />} />
        <Route path="/retours" element={<Returns />} />
        <Route path="/guide-tailles" element={<SizeGuide />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<Legal />} />
        <Route path="/confidentialite" element={<Privacy />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="produits" element={<AdminProducts />} />
          <Route path="produits/nouveau" element={<AdminProductEdit />} />
          <Route path="produits/:id" element={<AdminProductEdit />} />
          <Route path="commandes" element={<AdminOrders />} />
          <Route path="commandes/:id" element={<AdminOrderDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}
