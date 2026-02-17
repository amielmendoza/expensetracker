<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1>Reports</h1>
        <p class="subtitle">Income vs Expenses</p>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="date-range-bar">
      <div class="date-input">
        <label>From</label>
        <input type="month" v-model="startMonth" @change="onDateChange" />
      </div>
      <div class="date-input">
        <label>To</label>
        <input type="month" v-model="endMonth" @change="onDateChange" />
      </div>
      <button v-if="hasDateFilter" class="filter-clear" @click="clearDateFilter">Clear</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading report data...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="btn-secondary">Retry</button>
    </div>
    <div v-else>
      <!-- Summary Stats -->
      <div class="summary-row" v-if="filteredMonthlyData.length > 0">
        <div class="summary-stat">
          <span class="stat-label">Total Income</span>
          <span class="stat-value income">{{ formatLargeAmount(filteredTotalIncome) }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Total Expenses</span>
          <span class="stat-value expense">{{ formatLargeAmount(filteredTotalExpenses) }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Net Savings</span>
          <span class="stat-value" :class="filteredTotalNet >= 0 ? 'income' : 'expense'">
            {{ filteredTotalNet >= 0 ? '+' : '' }}{{ formatLargeAmount(filteredTotalNet) }}
          </span>
        </div>
      </div>

      <!-- Chart -->
      <div class="card" v-if="filteredMonthlyData.length > 0">
        <h2 class="card-title">Monthly Comparison</h2>
        <div class="chart-container">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="card" v-if="categoryBreakdown.length > 0">
        <h2 class="card-title">Expense Categories (This Month)</h2>
        <div class="doughnut-container">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>

      <!-- Detail Table -->
      <div class="card" v-if="filteredMonthlyData.length > 0">
        <h2 class="card-title">Monthly Breakdown</h2>
        <div class="table-wrapper">
          <table class="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th class="text-right">Income</th>
                <th class="text-right">Expenses</th>
                <th class="text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredMonthlyData" :key="`${row.year}-${row.month}`">
                <td>{{ row.month }} {{ row.year }}</td>
                <td class="text-right income">{{ formatLargeAmount(row.income) }}</td>
                <td class="text-right expense">{{ formatLargeAmount(row.expenses) }}</td>
                <td class="text-right" :class="row.net >= 0 ? 'income' : 'expense'">
                  {{ row.net >= 0 ? '+' : '' }}{{ formatLargeAmount(row.net) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="filteredMonthlyData.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No data yet</h3>
        <p>Start adding expenses and income to see your reports.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useReportsStore } from '@/stores/reportsStore';
import { formatAmount as formatLargeAmount } from '@/utils/currencyUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const reportsStore = useReportsStore();
const { monthlyData, categoryBreakdown, loading, error, totalIncome, totalExpenses, totalNet } = storeToRefs(reportsStore);
const { fetchMonthlyComparison } = reportsStore;

const startMonth = ref('');
const endMonth = ref('');
const hasDateFilter = computed(() => startMonth.value !== '' || endMonth.value !== '');

const filteredMonthlyData = computed(() => {
  if (!hasDateFilter.value) return monthlyData.value;
  const MONTH_MAP: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  return monthlyData.value.filter(m => {
    const monthNum = MONTH_MAP[m.month] ?? 0;
    const key = `${m.year}-${String(monthNum + 1).padStart(2, '0')}`;
    if (startMonth.value && key < startMonth.value) return false;
    if (endMonth.value && key > endMonth.value) return false;
    return true;
  });
});

const filteredTotalIncome = computed(() => filteredMonthlyData.value.reduce((s, m) => s + m.income, 0));
const filteredTotalExpenses = computed(() => filteredMonthlyData.value.reduce((s, m) => s + m.expenses, 0));
const filteredTotalNet = computed(() => filteredMonthlyData.value.reduce((s, m) => s + m.net, 0));

function onDateChange() { /* reactive filtering via computed */ }
function clearDateFilter() { startMonth.value = ''; endMonth.value = ''; }

const chartData = computed(() => ({
  labels: filteredMonthlyData.value.map((m) => `${m.month} ${m.year}`),
  datasets: [
    {
      label: 'Income',
      data: filteredMonthlyData.value.map((m) => m.income),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 6,
    },
    {
      label: 'Expenses',
      data: filteredMonthlyData.value.map((m) => m.expenses),
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderColor: '#ef4444',
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 13, weight: 500 as const },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed.y;
          return `${context.dataset.label}: ₱${value.toLocaleString()}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.06)' },
      ticks: {
        font: { size: 12 },
        callback: (value: any) => {
          if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
          return `₱${value}`;
        },
      },
    },
  },
};

const doughnutData = computed(() => ({
  labels: categoryBreakdown.value.map((c) => c.categoryName),
  datasets: [
    {
      data: categoryBreakdown.value.map((c) => c.totalAmount),
      backgroundColor: categoryBreakdown.value.map((c) => c.categoryColor),
      borderWidth: 2,
      borderColor: 'var(--bg-secondary)',
      hoverOffset: 6,
    },
  ],
}));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { size: 12, weight: 500 as const },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return `${context.label}: ₱${value.toLocaleString()} (${pct}%)`;
        },
      },
    },
  },
};


async function retryLoad() {
  await fetchMonthlyComparison();
}

onMounted(() => {
  fetchMonthlyComparison();
});
</script>

<style scoped>
.reports-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.date-range-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-end;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-input label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.date-input input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.date-input input:focus {
  outline: none;
  border-color: var(--primary);
}

.filter-clear {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-clear:hover {
  background: var(--danger);
  color: white;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-stat {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-value.income {
  color: var(--success);
}

.stat-value.expense {
  color: var(--danger);
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.chart-container {
  height: 350px;
  position: relative;
}

.doughnut-container {
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-wrapper {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th,
.report-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.report-table th {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-table td {
  font-size: 0.95rem;
  font-weight: 500;
}

.text-right {
  text-align: right;
}

.income {
  color: var(--success);
}

.expense {
  color: var(--danger);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: var(--danger);
}

.btn-secondary {
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.75rem;
}

.btn-secondary:hover {
  background: var(--bg-primary);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .summary-row {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 280px;
  }

  .card {
    padding: 1rem;
  }

  .report-table th,
  .report-table td {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}
</style>
