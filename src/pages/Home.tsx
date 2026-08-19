import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const handleAddToCart = (product: Product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(product);
  };

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-12">Loading products...</div>;

  return (
    <div className="flex flex-col space-y-24 pb-12">
      {/* Hero Section */}
      <section className="bg-slate-900 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800/50 z-10"></div>
        <div className="relative z-20 max-w-3xl px-8 py-24 sm:py-32 sm:px-16 text-left flex flex-col justify-center h-full">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Elevate Your Everyday Essentials.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl">
            Discover a curated collection of premium lifestyle products designed for the modern individual. Quality, design, and utility.
          </p>
          <div>
            <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors inline-flex items-center">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 mt-2">Handpicked selections from our catalog.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
              <Link to={`/product/${product.slug}`} className="block relative h-64 bg-slate-100">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                )}
              </Link>
              <div className="p-5">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="text-lg font-bold text-slate-800 hover:text-blue-600 truncate">{product.name}</h3>
                </Link>
                <p className="text-xl font-extrabold text-slate-900 mt-2">₹{Number(product.price || 0).toFixed(2)}</p>
                <button 
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock_quantity <= 0}
                  className="mt-5 w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 transition-colors"
                >
                  {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              <span className="block text-xl font-medium text-slate-600 mb-2">No products available yet.</span>
              Admins can add products from the dashboard.
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 rounded-2xl p-12 sm:p-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">Join the Luxe Life</h2>
        <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Subscribe to our newsletter for exclusive drops, early access to sales, and insider lifestyle tips.
        </p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors">
          Explore Store
        </button>
      </section>
    </div>
  );
}
