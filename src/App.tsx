import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Product from './pages/Product';
import Category from './pages/Category';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import AdminFitment from './pages/AdminFitment';
import Search from './pages/Search';
import Comparison from './pages/Comparison';

import { AuthProvider } from './context/AuthContext';
import { useStore } from './store/useStore';

function CatalogueBootstrap() {
  const loadCatalogue = useStore(state => state.loadCatalogue);

  useEffect(() => {
    loadCatalogue().catch((error) => {
      console.error('Catalogue bootstrap failed', error);
    });
  }, [loadCatalogue]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`flex flex-col min-h-screen font-sans text-slate-900 selection:bg-amber-400 pt-0 ${isAdminRoute ? 'bg-slate-100' : 'md:border-[8px] border-slate-900 bg-slate-100'}`}>
      {!isAdminRoute && <Header />}
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/fitment" element={<AdminFitment />} />
          <Route path="/search" element={<Search />} />
          <Route path="/comparison" element={<Comparison />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CatalogueBootstrap />
        <ScrollToTop />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
