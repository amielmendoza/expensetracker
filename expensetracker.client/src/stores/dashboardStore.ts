import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DashboardSummary } from '@/types';
import { dashboardService } from '@/services/api/dashboardService';

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Selected month state (defaults to current month)
  const now = new Date();
  const selectedYear = ref(now.getFullYear());
  const selectedMonth = ref(now.getMonth()); // 0-indexed

  const isCurrentMonth = computed(() => {
    const now = new Date();
    return selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth();
  });

  const selectedMonthLabel = computed(() => {
    const date = new Date(selectedYear.value, selectedMonth.value, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  async function fetchSummary(year?: number, month?: number) {
    // Update selected month if provided
    if (year !== undefined) selectedYear.value = year;
    if (month !== undefined) selectedMonth.value = month;

    loading.value = true;
    error.value = null;
    try {
      summary.value = await dashboardService.getSummary(selectedYear.value, selectedMonth.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard summary';
      console.error('Error fetching dashboard summary:', err);
      // Don't rethrow - let the component handle the error state
    } finally {
      loading.value = false;
    }
  }

  function goToPreviousMonth() {
    if (selectedMonth.value === 0) {
      selectedMonth.value = 11;
      selectedYear.value--;
    } else {
      selectedMonth.value--;
    }
    fetchSummary();
  }

  function goToNextMonth() {
    const now = new Date();
    // Don't allow going past current month
    if (selectedYear.value === now.getFullYear() && selectedMonth.value >= now.getMonth()) {
      return;
    }
    if (selectedMonth.value === 11) {
      selectedMonth.value = 0;
      selectedYear.value++;
    } else {
      selectedMonth.value++;
    }
    fetchSummary();
  }

  function goToCurrentMonth() {
    const now = new Date();
    selectedYear.value = now.getFullYear();
    selectedMonth.value = now.getMonth();
    fetchSummary();
  }

  return {
    summary,
    loading,
    error,
    selectedYear,
    selectedMonth,
    selectedMonthLabel,
    isCurrentMonth,
    fetchSummary,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
});

