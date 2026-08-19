import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Order } from '../types';

export default function Dashboard() {
  const { user, profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }
    
    fetchOrders();
  }, [user]);

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Profile Info</h2>
            <div className="space-y-3 text-slate-600">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {profile?.full_name || 'Not provided'}</p>
              <p><strong>Role:</strong> <span className="capitalize bg-slate-100 px-2 py-1 rounded text-xs">{profile?.role}</span></p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Order History</h2>
            
            {orders.length === 0 ? (
              <p className="text-slate-500">You haven't placed any orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-slate-500">Order ID</p>
                        <p className="font-mono text-sm font-medium">{order.id.split('-')[0]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Date</p>
                        <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Amount</p>
                        <p className="font-bold text-slate-900">₹{Number(order.total || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                        `}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
