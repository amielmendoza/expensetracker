<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1>Reports</h1>
        <p class="subtitle">Income vs Expenses</p>
      </div>
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
      <div class="summary-row" v-if="monthlyData.length > 0">
        <div class="summary-stat">
          <span class="stat-label">Total Income</span>
          <span class="stat-value income">{{ formatLargeAmount(totalIncome) }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Total Expenses</span>
          <span class="stat-value expense">{{ formatLargeAmount(totalExpenses) }}</span>
        </div>
        <div class="summary-stat">
          <span class="stat-label">Net Savings</span>
          <span class="stat-value" :class="totalNet >= 0 ? 'income' : 'expense'">
            {{ totalNet >= 0 ? '+' : '' }}{{ formatLargeAmount(totalNet) }}
          </span>
        </div>
      </div>

      <!-- Chart -->
      <div class="card" v-if="monthlyData.length > 0">
        <h2 class="card-title">Monthly Comparison</h2>
        <div class="chart-container">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Detail Table -->
      <div class="card" v-if="monthlyData.length > 0">
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
              <tr v-for="row in monthlyData" :key="`${row.year}-${row.month}`">
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

      <div v-if="monthlyData.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No data yet</h3>
        <p>Start adding expenses and income to see your reports.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useReportsStore } from '@/stores/reportsStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const reportsStore = useReportsStore();
const { monthlyData, loading, error, totalIncome, totalExpenses, totalNet } = storeToRefs(reportsStore);
const { fetchMonthlyComparison } = reportsStore;

const chartData = computed(() => ({
  labels: monthlyData.value.map((m) => `${m.month} ${m.year}`),
  datasets: [
    {
      label: 'Income',
      data: monthlyData.value.map((m) => m.income),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 6,
    },
    {
      label: 'Expenses',
      data: monthlyData.value.map((m) => m.expenses),
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

const formatLargeAmount = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absAmount >= 1000000) {
    return `${sign}₱${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}₱${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}₱${absAmount.toFixed(0)}`;
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
