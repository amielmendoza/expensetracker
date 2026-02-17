<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Dashboard <span class="live-badge">Live</span></h1>
      </div>
      <div class="header-right">
        <button class="btn-add" @click="$router.push('/expenses')">+ Add Transaction</button>
      </div>
    </div>

    <!-- Month Selector -->
    <div class="month-selector">
      <button class="month-nav-btn" @click="goToPreviousMonth">&larr;</button>
      <span class="current-month">{{ selectedMonthLabel }}</span>
      <button class="month-nav-btn" @click="goToNextMonth" :disabled="isCurrentMonth">&rarr;</button>
      <button v-if="!isCurrentMonth" class="today-btn" @click="goToCurrentMonth">Today</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="summary" class="dashboard-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card income-card">
          <div class="card-header">
            <span class="card-label">Total Income</span>
            <span class="card-icon">📈</span>
          </div>
          <div class="card-amount">{{ formatLargeAmount(summary.thisMonthIncome) }}</div>
          <div class="card-footer">
            <span>This month</span>
            <span v-if="calculateIncomeChange !== null" class="change" :class="Number(calculateIncomeChange) >= 0 ? 'positive' : 'negative'">
              {{ Number(calculateIncomeChange) >= 0 ? '+' : '' }}{{ calculateIncomeChange }}%
            </span>
            <span v-else class="change neutral">No prev data</span>
          </div>
        </div>

        <div class="summary-card expense-card">
          <div class="card-header">
            <span class="card-label">Total Expenses</span>
            <span class="card-icon">📉</span>
          </div>
          <div class="card-amount">{{ formatLargeAmount(summary.thisMonthTotal) }}</div>
          <div class="card-footer">
            <span>This month</span>
            <span v-if="calculateExpenseChange !== null" class="change" :class="Number(calculateExpenseChange) <= 0 ? 'positive' : 'negative'">
              {{ Number(calculateExpenseChange) >= 0 ? '+' : '' }}{{ calculateExpenseChange }}%
            </span>
            <span v-else class="change neutral">No prev data</span>
          </div>
        </div>

        <div class="summary-card savings-card">
          <div class="card-header">
            <span class="card-label">Net Savings</span>
            <span class="card-icon">💰</span>
          </div>
          <div class="card-amount" :class="{ negative: summary.thisMonthSavings < 0 }">
            {{ formatLargeAmount(summary.thisMonthSavings) }}
          </div>
          <div class="card-footer">
            <span>{{ summary.thisMonthSavingsRate.toFixed(0) }}% savings rate</span>
            <span class="change" :class="summary.thisMonthSavings >= 0 ? 'positive' : 'negative'">
              {{ summary.thisMonthSavings >= 0 ? '+' : '' }}{{ summary.thisMonthSavingsRate.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-pill">
          <span class="stat-label">Recurring</span>
          <span class="stat-value">{{ formatLargeAmount(summary.recurringTotal) }}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">One-time</span>
          <span class="stat-value">{{ formatLargeAmount(summary.nonRecurringTotal) }}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">Daily Avg</span>
          <span class="stat-value">{{ formatLargeAmount(summary.thisMonthAverage) }}</span>
        </div>
        <div class="stat-pill" v-if="isCurrentMonth">
          <span class="stat-label">Days Left</span>
          <span class="stat-value">{{ summary.daysRemainingInMonth }}</span>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="main-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Recent Transactions -->
          <div class="card">
            <div class="card-title">
              <h2>Recent Transactions</h2>
              <router-link to="/expenses" class="view-all">View all</router-link>
            </div>
            <div class="transactions-list" v-if="summary.recentExpenses.length > 0">
              <div
                v-for="expense in summary.recentExpenses.slice(0, 6)"
                :key="expense.id"
                class="transaction-item"
              >
                <div class="transaction-icon" :style="{ backgroundColor: expense.categoryColor }">
                  {{ expense.categoryIcon }}
                </div>
                <div class="transaction-info">
                  <div class="transaction-name">{{ expense.description }}</div>
                  <div class="transaction-meta">{{ expense.categoryName }} • {{ formatDate(expense.date) }}</div>
                </div>
                <div class="transaction-amount expense">
                  -{{ formatLargeAmount(expense.amount) }}
                </div>
              </div>
            </div>
            <div v-else class="empty-state-small">No transactions this month</div>
          </div>

          <!-- Budget Tracker -->
          <div class="card">
            <div class="card-title">
              <h2>Budget Tracker</h2>
              <span class="card-subtitle">vs. last month</span>
            </div>
            <div class="budget-list" v-if="budgetItems.length > 0">
              <div
                v-for="item in budgetItems"
                :key="item.categoryId"
                class="budget-item"
              >
                <div class="budget-header">
                  <span class="budget-name">{{ item.categoryName }}</span>
                  <span class="budget-amounts">
                    {{ formatLargeAmount(item.current) }} / {{ formatLargeAmount(item.budget) }}
                  </span>
                </div>
                <div class="budget-bar">
                  <div
                    class="budget-fill"
                    :style="{ width: Math.min(item.usedPercent, 100) + '%' }"
                    :class="getBudgetClass(item.usedPercent)"
                  ></div>
                </div>
                <div class="budget-footer">
                  <span class="budget-percent">{{ item.usedPercent.toFixed(0) }}% of last month</span>
                  <span class="budget-remaining" :class="{ 'over-budget': item.remaining < 0 }">
                    {{ item.remaining >= 0 ? formatLargeAmount(item.remaining) + ' remaining' : formatLargeAmount(Math.abs(item.remaining)) + ' over' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-small">No previous month data to compare</div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Top Spending Categories -->
          <div class="card">
            <div class="card-title">
              <h2>Top Spending Categories</h2>
              <span class="card-subtitle">This month's breakdown</span>
            </div>
            <div class="categories-list" v-if="summary.topCategories.length > 0">
              <div
                v-for="category in summary.topCategories"
                :key="category.categoryId"
                class="category-row"
              >
                <div class="category-color" :style="{ backgroundColor: category.categoryColor }"></div>
                <div class="category-info">
                  <span class="category-name">{{ category.categoryName }}</span>
                  <span class="category-percent">{{ category.percentage.toFixed(0) }}% of total</span>
                </div>
                <span class="category-amount">{{ formatLargeAmount(category.totalAmount) }}</span>
              </div>
            </div>
            <div v-else class="empty-state-small">No categories</div>
          </div>

          <!-- Savings Goals -->
          <div class="card">
            <div class="card-title">
              <h2>Savings Goals</h2>
              <span class="card-subtitle">Track your progress</span>
            </div>

            <!-- Savings Rate Highlight -->
            <div class="savings-highlight">
              <div class="savings-circle" :class="{ negative: summary.thisMonthSavingsRate < 0 }">
                <span class="savings-percent">{{ Math.abs(summary.thisMonthSavingsRate).toFixed(0) }}%</span>
              </div>
              <div class="savings-text">
                <strong>{{ summary.thisMonthSavingsRate >= 0 ? '↗ Savings Rate' : '↘ Deficit Rate' }}</strong>
                <p v-if="summary.thisMonthSavingsRate >= 50">You're saving almost half of your income. Keep it up!</p>
                <p v-else-if="summary.thisMonthSavingsRate >= 20">Good progress on your savings!</p>
                <p v-else-if="summary.thisMonthSavingsRate >= 0">Consider increasing your savings rate.</p>
                <p v-else>Expenses exceed income this month.</p>
              </div>
            </div>

            <router-link to="/savings-goals" class="view-goals-link">View all savings goals →</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '@/stores/dashboardStore';
import { formatDate } from '@/utils/dateUtils';
import { formatAmount as formatLargeAmount } from '@/utils/currencyUtils';

const dashboardStore = useDashboardStore();
const { summary, loading, error, selectedMonthLabel, isCurrentMonth } = storeToRefs(dashboardStore);
const { fetchSummary, goToPreviousMonth, goToNextMonth, goToCurrentMonth } = dashboardStore;


const calculateIncomeChange = computed(() => {
  if (!summary.value || summary.value.prevMonthIncome === 0) return null;
  const change = ((summary.value.thisMonthIncome - summary.value.prevMonthIncome) / summary.value.prevMonthIncome) * 100;
  return change.toFixed(1);
});

const calculateExpenseChange = computed(() => {
  if (!summary.value || summary.value.prevMonthTotal === 0) return null;
  const change = ((summary.value.thisMonthTotal - summary.value.prevMonthTotal) / summary.value.prevMonthTotal) * 100;
  return change.toFixed(1);
});

const budgetItems = computed(() => {
  if (!summary.value || !summary.value.prevMonthCategories || summary.value.prevMonthCategories.length === 0) {
    return [];
  }
  const prevMap = new Map(summary.value.prevMonthCategories.map(c => [c.categoryId, c]));
  // Show categories that existed last month, matched with current spending
  return summary.value.prevMonthCategories
    .slice(0, 5)
    .map(prev => {
      const current = summary.value!.allCategorySpending.find(c => c.categoryId === prev.categoryId);
      const currentAmount = current?.totalAmount || 0;
      const budget = prev.totalAmount;
      const usedPercent = budget > 0 ? (currentAmount / budget) * 100 : 0;
      return {
        categoryId: prev.categoryId,
        categoryName: prev.categoryName,
        current: currentAmount,
        budget,
        usedPercent,
        remaining: budget - currentAmount,
      };
    });
});

const getBudgetClass = (percentage: number): string => {
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'warning';
  return 'normal';
};

onMounted(async () => {
  await fetchSummary();
});
</script>

<style scoped>
.dashboard {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.live-badge {
  background: #10b981;
  color: white;
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
  text-transform: uppercase;
}

.btn-add {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

/* Month Selector */
.month-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.month-nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-nav-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.month-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.current-month {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.today-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--primary);
  border-radius: 6px;
  background: transparent;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-btn:hover {
  background: var(--primary);
  color: white;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.summary-card {
  padding: 1.25rem;
  border-radius: 16px;
  color: white;
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30%, -30%);
}

.income-card {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.expense-card {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.savings-card {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #1e293b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-label {
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.9;
}

.card-icon {
  font-size: 1.25rem;
}

.card-amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-amount.negative {
  color: #dc2626;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  opacity: 0.9;
}

.change {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 600;
}

.change.positive {
  background: rgba(255, 255, 255, 0.2);
}

.change.negative {
  background: rgba(255, 255, 255, 0.2);
}

.change.neutral {
  background: rgba(255, 255, 255, 0.15);
  font-size: 0.65rem;
}

.savings-card .change.positive {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.savings-card .change.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

/* Quick Stats */
.quick-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-pill {
  flex: 1;
  min-width: 120px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Card Component */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-title h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.view-all {
  font-size: 0.8rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.transaction-amount {
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
}

.transaction-amount.expense {
  color: #ef4444;
}

.transaction-amount.income {
  color: #22c55e;
}

/* Budget List */
.budget-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.budget-item {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.budget-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.budget-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.budget-amounts {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.budget-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 0.375rem;
}

.budget-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.budget-fill.normal {
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.budget-fill.warning {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.budget-fill.over {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.budget-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.budget-remaining.over-budget {
  color: #ef4444;
  font-weight: 600;
}

/* Categories List */
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.category-color {
  width: 8px;
  height: 32px;
  border-radius: 4px;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.category-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-percent {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.category-amount {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Savings Highlight */
.savings-highlight {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.savings-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 3px solid #f59e0b;
}

.savings-circle.negative {
  border-color: #ef4444;
}

.savings-percent {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.savings-text {
  flex: 1;
}

.savings-text strong {
  font-size: 0.85rem;
  color: #1e293b;
  display: block;
  margin-bottom: 0.25rem;
}

.savings-text p {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
  line-height: 1.4;
}

.view-goals-link {
  display: block;
  text-align: center;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
}

.view-goals-link:hover {
  text-decoration: underline;
}

/* Empty State */
.empty-state-small {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Loading */
.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
}

/* Mobile Responsive */
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .quick-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-pill {
    min-width: auto;
  }

  .card-amount {
    font-size: 1.5rem;
  }

  .savings-highlight {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .header-left h1 {
    font-size: 1.5rem;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .quick-stats {
    grid-template-columns: 1fr 1fr;
  }

  .budget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .transaction-name {
    max-width: 120px;
  }
}
</style>
