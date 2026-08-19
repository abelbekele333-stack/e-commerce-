import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*')
    ]);
    
    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      Object.keys(product).forEach(key => {
        setValue(key, product[key as keyof Product]);
      });
      setValue('images', product.images?.join(', '));
    } else {
      reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    // Basic comma separated image URLs for prototype
    const payload = {
      ...data,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity),
      images: data.images ? data.images.split(',').map((u: string) => u.trim()) : [],
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    };

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    
    setIsModalOpen(false);
    fetchData();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Products</h2>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 flex items-center gap-3 font-medium text-slate-900">
                  <div className="w-8 h-8 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                    {product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  {product.name}
                </td>
                <td className="px-6 py-4">₹{Number(product.price || 0).toFixed(2)}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{product.stock_quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {product.is_active ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-900">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input {...register('name', { required: true })} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea {...register('description')} className="w-full border rounded-md px-3 py-2 rows-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input type="number" step="0.01" {...register('price', { required: true })} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input type="number" {...register('stock_quantity', { required: true })} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URLs (comma separated)</label>
                <input {...register('images')} placeholder="https://..., https://..." className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" {...register('is_active')} id="is_active" className="mr-2" />
                <label htmlFor="is_active" className="text-sm font-medium">Is Active (Visible to customers)</label>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
