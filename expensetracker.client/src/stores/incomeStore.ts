import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Income, CreateIncome, UpdateIncome, IncomeFilter } from '@/types';
import { incomeService } from '@/services/api/incomeService';

export const useIncomeStore = defineStore('income', () => {
  const incomes = ref<Income[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const todayIncomes = computed(() => {
    const today = new Date().toISOString().split('T')[0] || '';
    return incomes.value.filter((i) => i.date.startsWith(today));
  });

  const todayTotal = computed(() => {
    return todayIncomes.value.reduce((sum, i) => sum + i.amount, 0);
  });

  const thisMonthTotal = computed(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || '';
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] || '';

    return incomes.value
      .filter((i) => i.date >= startOfMonth && i.date <= endOfMonth)
      .reduce((sum, i) => sum + i.amount, 0);
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
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete income';
      console.error('Error deleting income:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    incomes,
    loading,
    error,
    todayIncomes,
    todayTotal,
    thisMonthTotal,
    fetchAll,
    fetchById,
    fetchToday,
    fetchThisMonth,
    create,
    update,
    remove,
  };
});
