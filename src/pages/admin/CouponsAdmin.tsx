import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Coupon } from '../../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  }

  const openModal = (coupon: Coupon | null = null) => {
    setEditingCoupon(coupon);
    if (coupon) {
      Object.keys(coupon).forEach(key => {
        if (key === 'expires_at' && coupon[key]) {
          setValue(key, new Date(coupon[key]).toISOString().split('T')[0]);
        } else {
          setValue(key, coupon[key as keyof Coupon]);
        }
      });
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      code: data.code.toUpperCase(),
      discount_value: parseFloat(data.discount_value),
      min_spend: parseFloat(data.min_spend) || 0,
      max_uses: data.max_uses ? parseInt(data.max_uses) : null,
      expires_at: data.expires_at || null,
      is_active: data.is_active === undefined ? true : data.is_active,
    };
    
    if (editingCoupon) {
      await supabase.from('coupons').update(payload).eq('id', editingCoupon.id);
    } else {
      await supabase.from('coupons').insert([payload]);
    }
    
    setIsModalOpen(false);
    reset();
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await supabase.from('coupons').delete().eq('id', id);
      fetchCoupons();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Coupons & Discounts</h2>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Discount</th>
              <th className="px-6 py-3">Uses</th>
              <th className="px-6 py-3">Expires</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 font-bold text-slate-900">{coupon.code}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[11px] font-bold uppercase tracking-wider">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value.toFixed(2)} OFF`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-800">{coupon.current_uses}</span> {coupon.max_uses ? `/ ${coupon.max_uses}` : '(Unlimited)'}
                </td>
                <td className="px-6 py-4">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-right flex justify-end space-x-3">
                  <button onClick={() => openModal(coupon)} className="text-blue-600 hover:text-blue-900">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <input {...register('code', { required: true })} placeholder="e.g. SUMMER20" className="w-full border rounded-md px-3 py-2 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select {...register('discount_type')} className="w-full border rounded-md px-3 py-2">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input type="number" step="0.01" {...register('discount_value', { required: true })} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Spend (₹)</label>
                  <input type="number" {...register('min_spend')} defaultValue={0} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Uses</label>
                  <input type="number" {...register('max_uses')} placeholder="Unlimited" className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                <input type="date" {...register('expires_at')} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" {...register('is_active')} id="is_active" className="mr-2" />
                <label htmlFor="is_active" className="text-sm font-medium">Is Active</label>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
