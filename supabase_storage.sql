-- 1. Create a Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies
-- Allow public access to read images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow admins to insert new images
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Allow admins to update existing images
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Allow admins to delete images
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
