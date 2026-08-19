import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Coupon, ShippingRule } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  
  const subtotal = getCartTotal();

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Fetch Shipping Rules
    supabase.from('shipping_rules').select('*').eq('is_active', true)
      .then(({ data }) => {
        if (data) setShippingRules(data);
      });
  }, []);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode) return;
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();
      
    if (error || !data) {
      setCouponError('Invalid coupon code');
      return;
    }
    
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('Coupon has expired');
      return;
    }
    
    if (data.min_spend > subtotal) {
      setCouponError(`Minimum spend of ₹${data.min_spend} required`);
      return;
    }
    
    if (data.max_uses && data.current_uses >= data.max_uses) {
      setCouponError('Coupon limit reached');
      return;
    }
    
    setAppliedCoupon(data);
  };

  // Calculations
  const discount = appliedCoupon 
    ? (appliedCoupon.discount_type === 'percentage' 
        ? (subtotal * appliedCoupon.discount_value) / 100 
        : appliedCoupon.discount_value)
    : 0;
    
  const afterDiscount = subtotal - discount;
  
  const applicableShipping = shippingRules.find(rule => 
    afterDiscount >= rule.min_order_value && 
    (rule.max_order_value === null || afterDiscount < rule.max_order_value)
  );
  
  const shippingCost = applicableShipping ? applicableShipping.cost : 0;
  const tax = afterDiscount * 0.18; // 18% GST Example
  const total = afterDiscount + shippingCost + tax;

  const onSubmit = async (data: any) => {
    if (!user) return;
    setLoading(true);

    try {
      if (paymentMethod === 'cod') {
        // Handle Cash on Delivery (COD)
        const { data: orderData, error: orderError } = await supabase.from('orders').insert({
          user_id: user.id,
          status: 'pending',
          subtotal,
          tax_amount: tax,
          shipping_amount: shippingCost,
          discount_amount: discount,
          total,
          shipping_address: data,
          billing_address: data,
          razorpay_order_id: null,
          razorpay_payment_id: 'COD',
          applied_coupon_id: appliedCoupon?.id
        }).select().single();

        if (orderError) throw orderError;

        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity
        }));
        
        await supabase.from('order_items').insert(orderItems);
        
        if (appliedCoupon) {
          await supabase.from('coupons').update({ 
            current_uses: appliedCoupon.current_uses + 1 
          }).eq('id', appliedCoupon.id);
        }

        clearCart();
        navigate('/dashboard', { state: { message: 'COD Order placed successfully!' } });
        return; // Exit here for COD
      }

      // Handle Online Payment (Razorpay)
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_REPLACE_WITH_KEY',
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'LUXEMARKET',
        description: 'Order Payment',
        handler: async function (response: any) {
          try {
            // Re-fetch current user to ensure session is valid
            const { data: authData } = await supabase.auth.getUser();
            const currentUser = authData?.user;

            if (!currentUser) throw new Error("User session invalid");

            // Save Order to Supabase
            const { data: orderData, error: orderError } = await supabase.from('orders').insert({
              user_id: currentUser.id,
              status: 'paid',
              subtotal,
              tax_amount: tax,
              shipping_amount: shippingCost,
              discount_amount: discount,
              total,
              shipping_address: data,
              billing_address: data,
              razorpay_order_id: response.razorpay_order_id || null,
              razorpay_payment_id: response.razorpay_payment_id,
              applied_coupon_id: appliedCoupon?.id
            }).select().single();

            if (orderError) throw orderError;

            // Save Order Items
            const orderItems = items.map(item => ({
              order_id: orderData.id,
              product_id: item.id,
              product_name: item.name,
              price: item.price,
              quantity: item.quantity
            }));
            
            await supabase.from('order_items').insert(orderItems);
            
            // Update coupon usage
            if (appliedCoupon) {
              await supabase.from('coupons').update({ 
                current_uses: appliedCoupon.current_uses + 1 
              }).eq('id', appliedCoupon.id);
            }

            clearCart();
            navigate('/dashboard', { state: { message: 'Order placed successfully!' } });
          } catch (err) {
            console.error('Order save error:', err);
            alert('Payment successful but order creation failed. Please contact support.');
          }
        },
        prefill: {
          name: data.fullName,
          email: user.email,
          contact: data.phone
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        console.error('Razorpay Error:', response.error);
        alert(`Payment Failed: ${response.error.description || 'Unknown Error'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Checkout Form */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Shipping Information</h2>
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input {...register('fullName', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
              {errors.fullName && <span className="text-red-500 text-xs">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input {...register('phone', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
              {errors.phone && <span className="text-red-500 text-xs">Required</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
            <input {...register('address', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
            {errors.address && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input {...register('city', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input {...register('state', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PIN Code</label>
              <input {...register('pincode', { required: true })} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200 mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="ml-3 block text-sm font-medium text-slate-900">Online Payment (Razorpay)</span>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                />
                <span className="ml-3 block text-sm font-medium text-slate-900">Cash On Delivery (COD)</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-slate-600">{item.name} x {item.quantity}</span>
              <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-b py-6 my-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Discount code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <button 
              onClick={handleApplyCoupon}
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
          
          {appliedCoupon && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({appliedCoupon.code})</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Shipping</span>
            <span className="font-medium">₹{shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax (18% GST)</span>
            <span className="font-medium">₹{tax.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <span className="text-xl font-bold text-slate-900">Total</span>
          <span className="text-2xl font-extrabold text-slate-900">₹{total.toFixed(2)}</span>
        </div>

        <button 
          form="checkout-form"
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : (paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay with Razorpay')}
        </button>
      </div>
    </div>
  );
}
