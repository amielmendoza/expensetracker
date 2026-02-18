import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface UserCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: number;
}

export interface MonthlySummary {
  month: string;
  totalExpenses: number;
  totalIncome: number;
  expenseCount: number;
  topCategories: Array<{ name: string; total: number; percentage: number }>;
}

export interface CategoryPattern {
  description: string;
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface UserContext {
  categories: UserCategory[];
  monthlySummary: MonthlySummary[];
  recentExpenses: Array<{ description: string; category: string; amount: number; date: string }>;
  categoryPatterns: CategoryPattern[];
  accounts: Array<{ name: string; type: number; balance: number }>;
  averages: { dailyExpense: number; monthlyExpense: number; monthlyIncome: number };
  recurringExpenses: Array<{ description: string; amount: number; category: string }>;
}

const formatDate = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function getUserCategories(supabase: SupabaseClient): Promise<UserCategory[]> {
  const { data, error } = await supabase
    .from('Categories')
    .select('id, name, icon, color, type');
  if (error) throw error;
  return data || [];
}

export async function getCategorizationHistory(supabase: SupabaseClient): Promise<CategoryPattern[]> {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data, error } = await supabase
    .from('Expenses')
    .select('description, category_id, Categories(name)')
    .gte('date', formatDate(threeMonthsAgo))
    .order('date', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Group by lowercased description → most common category
  const map = new Map<string, { categoryId: string; categoryName: string; count: number }>();
  for (const row of data) {
    const key = (row.description || '').toLowerCase().trim();
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, {
        categoryId: row.category_id,
        categoryName: (row as any).Categories?.name || 'Unknown',
        count: 1,
      });
    }
  }

  return Array.from(map.entries()).map(([desc, info]) => ({
    description: desc,
    ...info,
  }));
}

export async function getUserContext(
  supabase: SupabaseClient,
  months = 3,
): Promise<UserContext> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

  const [categoriesRes, expensesRes, incomesRes, accountsRes] = await Promise.all([
    supabase.from('Categories').select('id, name, icon, color, type'),
    supabase
      .from('Expenses')
      .select('amount, description, date, category_id, is_monthly_recurring, Categories(name)')
      .gte('date', formatDate(startDate))
      .order('date', { ascending: false }),
    supabase
      .from('Incomes')
      .select('amount, date')
      .gte('date', formatDate(startDate)),
    supabase.from('Accounts').select('name, type, balance'),
  ]);

  const categories = categoriesRes.data || [];
  const expenses = expensesRes.data || [];
  const incomes = incomesRes.data || [];
  const accounts = accountsRes.data || [];

  // Build monthly summaries
  const monthMap = new Map<string, { expenses: number; income: number; count: number; cats: Map<string, number> }>();
  for (const e of expenses) {
    const m = e.date.substring(0, 7); // YYYY-MM
    if (!monthMap.has(m)) monthMap.set(m, { expenses: 0, income: 0, count: 0, cats: new Map() });
    const entry = monthMap.get(m)!;
    entry.expenses += e.amount;
    entry.count++;
    const catName = (e as any).Categories?.name || 'Unknown';
    entry.cats.set(catName, (entry.cats.get(catName) || 0) + e.amount);
  }
  for (const i of incomes) {
    const m = i.date.substring(0, 7);
    if (!monthMap.has(m)) monthMap.set(m, { expenses: 0, income: 0, count: 0, cats: new Map() });
    monthMap.get(m)!.income += i.amount;
  }

  const monthlySummary: MonthlySummary[] = Array.from(monthMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, data]) => ({
      month,
      totalExpenses: data.expenses,
      totalIncome: data.income,
      expenseCount: data.count,
      topCategories: Array.from(data.cats.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, total]) => ({
          name,
          total,
          percentage: data.expenses > 0 ? Math.round((total / data.expenses) * 100) : 0,
        })),
    }));

  // Recent expenses (last 15)
  const recentExpenses = expenses.slice(0, 15).map((e) => ({
    description: e.description,
    category: (e as any).Categories?.name || 'Unknown',
    amount: e.amount,
    date: e.date,
  }));

  // Recurring expenses
  const recurringSet = new Map<string, { description: string; amount: number; category: string }>();
  for (const e of expenses) {
    if (e.is_monthly_recurring) {
      const key = `${(e.description || '').toLowerCase().trim()}|${e.category_id}`;
      if (!recurringSet.has(key)) {
        recurringSet.set(key, {
          description: e.description,
          amount: e.amount,
          category: (e as any).Categories?.name || 'Unknown',
        });
      }
    }
  }

  // Averages
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const daysInRange = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    categories: categories.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, type: c.type })),
    monthlySummary,
    recentExpenses,
    categoryPatterns: await getCategorizationHistory(supabase),
    accounts: accounts.map((a: any) => ({ name: a.name, type: a.type, balance: a.balance })),
    averages: {
      dailyExpense: Math.round(totalExpenses / daysInRange),
      monthlyExpense: Math.round(totalExpenses / Math.max(1, months)),
      monthlyIncome: Math.round(totalIncome / Math.max(1, months)),
    },
    recurringExpenses: Array.from(recurringSet.values()),
  };
}
