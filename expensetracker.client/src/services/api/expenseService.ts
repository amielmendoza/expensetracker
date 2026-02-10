import { supabase } from '@/lib/supabase';
import type { Expense, CreateExpense, UpdateExpense, ExpenseFilter } from '@/types';
import { accountService } from '@/services/api/accountService';

const SELECT_QUERY = '*, Categories(name, icon, color), Accounts(name)';

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
    accountId: row.account_id || undefined,
    accountName: row.Accounts?.name || undefined,
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
      .select(SELECT_QUERY)
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
      .select(SELECT_QUERY)
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
      .select(SELECT_QUERY)
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
      .select(SELECT_QUERY)
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
        account_id: expense.accountId || null,
        tags: expense.tags,
        notes: expense.notes,
        is_monthly_recurring: expense.isMonthlyRecurring || false,
      })
      .select(SELECT_QUERY)
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    // Adjust account balance (deducts for bank/ewallet, adds for credit card)
    if (expense.accountId) {
      await accountService.adjustForExpense(expense.accountId, expense.amount);
    }

    return transformExpenseRow(data);
  },

  async update(id: string, expense: UpdateExpense): Promise<Expense> {
    // Fetch old expense to reverse previous balance adjustment
    const oldExpense = await this.getById(id);

    const { data, error } = await supabase
      .from('Expenses')
      .update({
        amount: expense.amount,
        description: expense.description,
        category_id: expense.categoryId,
        date: expense.date,
        payment_method: expense.paymentMethod,
        account_id: expense.accountId || null,
        tags: expense.tags,
        notes: expense.notes,
        is_monthly_recurring: expense.isMonthlyRecurring || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT_QUERY)
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    // Reverse old balance adjustment
    if (oldExpense.accountId) {
      await accountService.reverseForExpense(oldExpense.accountId, oldExpense.amount);
    }
    // Apply new balance adjustment
    if (expense.accountId) {
      await accountService.adjustForExpense(expense.accountId, expense.amount);
    }

    return transformExpenseRow(data);
  },

  async delete(id: string): Promise<void> {
    // Fetch expense to reverse balance before deleting
    const expense = await this.getById(id);

    const { error } = await supabase
      .from('Expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }

    // Reverse the balance adjustment
    if (expense.accountId) {
      await accountService.reverseForExpense(expense.accountId, expense.amount);
    }
  },
};
