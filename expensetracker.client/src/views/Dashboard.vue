<template>
  <div class="dashboard">
    <h1>Expense Dashboard</h1>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="summary" class="dashboard-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card expense-card">
          <h2>Expenses (This Month)</h2>
          <div class="amount expense">{{ formatCurrency(summary.thisMonthTotal) }}</div>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Today</span>
              <span class="stat-value">{{ formatCurrency(summary.todayTotal) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Daily avg</span>
              <span class="stat-value">{{ formatCurrency(summary.thisMonthAverage) }}</span>
            </div>
          </div>
        </div>

        <div class="card income-card">
          <h2>Income (This Month)</h2>
          <div class="amount income">{{ formatCurrency(summary.thisMonthIncome) }}</div>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Today</span>
              <span class="stat-value">{{ formatCurrency(summary.todayIncome) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Entries</span>
              <span class="stat-value">{{ summary.todayIncomeCount }}</span>
            </div>
          </div>
        </div>

        <div class="card savings-card">
          <h2>Savings (This Month)</h2>
          <div class="amount" :class="summary.thisMonthSavings >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(summary.thisMonthSavings) }}
          </div>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Savings Rate</span>
              <span class="stat-value" :class="summary.thisMonthSavingsRate >= 0 ? 'positive' : 'negative'">
                {{ summary.thisMonthSavingsRate.toFixed(1) }}%
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Days left</span>
              <span class="stat-value">{{ summary.daysRemainingInMonth }}</span>
            </div>
          </div>
        </div>

        <div class="card recurring-card">
          <h2>Recurring vs One-time</h2>
          <div class="recurring-breakdown">
            <div class="recurring-item">
              <span class="recurring-label">Recurring</span>
              <span class="recurring-value">{{ formatCurrency(summary.recurringTotal) }}</span>
            </div>
            <div class="recurring-item">
              <span class="recurring-label">One-time</span>
              <span class="recurring-value">{{ formatCurrency(summary.nonRecurringTotal) }}</span>
            </div>
          </div>
          <div class="recurring-bar">
            <div
              class="recurring-bar-fill"
              :style="{ width: summary.thisMonthTotal > 0 ? (summary.recurringTotal / summary.thisMonthTotal * 100) + '%' : '0%' }"
            ></div>
          </div>
          <div class="recurring-percentages">
            <span>{{ summary.thisMonthTotal > 0 ? (summary.recurringTotal / summary.thisMonthTotal * 100).toFixed(0) : 0 }}% recurring</span>
            <span>{{ summary.thisMonthTotal > 0 ? (summary.nonRecurringTotal / summary.thisMonthTotal * 100).toFixed(0) : 0 }}% one-time</span>
          </div>
        </div>
      </div>

      <!-- Top Categories -->
      <div v-if="summary.topCategories.length > 0" class="top-categories">
        <h2>Top Categories This Month</h2>
        <div class="category-list">
          <div
            v-for="category in summary.topCategories"
            :key="category.categoryId"
            class="category-item"
          >
            <div class="category-icon" :style="{ backgroundColor: category.categoryColor }">
              {{ category.categoryIcon }}
            </div>
            <div class="category-info">
              <div class="category-name">{{ category.categoryName }}</div>
              <div class="category-amount">{{ formatCurrency(category.totalAmount) }}</div>
              <div class="category-count">{{ category.count }} expense{{ category.count !== 1 ? 's' : '' }}</div>
            </div>
            <div class="category-percentage">{{ category.percentage.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- Recent Expenses -->
      <div v-if="summary.recentExpenses.length > 0" class="recent-expenses">
        <h2>Recent Expenses</h2>
        <div class="expense-list">
          <div
            v-for="expense in summary.recentExpenses"
            :key="expense.id"
            class="expense-item"
          >
            <div class="expense-icon" :style="{ backgroundColor: expense.categoryColor }">
              {{ expense.categoryIcon }}
            </div>
            <div class="expense-info">
              <div class="expense-description">{{ expense.description }}</div>
              <div class="expense-meta">
                {{ formatDate(expense.date) }} • {{ expense.categoryName }}
              </div>
            </div>
            <div class="expense-amount">{{ formatCurrency(expense.amount) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '@/stores/dashboardStore';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate } from '@/utils/dateUtils';

const dashboardStore = useDashboardStore();
const { summary, loading, error } = storeToRefs(dashboardStore);
const { fetchSummary } = dashboardStore;

onMounted(async () => {
  try {
    await fetchSummary();
  } catch (err) {
    console.error('Error loading dashboard:', err);
    // Error is already handled in the store, just log it here
  }
});
</script>

<style scoped>
.dashboard {
  padding: 3rem 0 2rem 0;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard h1 {
  margin: 0 0 2.5rem 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.loading,
.error {
  text-align: center;
  padding: 3rem 2rem;
}

.loading {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.expense-card::before {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.income-card::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.savings-card::before {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.recurring-card::before {
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
}

.card h2 {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.amount.expense {
  color: #ef4444;
}

.amount.income {
  color: #10b981;
}

.amount.positive {
  color: #10b981;
}

.amount.negative {
  color: #ef4444;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.stat-value.positive {
  color: #10b981;
}

.stat-value.negative {
  color: #ef4444;
}

.top-categories,
.recent-expenses {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  margin-bottom: 2rem;
  transition: box-shadow 0.3s ease;
}

.top-categories:hover,
.recent-expenses:hover {
  box-shadow: var(--shadow-lg);
}

.top-categories h2,
.recent-expenses h2 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.category-list,
.expense-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item,
.expense-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.category-item:hover,
.expense-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.category-icon,
.expense-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.category-item:hover .category-icon,
.expense-item:hover .expense-icon {
  transform: scale(1.1);
}

.category-info,
.expense-info {
  flex: 1;
  min-width: 0;
}

.category-name,
.expense-description {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.category-amount,
.expense-amount {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}

.category-count,
.expense-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.category-percentage {
  font-weight: 700;
  color: var(--primary);
  font-size: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: var(--radius-sm);
}

.recurring-breakdown {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.recurring-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recurring-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.recurring-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.recurring-bar {
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.recurring-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.recurring-percentages {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>

