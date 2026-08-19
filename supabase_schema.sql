-- Execute this in your Supabase SQL Editor

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- 3. Create Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  images TEXT[], -- array of URLs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are viewable by everyone." ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all products." ON products FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can manage products." ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- 4. Coupons
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_spend DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons." ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons." ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- 5. Shipping Rules
CREATE TABLE shipping_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_order_value DECIMAL(10, 2), -- Null means infinity
  cost DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE shipping_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active shipping rules." ON shipping_rules FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage shipping rules." ON shipping_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- 6. Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  applied_coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders." ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders." ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders." ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- 7. Order Items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- snapshot of name
  price DECIMAL(10, 2) NOT NULL, -- snapshot of price
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items." ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert own order items." ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all order items." ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Seed Initial Admin User (Run this AFTER signing up a user through the UI, replace UUID)
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-UUID';
