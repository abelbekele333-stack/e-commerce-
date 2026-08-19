import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    fetchOrders();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Orders Management</h2>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Customer Details</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-4 font-mono font-bold text-slate-900">{order.id.split('-')[0]}</td>
                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-medium text-slate-800">
                  <div>{order.shipping_address?.fullName}</div>
                  <div className="text-xs text-slate-500 font-normal">{order.shipping_address?.city}, {order.shipping_address?.state}</div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">₹{order.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`border rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500
                      ${order.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                      ${order.status === 'paid' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                      ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    `}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
