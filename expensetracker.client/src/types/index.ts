export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  DigitalWallet = 2,
  BankTransfer = 3
}

export enum AccountType {
  Bank = 0,
  EWallet = 1,
  CreditCard = 2
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  balance: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccount {
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  balance?: number;
}

export interface UpdateAccount {
  name?: string;
  type?: AccountType;
  icon?: string;
  color?: string;
  balance?: number;
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
  accountId?: string;
  accountName?: string;
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
  accountId?: string;
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
  accountId?: string;
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
  accountId?: string;
  accountName?: string;
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
  accountId?: string;
  tags: string[];
  notes?: string;
}

export interface UpdateIncome {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  source: IncomeSource;
  accountId?: string;
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
  allCategorySpending: CategorySpending[];
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
  prevMonthTotal: number;
  prevMonthIncome: number;
  prevMonthCategories: CategorySpending[];
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

export interface MonthlyReport {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
}




