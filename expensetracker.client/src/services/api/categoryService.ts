import { supabase } from '@/lib/supabase';
import type { Category, CreateCategory } from '@/types';

// Helper function to transform database row to Category
const transformCategoryRow = (row: any): Category => {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    isDefault: row.is_default,
    type: row.type ?? 0, // Default to Expense (0) if not set
    parentCategoryId: row.parent_category_id || undefined,
  };
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('Categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('API Error:', error.message);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return (data || []).map(transformCategoryRow);
  },

  async getById(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('Categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('API Error:', error.message);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return transformCategoryRow(data);
  },

  async create(category: CreateCategory): Promise<Category> {
    const { data, error } = await supabase
      .from('Categories')
      .insert({
        name: category.name,
        icon: category.icon,
        color: category.color,
        parent_category_id: category.parentCategoryId,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      console.error('API Error:', error.message);
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return transformCategoryRow(data);
  },

  async update(id: string, category: CreateCategory): Promise<Category> {
    const { data, error } = await supabase
      .from('Categories')
      .update({
        name: category.name,
        icon: category.icon,
        color: category.color,
        parent_category_id: category.parentCategoryId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('API Error:', error.message);
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return transformCategoryRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('Categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('API Error:', error.message);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  },
};
