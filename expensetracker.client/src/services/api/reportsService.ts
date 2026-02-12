import { supabase } from '@/lib/supabase';
import type { MonthlyReport } from '@/types';

const formatLocalDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const reportsService = {
  async getMonthlyComparison(months: number = 6): Promise<MonthlyReport[]> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startStr = formatLocalDate(startDate);
    const endStr = formatLocalDate(endDate);

    const [expensesResult, incomesResult] = await Promise.all([
      supabase
        .from('Expenses')
        .select('amount, date')
        .gte('date', startStr)
        .lte('date', endStr),
      supabase
        .from('Incomes')
        .select('amount, date')
        .gte('date', startStr)
        .lte('date', endStr),
    ]);

    if (expensesResult.error) {
      throw new Error(`Failed to fetch expenses: ${expensesResult.error.message}`);
    }
    if (incomesResult.error) {
      throw new Error(`Failed to fetch incomes: ${incomesResult.error.message}`);
    }

    // Build a map of year-month -> totals
    const monthMap = new Map<string, { income: number; expenses: number }>();

    // Initialize all months in range
    for (let i = 0; i < months; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap.set(key, { income: 0, expenses: 0 });
    }

    // Aggregate expenses
    for (const row of expensesResult.data || []) {
      const d = new Date(row.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = monthMap.get(key);
      if (entry) {
        entry.expenses += row.amount;
      }
    }

    // Aggregate incomes
    for (const row of incomesResult.data || []) {
      const d = new Date(row.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = monthMap.get(key);
      if (entry) {
        entry.income += row.amount;
      }
    }

    // Convert to sorted array
    const results: MonthlyReport[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
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
};
