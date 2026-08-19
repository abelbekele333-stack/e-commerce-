import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

// User Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import CouponsAdmin from './pages/admin/CouponsAdmin';
import CustomersAdmin from './pages/admin/CustomersAdmin';

const Navbar = () => {
  const { user, profile, signOut } = useAuthStore();
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">S</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">LUXEMARKET</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Home</Link>
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Store</Link>
              <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900">About</Link>
              <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900">Contact</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors"
              />
            </div>
            
            <Link to="/cart" className="text-slate-600 hover:text-blue-600 relative transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={profile?.role === 'admin' ? '/admin/products' : '/dashboard'} className="text-slate-600 hover:text-blue-600 transition-colors">
                  <User className="h-6 w-6" />
                </Link>
                <button onClick={() => signOut()} className="text-slate-400 hover:text-red-600 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">S</div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">LUXEMARKET</span>
              </div>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Curating the finest goods for the modern lifestyle. Quality and aesthetic balance in every product.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
                <li><Link to="/" className="hover:text-blue-600">Store</Link></li>
                <li><Link to="/about" className="hover:text-blue-600">About</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Socials</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">Instagram</a></li>
                <li><a href="#" className="hover:text-blue-600">Twitter</a></li>
                <li><a href="#" className="hover:text-blue-600">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} LuxeMarket. All rights reserved.</span>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-900">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, profile, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="p-12 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/" />;
  
  return <>{children}</>;
}

export default function App() {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/checkout" 
            element={<ProtectedRoute><Checkout /></ProtectedRoute>} 
          />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="/admin/products" />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="customers" element={<CustomersAdmin />} />
          <Route path="coupons" element={<CouponsAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
