import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, Ticket, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();
  
  const links = [
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders & Refunds', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];
  
  const storeLinks = [
    { name: 'Coupons & Tax', path: '/admin/coupons', icon: Ticket },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex overflow-hidden">
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">S</div>
            <span className="font-bold tracking-tight text-xl">SUPA-CART</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Management</div>
          <div className="px-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isActive && <div className="w-1 h-4 bg-white rounded-full"></div>}
                  {!isActive && <div className="w-1 h-4 opacity-0"></div>}
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          
          <div className="px-4 mt-6 mb-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Storefront</div>
          <div className="px-3 space-y-1">
            {storeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isActive && <div className="w-1 h-4 bg-white rounded-full"></div>}
                  {!isActive && <div className="w-1 h-4 opacity-0"></div>}
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </nav>
        
        <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center uppercase font-bold text-slate-300">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate w-24">{profile?.full_name || 'Admin'}</span>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider">ADMIN_ROOT</span>
            </div>
          </div>
          <button onClick={() => signOut()} className="text-slate-400 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex flex-shrink-0 items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800">
              {location.pathname.includes('products') ? 'Inventory & Product Catalog' : 
               location.pathname.includes('orders') ? 'Orders & Management' : 
               location.pathname.includes('customers') ? 'Customers Management' :
               location.pathname.includes('coupons') ? 'Coupons & Tax Rules' : 'Admin Dashboard'}
            </h2>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">Supabase Live</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-semibold text-slate-500 underline">Razorpay: Ready</span>
            </div>
          </div>
        </header>
        <section className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
