import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MonthlyReport } from '@/types';
import { reportsService } from '@/services/api/reportsService';

export const useReportsStore = defineStore('reports', () => {
  const monthlyData = ref<MonthlyReport[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const totalIncome = computed(() =>
    monthlyData.value.reduce((sum, m) => sum + m.income, 0)
  );

  const totalExpenses = computed(() =>
    monthlyData.value.reduce((sum, m) => sum + m.expenses, 0)
  );

  const totalNet = computed(() =>
    monthlyData.value.reduce((sum, m) => sum + m.net, 0)
  );

  async function fetchMonthlyComparison(months: number = 6) {
    loading.value = true;
    error.value = null;
    try {
      monthlyData.value = await reportsService.getMonthlyComparison(months);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load report data';
      console.error('Error fetching reports:', err);
    } finally {
      loading.value = false;
    }
  }

  return {
    monthlyData,
    loading,
    error,
    totalIncome,
    totalExpenses,
    totalNet,
    fetchMonthlyComparison,
  };
});
