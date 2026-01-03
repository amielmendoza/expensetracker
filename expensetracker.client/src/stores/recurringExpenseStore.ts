import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RecurringExpense, CreateRecurringExpense, UpdateRecurringExpense } from '@/types';
import { recurringExpenseService } from '@/services/api/recurringExpenseService';

export const useRecurringExpenseStore = defineStore('recurringExpense', () => {
  const recurringExpenses = ref<RecurringExpense[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const activeRecurringExpenses = computed(() => {
    return recurringExpenses.value.filter((re) => re.isActive);
  });

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      recurringExpenses.value = await recurringExpenseService.getAll();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch recurring expenses';
      console.error('Error fetching recurring expenses:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchActive() {
    loading.value = true;
    error.value = null;
    try {
      const active = await recurringExpenseService.getActive();
      recurringExpenses.value = active;
      return active;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch active recurring expenses';
      console.error('Error fetching active recurring expenses:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchUpcoming(days: number = 7) {
    loading.value = true;
    error.value = null;
    try {
      return await recurringExpenseService.getUpcoming(days);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch upcoming recurring expenses';
      console.error('Error fetching upcoming recurring expenses:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const recurringExpense = await recurringExpenseService.getById(id);
      const index = recurringExpenses.value.findIndex((re) => re.id === id);
      if (index >= 0) {
        recurringExpenses.value[index] = recurringExpense;
      } else {
        recurringExpenses.value.push(recurringExpense);
      }
      return recurringExpense;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch recurring expense';
      console.error('Error fetching recurring expense:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(recurringExpense: CreateRecurringExpense) {
    loading.value = true;
    error.value = null;
    try {
      const newRecurringExpense = await recurringExpenseService.create(recurringExpense);
      recurringExpenses.value.unshift(newRecurringExpense);
      return newRecurringExpense;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create recurring expense';
      console.error('Error creating recurring expense:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, recurringExpense: UpdateRecurringExpense) {
    loading.value = true;
    error.value = null;
    try {
      const updatedRecurringExpense = await recurringExpenseService.update(id, recurringExpense);
      const index = recurringExpenses.value.findIndex((re) => re.id === id);
      if (index >= 0) {
        recurringExpenses.value[index] = updatedRecurringExpense;
      }
      return updatedRecurringExpense;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update recurring expense';
      console.error('Error updating recurring expense:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await recurringExpenseService.delete(id);
      recurringExpenses.value = recurringExpenses.value.filter((re) => re.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete recurring expense';
      console.error('Error deleting recurring expense:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    recurringExpenses,
    loading,
    error,
    activeRecurringExpenses,
    fetchAll,
    fetchActive,
    fetchUpcoming,
    fetchById,
    create,
    update,
    remove,
  };
});
