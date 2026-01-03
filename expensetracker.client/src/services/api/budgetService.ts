import { supabase } from '@/lib/supabase';
import type { Budget, CreateBudget, UpdateBudget } from '@/types';

// Helper function to transform database row to Budget
const transformBudgetRow = (row: any): Budget => {
  return {
    id: row.id,
    categoryId: row.category_id,
    amount: row.amount,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
};

export const budgetService = {
  async getAll(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('Budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      throw new Error(`Failed to fetch budgets: ${error.message}`);
    }

    return (data || []).map(transformBudgetRow);
  },

  async getActive(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('Budgets')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active budgets:', error);
      throw new Error(`Failed to fetch active budgets: ${error.message}`);
    }

    return (data || []).map(transformBudgetRow);
  },

  async getById(id: string): Promise<Budget> {
    const { data, error } = await supabase
      .from('Budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching budget:', error);
      throw new Error(`Failed to fetch budget: ${error.message}`);
    }

    return transformBudgetRow(data);
  },

  async create(budget: CreateBudget): Promise<Budget> {
    const { data, error } = await supabase
      .from('Budgets')
      .insert({
        category_id: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        start_date: budget.startDate,
        end_date: budget.endDate,
        is_active: budget.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      throw new Error(`Failed to create budget: ${error.message}`);
    }

    return transformBudgetRow(data);
  },

  async update(id: string, budget: UpdateBudget): Promise<Budget> {
    const updateData: any = {};
    if (budget.categoryId !== undefined) updateData.category_id = budget.categoryId;
    if (budget.amount !== undefined) updateData.amount = budget.amount;
    if (budget.period !== undefined) updateData.period = budget.period;
    if (budget.startDate !== undefined) updateData.start_date = budget.startDate;
    if (budget.endDate !== undefined) updateData.end_date = budget.endDate;
    if (budget.isActive !== undefined) updateData.is_active = budget.isActive;

    const { data, error } = await supabase
      .from('Budgets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      throw new Error(`Failed to update budget: ${error.message}`);
    }

    return transformBudgetRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('Budgets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      throw new Error(`Failed to delete budget: ${error.message}`);
    }
  },

  async getStatus(): Promise<any> {
    // Get active budgets with their spending
    const { data: budgets, error: budgetsError } = await supabase
      .from('Budgets')
      .select('*')
      .eq('is_active', true);

    if (budgetsError) {
      console.error('Error fetching budgets for status:', budgetsError);
      throw new Error(`Failed to fetch budget status: ${budgetsError.message}`);
    }

    const now = new Date();
    const statuses = await Promise.all(
      (budgets || []).map(async (budget: any) => {
        // Fetch expenses for this budget's category within the date range
        let query = supabase
          .from('Expenses')
          .select('amount')
          .gte('date', budget.start_date)
          .lte('date', budget.end_date);

        if (budget.category_id) {
          query = query.eq('category_id', budget.category_id);
        }

        const { data: expenses } = await query;
        const spent = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        return {
          budget: transformBudgetRow(budget),
          spent,
          remaining,
          percentage,
          isOverBudget: spent > budget.amount,
        };
      })
    );

    return statuses;
  },
};
