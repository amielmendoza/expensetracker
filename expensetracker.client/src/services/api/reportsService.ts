import { supabase } from '@/lib/supabase';
import type { MonthlyReport } from '@/types';

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
};
