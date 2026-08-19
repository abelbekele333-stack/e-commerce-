import { supabase } from './supabase';

/**
 * Uploads a product image to Supabase Storage.
 * @param file The file object from an input element.
 * @returns The public URL of the uploaded image, or null if it fails.
 */
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError.message);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
};

/**
 * Deletes a product image from Supabase Storage using its public URL.
 * @param publicUrl The full public URL of the image.
 */
export const deleteProductImage = async (publicUrl: string): Promise<boolean> => {
  try {
    // Extract the relative path from the public URL
    const pathParts = publicUrl.split('/product-images/');
    if (pathParts.length !== 2) return false;
    
    const filePath = pathParts[1];
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
