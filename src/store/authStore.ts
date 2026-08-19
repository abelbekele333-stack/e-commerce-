import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { User } from '@supabase/supabase-js';
import { useCartStore } from './cartStore';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        set({ user: session.user, profile, isLoading: false });
      } else {
        set({ user: null, profile: null, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          set({ user: session.user, profile, isLoading: false });
        } else {
          set({ user: null, profile: null, isLoading: false });
          useCartStore.getState().clearCart();
        }
      });
    } catch (error) {
      console.error('Auth init error', error);
      set({ user: null, profile: null, isLoading: false });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
    useCartStore.getState().clearCart();
  }
}));
