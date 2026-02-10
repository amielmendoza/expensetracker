import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Income, CreateIncome, UpdateIncome, IncomeFilter } from '@/types';
import { incomeService } from '@/services/api/incomeService';
import { useAccountStore } from '@/stores/accountStore';

export const useIncomeStore = defineStore('income', () => {
  const incomes = ref<Income[]>([]);
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

  const todayIncomes = computed(() => {
    const today = new Date().toISOString().split('T')[0] || '';
    return incomes.value.filter((i) => i.date.startsWith(today));
  });

  const todayTotal = computed(() => {
    return todayIncomes.value.reduce((sum, i) => sum + i.amount, 0);
  });

  const thisMonthTotal = computed(() => {
    return incomes.value.reduce((sum, i) => sum + i.amount, 0);
  });

  async function fetchAll(filter?: IncomeFilter) {
    loading.value = true;
    error.value = null;
    try {
      const result = await incomeService.getAll(filter);
      incomes.value = result || [];
      console.log('Fetched incomes:', incomes.value.length);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch incomes';
      console.error('Error fetching incomes:', err);
      incomes.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const income = await incomeService.getById(id);
      const index = incomes.value.findIndex((i) => i.id === id);
      if (index >= 0) {
        incomes.value[index] = income;
      } else {
        incomes.value.push(income);
      }
      return income;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch income';
      console.error('Error fetching income:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchToday() {
    loading.value = true;
    error.value = null;
    try {
      const today = await incomeService.getToday();
      // Merge with existing incomes
      today.forEach((income) => {
        const index = incomes.value.findIndex((i) => i.id === income.id);
        if (index >= 0) {
          incomes.value[index] = income;
        } else {
          incomes.value.push(income);
        }
      });
      return today;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch today\'s incomes';
      console.error('Error fetching today\'s incomes:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchThisMonth() {
    loading.value = true;
    error.value = null;
    try {
      const monthIncomes = await incomeService.getThisMonth();
      incomes.value = monthIncomes;
      return monthIncomes;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch this month\'s incomes';
      console.error('Error fetching this month\'s incomes:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function create(income: CreateIncome) {
    loading.value = true;
    error.value = null;
    try {
      const newIncome = await incomeService.create(income);
      incomes.value.unshift(newIncome);
      if (income.accountId) useAccountStore().fetchAll();
      return newIncome;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create income';
      console.error('Error creating income:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, income: UpdateIncome) {
    loading.value = true;
    error.value = null;
    try {
      const updatedIncome = await incomeService.update(id, income);
      const index = incomes.value.findIndex((i) => i.id === id);
      if (index >= 0) {
        incomes.value[index] = updatedIncome;
      }
      useAccountStore().fetchAll();
      return updatedIncome;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update income';
      console.error('Error updating income:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await incomeService.delete(id);
      incomes.value = incomes.value.filter((i) => i.id !== id);
      useAccountStore().fetchAll();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete income';
      console.error('Error deleting income:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSelectedMonth(year?: number, month?: number) {
    if (year !== undefined) selectedYear.value = year;
    if (month !== undefined) selectedMonth.value = month;

    const startDate = new Date(selectedYear.value, selectedMonth.value, 1);
    const endDate = new Date(selectedYear.value, selectedMonth.value + 1, 0);

    const formatLocalDate = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    await fetchAll({
      startDate: formatLocalDate(startDate),
      endDate: formatLocalDate(endDate),
    });
  }

  function goToPreviousMonth() {
    if (selectedMonth.value === 0) {
      selectedMonth.value = 11;
      selectedYear.value--;
    } else {
      selectedMonth.value--;
    }
    fetchSelectedMonth();
  }

  function goToNextMonth() {
    const now = new Date();
    if (selectedYear.value === now.getFullYear() && selectedMonth.value >= now.getMonth()) {
      return;
    }
    if (selectedMonth.value === 11) {
      selectedMonth.value = 0;
      selectedYear.value++;
    } else {
      selectedMonth.value++;
    }
    fetchSelectedMonth();
  }

  function goToCurrentMonth() {
    const now = new Date();
    selectedYear.value = now.getFullYear();
    selectedMonth.value = now.getMonth();
    fetchSelectedMonth();
  }

  return {
    incomes,
    loading,
    error,
    selectedYear,
    selectedMonth,
    selectedMonthLabel,
    isCurrentMonth,
    todayIncomes,
    todayTotal,
    thisMonthTotal,
    fetchAll,
    fetchById,
    fetchToday,
    fetchThisMonth,
    fetchSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    create,
    update,
    remove,
  };
});
