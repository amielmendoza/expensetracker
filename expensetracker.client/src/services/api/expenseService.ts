import { supabase } from '@/lib/supabase';
import type { Expense, CreateExpense, UpdateExpense, ExpenseFilter } from '@/types';

// Helper function to transform database row to Expense
const transformExpenseRow = (row: any): Expense => {
  return {
    id: row.id,
    amount: row.amount,
    description: row.description,
    categoryId: row.category_id,
    categoryName: row.Categories?.name || '',
    categoryIcon: row.Categories?.icon || '',
    categoryColor: row.Categories?.color || '',
    date: row.date,
    paymentMethod: row.payment_method,
    tags: row.tags || [],
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isMonthlyRecurring: row.is_monthly_recurring || false,
  };
};

export const expenseService = {
  async getAll(filter?: ExpenseFilter): Promise<Expense[]> {
    console.log('Fetching expenses with filter:', filter);

    let query = supabase
      .from('Expenses')
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
      if (filter.paymentMethod !== undefined) {
        query = query.eq('payment_method', filter.paymentMethod);
      }
      if (filter.searchTerm) {
        query = query.ilike('description', `%${filter.searchTerm}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    console.log('Received expenses:', data?.length || 0);
    return (data || []).map(transformExpenseRow);
  },

  async getById(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('Expenses')
      .select('*, Categories(name, icon, color)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching expense:', error);
      throw new Error(`Failed to fetch expense: ${error.message}`);
    }

    return transformExpenseRow(data);
  },

  async getToday(): Promise<Expense[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('Expenses')
      .select('*, Categories(name, icon, color)')
      .eq('date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching today\'s expenses:', error);
      throw new Error(`Failed to fetch today's expenses: ${error.message}`);
    }

    return (data || []).map(transformExpenseRow);
  },

  async getThisMonth(): Promise<Expense[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('Expenses')
      .select('*, Categories(name, icon, color)')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching this month\'s expenses:', error);
      throw new Error(`Failed to fetch this month's expenses: ${error.message}`);
    }

    return (data || []).map(transformExpenseRow);
  },

  async create(expense: CreateExpense): Promise<Expense> {
    const { data, error } = await supabase
      .from('Expenses')
      .insert({
        amount: expense.amount,
        description: expense.description,
        category_id: expense.categoryId,
        date: expense.date,
        payment_method: expense.paymentMethod,
        tags: expense.tags,
        notes: expense.notes,
        is_monthly_recurring: expense.isMonthlyRecurring || false,
      })
      .select('*, Categories(name, icon, color)')
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    return transformExpenseRow(data);
  },

  async update(id: string, expense: UpdateExpense): Promise<Expense> {
    const { data, error } = await supabase
      .from('Expenses')
      .update({
        amount: expense.amount,
        description: expense.description,
        category_id: expense.categoryId,
        date: expense.date,
        payment_method: expense.paymentMethod,
        tags: expense.tags,
        notes: expense.notes,
        is_monthly_recurring: expense.isMonthlyRecurring || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, Categories(name, icon, color)')
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    return transformExpenseRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('Expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  },
};
