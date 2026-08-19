import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) {
      setCustomers(data);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-600 divide-y divide-slate-50">
            {customers.map(customer => (
              <tr key={customer.id}>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {customer.full_name || 'Unnamed User'}
                </td>
                <td className="px-6 py-4">{(customer as any).email || customer.phone || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${customer.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {customer.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
