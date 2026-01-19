export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  DigitalWallet = 2,
  BankTransfer = 3
}

export enum IncomeSource {
  Salary = 0,
  Freelance = 1,
  Business = 2,
  Investment = 3,
  Rental = 4,
  Gift = 5,
  Refund = 6,
  Other = 7
}

export enum CategoryType {
  Expense = 0,
  Income = 1,
  Both = 2
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
  isMonthlyRecurring: boolean;
}

export interface CreateExpense {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  notes?: string;
  isMonthlyRecurring?: boolean;
}

export interface UpdateExpense {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  notes?: string;
  isMonthlyRecurring?: boolean;
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

export interface Income {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  source: IncomeSource;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncome {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  source: IncomeSource;
  tags: string[];
  notes?: string;
}

export interface UpdateIncome {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  source: IncomeSource;
  tags: string[];
  notes?: string;
}

export interface IncomeFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  source?: IncomeSource;
  searchTerm?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  type: CategoryType;
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
  todayIncome: number;
  todayIncomeCount: number;
  thisMonthIncome: number;
  thisMonthSavings: number;
  thisMonthSavingsRate: number;
  topIncomeCategories: CategorySpending[];
  recentIncomes: Income[];
  activeSavingsGoals: SavingsGoal[];
  recurringTotal: number;
  nonRecurringTotal: number;
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

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  progressPercentage: number;
  remainingAmount: number;
  daysRemaining: number;
}

export interface CreateSavingsGoal {
  name: string;
  targetAmount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateSavingsGoal {
  name?: string;
  targetAmount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}




