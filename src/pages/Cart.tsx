import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <ShoppingCartIcon className="mx-auto h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-4 flex items-center space-x-4">
              <div className="w-24 h-24 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No img</div>
                )}
              </div>
              
              <div className="flex-grow">
                <Link to={`/product/${item.slug}`} className="text-lg font-semibold text-slate-900 hover:text-blue-600">
                  {item.name}
                </Link>
                <div className="text-blue-600 font-bold mt-1">₹{Number(item.price || 0).toFixed(2)}</div>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-l-md"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock_quantity}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-r-md disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="pl-4 border-l">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 border-b pb-6 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-sm">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span className="text-sm">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xl font-bold text-slate-900 mb-8">
              <span>Estimated Total</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 flex items-center justify-center group transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline SVG component
function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
