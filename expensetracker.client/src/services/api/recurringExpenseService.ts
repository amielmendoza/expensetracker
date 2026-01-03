import { supabase } from '@/lib/supabase';
import type { RecurringExpense, CreateRecurringExpense, UpdateRecurringExpense } from '@/types';

// Helper function to transform database row to RecurringExpense
const transformRecurringExpenseRow = (row: any): RecurringExpense => {
  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    categoryId: row.category_id,
    frequency: row.frequency,
    nextDueDate: row.next_due_date,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
};

export const recurringExpenseService = {
  async getAll(): Promise<RecurringExpense[]> {
    const { data, error } = await supabase
      .from('RecurringExpenses')
      .select('*')
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching recurring expenses:', error);
      throw new Error(`Failed to fetch recurring expenses: ${error.message}`);
    }

    return (data || []).map(transformRecurringExpenseRow);
  },

  async getActive(): Promise<RecurringExpense[]> {
    const { data, error } = await supabase
      .from('RecurringExpenses')
      .select('*')
      .eq('is_active', true)
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching active recurring expenses:', error);
      throw new Error(`Failed to fetch active recurring expenses: ${error.message}`);
    }

    return (data || []).map(transformRecurringExpenseRow);
  },

  async getUpcoming(days: number = 7): Promise<RecurringExpense[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('RecurringExpenses')
      .select('*')
      .eq('is_active', true)
      .gte('next_due_date', today)
      .lte('next_due_date', futureDate)
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming recurring expenses:', error);
      throw new Error(`Failed to fetch upcoming recurring expenses: ${error.message}`);
    }

    return (data || []).map(transformRecurringExpenseRow);
  },

  async getById(id: string): Promise<RecurringExpense> {
    const { data, error } = await supabase
      .from('RecurringExpenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recurring expense:', error);
      throw new Error(`Failed to fetch recurring expense: ${error.message}`);
    }

    return transformRecurringExpenseRow(data);
  },

  async create(recurringExpense: CreateRecurringExpense): Promise<RecurringExpense> {
    const { data, error } = await supabase
      .from('RecurringExpenses')
      .insert({
        description: recurringExpense.description,
        amount: recurringExpense.amount,
        category_id: recurringExpense.categoryId,
        frequency: recurringExpense.frequency,
        next_due_date: recurringExpense.nextDueDate,
        is_active: recurringExpense.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recurring expense:', error);
      throw new Error(`Failed to create recurring expense: ${error.message}`);
    }

    return transformRecurringExpenseRow(data);
  },

  async update(id: string, recurringExpense: UpdateRecurringExpense): Promise<RecurringExpense> {
    const updateData: any = {};
    if (recurringExpense.description !== undefined) updateData.description = recurringExpense.description;
    if (recurringExpense.amount !== undefined) updateData.amount = recurringExpense.amount;
    if (recurringExpense.categoryId !== undefined) updateData.category_id = recurringExpense.categoryId;
    if (recurringExpense.frequency !== undefined) updateData.frequency = recurringExpense.frequency;
    if (recurringExpense.nextDueDate !== undefined) updateData.next_due_date = recurringExpense.nextDueDate;
    if (recurringExpense.isActive !== undefined) updateData.is_active = recurringExpense.isActive;

    const { data, error } = await supabase
      .from('RecurringExpenses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recurring expense:', error);
      throw new Error(`Failed to update recurring expense: ${error.message}`);
    }

    return transformRecurringExpenseRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('RecurringExpenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recurring expense:', error);
      throw new Error(`Failed to delete recurring expense: ${error.message}`);
    }
  },
};
