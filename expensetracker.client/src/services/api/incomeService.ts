import { supabase } from '@/lib/supabase';
import type { Income, CreateIncome, UpdateIncome, IncomeFilter } from '@/types';

// Helper function to transform database row to Income
const transformIncomeRow = (row: any): Income => {
  return {
    id: row.id,
    amount: row.amount,
    description: row.description,
    categoryId: row.category_id,
    categoryName: row.Categories?.name || '',
    categoryIcon: row.Categories?.icon || '',
    categoryColor: row.Categories?.color || '',
    date: row.date,
    source: row.source,
    tags: row.tags || [],
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const incomeService = {
  async getAll(filter?: IncomeFilter): Promise<Income[]> {
    console.log('Fetching incomes with filter:', filter);

    let query = supabase
      .from('Incomes')
      .select('*, Categories(name, icon, color)')
      .order('date', { ascending: false });

    if (filter) {
      if (filter.startDate) {
        query = query.gte('date', filter.startDate);
      }
      if (filter.endDate) {
        query = query.lte('date', filter.endDate);
      }
      if (filter.categoryId) {
        query = query.eq('category_id', filter.categoryId);
      }
      if (filter.minAmount !== undefined) {
        query = query.gte('amount', filter.minAmount);
      }
      if (filter.maxAmount !== undefined) {
        query = query.lte('amount', filter.maxAmount);
      }
      if (filter.source !== undefined) {
        query = query.eq('source', filter.source);
      }
      if (filter.searchTerm) {
        query = query.ilike('description', `%${filter.searchTerm}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching incomes:', error);
      throw new Error(`Failed to fetch incomes: ${error.message}`);
    }

    console.log('Received incomes:', data?.length || 0);
    return (data || []).map(transformIncomeRow);
  },

  async getById(id: string): Promise<Income> {
    const { data, error } = await supabase
      .from('Incomes')
      .select('*, Categories(name, icon, color)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching income:', error);
      throw new Error(`Failed to fetch income: ${error.message}`);
    }

    return transformIncomeRow(data);
  },

  async getToday(): Promise<Income[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('Incomes')
      .select('*, Categories(name, icon, color)')
      .eq('date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching today\'s incomes:', error);
      throw new Error(`Failed to fetch today's incomes: ${error.message}`);
    }

    return (data || []).map(transformIncomeRow);
  },

  async getThisMonth(): Promise<Income[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('Incomes')
      .select('*, Categories(name, icon, color)')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching this month\'s incomes:', error);
      throw new Error(`Failed to fetch this month's incomes: ${error.message}`);
    }

    return (data || []).map(transformIncomeRow);
  },

  async create(income: CreateIncome): Promise<Income> {
    const { data, error } = await supabase
      .from('Incomes')
      .insert({
        amount: income.amount,
        description: income.description,
        category_id: income.categoryId,
        date: income.date,
        source: income.source,
        tags: income.tags,
        notes: income.notes,
      })
      .select('*, Categories(name, icon, color)')
      .single();

    if (error) {
      console.error('Error creating income:', error);
      throw new Error(`Failed to create income: ${error.message}`);
    }

    return transformIncomeRow(data);
  },

  async update(id: string, income: UpdateIncome): Promise<Income> {
    const { data, error } = await supabase
      .from('Incomes')
      .update({
        amount: income.amount,
        description: income.description,
        category_id: income.categoryId,
        date: income.date,
        source: income.source,
        tags: income.tags,
        notes: income.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, Categories(name, icon, color)')
      .single();

    if (error) {
      console.error('Error updating income:', error);
      throw new Error(`Failed to update income: ${error.message}`);
    }

    return transformIncomeRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('Incomes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting income:', error);
      throw new Error(`Failed to delete income: ${error.message}`);
    }
  },
};
