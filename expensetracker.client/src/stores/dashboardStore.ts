import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DashboardSummary } from '@/types';
import { dashboardService } from '@/services/api/dashboardService';

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSummary() {
    loading.value = true;
    error.value = null;
    try {
      summary.value = await dashboardService.getSummary();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard summary';
      console.error('Error fetching dashboard summary:', err);
      // Don't rethrow - let the component handle the error state
    } finally {
      loading.value = false;
    }
  }

  return {
    summary,
    loading,
    error,
    fetchSummary,
  };
});

