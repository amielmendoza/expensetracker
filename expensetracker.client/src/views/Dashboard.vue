<template>
  <div class="dashboard">
    <h1>Expense Dashboard</h1>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="summary" class="dashboard-content">
      <!-- Today's Summary -->
      <div class="summary-cards">
        <div class="card today-card">
          <h2>Today</h2>
          <div class="amount">{{ formatCurrency(summary.todayTotal) }}</div>
          <div class="count">{{ summary.todayCount }} expense{{ summary.todayCount !== 1 ? 's' : '' }}</div>
          <div v-if="summary.yesterdayTotal > 0" class="comparison">
            <span :class="summary.todayTotal > summary.yesterdayTotal ? 'increase' : 'decrease'">
              {{ summary.todayTotal > summary.yesterdayTotal ? '↑' : '↓' }}
              {{ Math.abs(((summary.todayTotal - summary.yesterdayTotal) / summary.yesterdayTotal) * 100).toFixed(1) }}%
            </span>
            vs yesterday
          </div>
        </div>

        <div class="card month-card">
          <h2>This Month</h2>
          <div class="amount">{{ formatCurrency(summary.thisMonthTotal) }}</div>
          <div class="average">Daily avg: {{ formatCurrency(summary.thisMonthAverage) }}</div>
          <div class="days-remaining">{{ summary.daysRemainingInMonth }} days remaining</div>
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

.today-card::before {
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
}

.month-card::before {
  background: linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%);
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
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.count,
.average,
.days-remaining {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.comparison {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comparison .increase {
  color: var(--danger);
  font-weight: 600;
}

.comparison .decrease {
  color: var(--success);
  font-weight: 600;
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
</style>

