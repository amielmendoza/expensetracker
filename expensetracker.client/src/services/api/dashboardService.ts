import { supabase } from '@/lib/supabase';
import type { DashboardSummary, CategorySpending, Expense } from '@/types';

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
  };
};

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - now.getDate();

    // Fetch today's expenses
    const { data: todayExpenses, error: todayError } = await supabase
      .from('Expenses')
      .select('amount')
      .eq('date', today);

    if (todayError) {
      console.error('Error fetching today\'s expenses:', todayError);
      throw new Error(`Failed to fetch today's expenses: ${todayError.message}`);
    }

    const todayTotal = todayExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const todayCount = todayExpenses?.length || 0;

    // Fetch yesterday's expenses
    const { data: yesterdayExpenses, error: yesterdayError } = await supabase
      .from('Expenses')
      .select('amount')
      .eq('date', yesterday);

    if (yesterdayError) {
      console.error('Error fetching yesterday\'s expenses:', yesterdayError);
      throw new Error(`Failed to fetch yesterday's expenses: ${yesterdayError.message}`);
    }

    const yesterdayTotal = yesterdayExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    // Fetch this month's expenses
    const { data: monthExpenses, error: monthError } = await supabase
      .from('Expenses')
      .select('*, Categories(name, icon, color)')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (monthError) {
      console.error('Error fetching month\'s expenses:', monthError);
      throw new Error(`Failed to fetch month's expenses: ${monthError.message}`);
    }

    const thisMonthTotal = monthExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const thisMonthAverage = monthExpenses?.length ? thisMonthTotal / now.getDate() : 0;

    // Calculate top categories
    const categoryMap = new Map<string, CategorySpending>();
    monthExpenses?.forEach((expense: any) => {
      const categoryId = expense.category_id;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName: expense.Categories?.name || 'Unknown',
          categoryIcon: expense.Categories?.icon || '',
          categoryColor: expense.Categories?.color || '#000000',
          totalAmount: 0,
          count: 0,
          percentage: 0,
        });
      }
      const category = categoryMap.get(categoryId)!;
      category.totalAmount += expense.amount;
      category.count += 1;
    });

    const topCategories = Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: thisMonthTotal > 0 ? (cat.totalAmount / thisMonthTotal) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // Fetch recent expenses
    const { data: recentExpensesData, error: recentError } = await supabase
      .from('Expenses')
      .select('*, Categories(name, icon, color)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error fetching recent expenses:', recentError);
      throw new Error(`Failed to fetch recent expenses: ${recentError.message}`);
    }

    const recentExpenses = (recentExpensesData || []).map(transformExpenseRow);

    return {
      todayTotal,
      todayCount,
      yesterdayTotal,
      thisMonthTotal,
      thisMonthAverage,
      daysRemainingInMonth: daysRemaining,
      topCategories,
      recentExpenses,
    };
  },
};
