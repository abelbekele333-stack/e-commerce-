import { supabase } from './supabase';
import { Product } from '../types';

export type ProductInput = Omit<Product, 'id' | 'created_at'>;

/**
 * Creates a new product in the database.
 */
export const createProduct = async (productData: ProductInput): Promise<Product | null> => {
  try {
    // Generate slug from name if not provided correctly
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const payload = {
      ...productData,
      slug
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Updates an existing product.
 */
export const updateProduct = async (productId: string, updates: Partial<ProductInput>): Promise<Product | null> => {
  try {
    const payload = { ...updates };
    
    // Auto-update slug if name changes
    if (payload.name) {
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Deletes a product entirely.
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
