export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  DigitalWallet = 2,
  BankTransfer = 3
}

export enum BudgetPeriod {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
  Yearly = 3
}

export enum RecurringFrequency {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
  Yearly = 3
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpense {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  notes?: string;
}

export interface UpdateExpense {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  notes?: string;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
  searchTerm?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  parentCategoryId?: string;
}

export interface CreateCategory {
  name: string;
  icon: string;
  color: string;
  parentCategoryId?: string;
}

export interface DashboardSummary {
  todayTotal: number;
  todayCount: number;
  yesterdayTotal: number;
  thisMonthTotal: number;
  thisMonthAverage: number;
  daysRemainingInMonth: number;
  topCategories: CategorySpending[];
  recentExpenses: Expense[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface Budget {
  id: string;
  categoryId: string | null;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBudget {
  categoryId?: string | null;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateBudget {
  categoryId?: string | null;
  amount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  frequency: RecurringFrequency;
  nextDueDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateRecurringExpense {
  description: string;
  amount: number;
  categoryId: string;
  frequency: RecurringFrequency;
  nextDueDate: string;
  isActive?: boolean;
}

export interface UpdateRecurringExpense {
  description?: string;
  amount?: number;
  categoryId?: string;
  frequency?: RecurringFrequency;
  nextDueDate?: string;
  isActive?: boolean;
}


