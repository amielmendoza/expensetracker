import { supabase } from '@/lib/supabase';
import type { SavingsGoal, CreateSavingsGoal, UpdateSavingsGoal } from '@/types';

// Helper function to transform database row to SavingsGoal
const transformSavingsGoalRow = (row: any): SavingsGoal => {
  // Calculate derived fields
  const progressPercentage = row.target_amount > 0
    ? Math.min(100, (row.current_amount / row.target_amount) * 100)
    : 0;

  const remainingAmount = Math.max(0, row.target_amount - row.current_amount);

  const endDate = new Date(row.end_date);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
    progressPercentage,
    remainingAmount,
    daysRemaining,
  };
};

export const savingsGoalService = {
  async getAll(): Promise<SavingsGoal[]> {
    console.log('Fetching all savings goals');

    const { data, error } = await supabase
      .from('SavingsGoals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching savings goals:', error);
      throw new Error(`Failed to fetch savings goals: ${error.message}`);
    }

    console.log('Received savings goals:', data?.length || 0);
    return (data || []).map(transformSavingsGoalRow);
  },

  async getAllActive(): Promise<SavingsGoal[]> {
    console.log('Fetching active savings goals');

    const now = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('SavingsGoals')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching active savings goals:', error);
      throw new Error(`Failed to fetch active savings goals: ${error.message}`);
    }

    console.log('Received active savings goals:', data?.length || 0);
    return (data || []).map(transformSavingsGoalRow);
  },

  async getById(id: string): Promise<SavingsGoal> {
    const { data, error } = await supabase
      .from('SavingsGoals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching savings goal:', error);
      throw new Error(`Failed to fetch savings goal: ${error.message}`);
    }

    return transformSavingsGoalRow(data);
  },

  async create(savingsGoal: CreateSavingsGoal): Promise<SavingsGoal> {
    const { data, error } = await supabase
      .from('SavingsGoals')
      .insert({
        name: savingsGoal.name,
        target_amount: savingsGoal.targetAmount,
        current_amount: 0,
        period: savingsGoal.period,
        start_date: savingsGoal.startDate,
        end_date: savingsGoal.endDate,
        is_active: savingsGoal.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating savings goal:', error);
      throw new Error(`Failed to create savings goal: ${error.message}`);
    }

    return transformSavingsGoalRow(data);
  },

  async update(id: string, savingsGoal: UpdateSavingsGoal): Promise<SavingsGoal> {
    const updateData: any = {};

    if (savingsGoal.name !== undefined) updateData.name = savingsGoal.name;
    if (savingsGoal.targetAmount !== undefined) updateData.target_amount = savingsGoal.targetAmount;
    if (savingsGoal.period !== undefined) updateData.period = savingsGoal.period;
    if (savingsGoal.startDate !== undefined) updateData.start_date = savingsGoal.startDate;
    if (savingsGoal.endDate !== undefined) updateData.end_date = savingsGoal.endDate;
    if (savingsGoal.isActive !== undefined) updateData.is_active = savingsGoal.isActive;

    const { data, error } = await supabase
      .from('SavingsGoals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating savings goal:', error);
      throw new Error(`Failed to update savings goal: ${error.message}`);
    }

    return transformSavingsGoalRow(data);
  },

  async recalculateProgress(id: string): Promise<SavingsGoal> {
    console.log('Recalculating progress for savings goal:', id);

    // Get the goal first
    const goal = await this.getById(id);

    // Fetch total income for the date range
    const { data: incomes, error: incomeError } = await supabase
      .from('Incomes')
      .select('amount')
      .gte('date', goal.startDate)
      .lte('date', goal.endDate);

    if (incomeError) {
      console.error('Error fetching incomes for recalculation:', incomeError);
      throw new Error(`Failed to fetch incomes: ${incomeError.message}`);
    }

    const totalIncome = incomes?.reduce((sum, i) => sum + i.amount, 0) || 0;

    // Fetch total expenses for the date range
    const { data: expenses, error: expenseError } = await supabase
      .from('Expenses')
      .select('amount')
      .gte('date', goal.startDate)
      .lte('date', goal.endDate);

    if (expenseError) {
      console.error('Error fetching expenses for recalculation:', expenseError);
      throw new Error(`Failed to fetch expenses: ${expenseError.message}`);
    }

    const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    // Calculate current amount (savings = income - expenses)
    const currentAmount = totalIncome - totalExpenses;

    console.log(`Recalculated: Income ${totalIncome} - Expenses ${totalExpenses} = ${currentAmount}`);

    // Update the goal with the new current amount
    const { data, error } = await supabase
      .from('SavingsGoals')
      .update({ current_amount: currentAmount })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating savings goal current amount:', error);
      throw new Error(`Failed to update savings goal: ${error.message}`);
    }

    return transformSavingsGoalRow(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('SavingsGoals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting savings goal:', error);
      throw new Error(`Failed to delete savings goal: ${error.message}`);
    }
  },
};
