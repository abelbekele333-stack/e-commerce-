import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Signup successful! You can now log in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">
        {isSignUp ? 'Create an Account' : 'Welcome Back'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 font-bold hover:underline tracking-wider uppercase text-[10px]"
        >
          {isSignUp ? 'Sign in instead' : 'Sign up now'}
        </button>
      </div>
    </div>
  );
}
