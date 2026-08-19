export type UserRole = 'admin' | 'customer';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface ShippingRule {
  id: string;
  name: string;
  min_order_value: number;
  max_order_value: number | null;
  cost: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  shipping_address: any;
  billing_address: any;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}
