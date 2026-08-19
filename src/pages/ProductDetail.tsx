import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const user = useAuthStore(state => state.user);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(product);
  };

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (!error && data) {
        setProduct(data);
      } else {
        navigate('/');
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug, navigate]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!product) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-slate-100 aspect-square flex items-center justify-center">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-400">No Image Available</div>
          )}
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
          <p className="text-4xl font-extrabold text-slate-900 mb-6">₹{Number(product.price || 0).toFixed(2)}</p>
          
          <div className="prose prose-slate mb-8">
            <p>{product.description || 'No description available for this product.'}</p>
          </div>
          
          <div className="flex items-center space-x-4 mb-8">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${product.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </span>
          </div>

          <button 
            onClick={() => handleAddToCart(product)}
            disabled={product.stock_quantity <= 0}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
