import { supabase } from '@/lib/supabase';
import type { MonthlyReport, CategorySpending } from '@/types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const reportsService = {
  async getMonthlyComparison(): Promise<MonthlyReport[]> {
    // Fetch all expenses and incomes (ordered by date to find earliest)
    const [expensesResult, incomesResult] = await Promise.all([
      supabase
        .from('Expenses')
        .select('amount, date')
        .order('date', { ascending: true }),
      supabase
        .from('Incomes')
        .select('amount, date')
        .order('date', { ascending: true }),
    ]);

    if (expensesResult.error) {
      throw new Error(`Failed to fetch expenses: ${expensesResult.error.message}`);
    }
    if (incomesResult.error) {
      throw new Error(`Failed to fetch incomes: ${incomesResult.error.message}`);
    }

    const expenses = expensesResult.data || [];
    const incomes = incomesResult.data || [];

    if (expenses.length === 0 && incomes.length === 0) {
      return [];
    }

    // Find the earliest date across both tables
    const dates: string[] = [];
    if (expenses.length > 0 && expenses[0]) dates.push(expenses[0].date);
    if (incomes.length > 0 && incomes[0]) dates.push(incomes[0].date);
    const earliest = new Date(dates.sort()[0]!);

    const startYear = earliest.getFullYear();
    const startMonth = earliest.getMonth();

    const now = new Date();
    const endYear = now.getFullYear();
    const endMonth = now.getMonth();

    // Calculate total months from earliest to current
    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    // Build month map from earliest to now
    const monthMap = new Map<string, { income: number; expenses: number }>();
    for (let i = 0; i < totalMonths; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap.set(key, { income: 0, expenses: 0 });
    }

    // Aggregate expenses
    for (const row of expenses) {
      const d = new Date(row.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = monthMap.get(key);
      if (entry) {
        entry.expenses += row.amount;
      }
    }

    // Aggregate incomes
    for (const row of incomes) {
      const d = new Date(row.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = monthMap.get(key);
      if (entry) {
        entry.income += row.amount;
      }
    }

    // Convert to sorted array
    const results: MonthlyReport[] = [];
    for (let i = 0; i < totalMonths; i++) {
      const d = new Date(startYear, startMonth + i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = monthMap.get(key)!;
      results.push({
        month: MONTH_LABELS[d.getMonth()]!,
        year: d.getFullYear(),
        income: entry.income,
        expenses: entry.expenses,
        net: entry.income - entry.expenses,
      });
    }

    return results;
  },

  async getCategoryBreakdown(): Promise<CategorySpending[]> {
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    const { data, error } = await supabase
      .from('Expenses')
      .select('amount, category_id, Categories(name, icon, color)')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (error) {
      throw new Error(`Failed to fetch category breakdown: ${error.message}`);
    }

    const categoryMap = new Map<string, CategorySpending>();
    const totalAmount = (data || []).reduce((sum, e) => sum + e.amount, 0);

    for (const row of data || []) {
      const catId = row.category_id;
      const cat = row.Categories as any;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: catId,
          categoryName: cat?.name || 'Unknown',
          categoryIcon: cat?.icon || '',
          categoryColor: cat?.color || '#6366f1',
          totalAmount: 0,
          count: 0,
          percentage: 0,
        });
      }
      const entry = categoryMap.get(catId)!;
      entry.totalAmount += row.amount;
      entry.count += 1;
    }

    return Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: totalAmount > 0 ? (cat.totalAmount / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  },
};
