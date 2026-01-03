import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Budget, CreateBudget, UpdateBudget } from '@/types';
import { budgetService } from '@/services/api/budgetService';

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref<Budget[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const activeBudgets = computed(() => {
    return budgets.value.filter((b) => b.isActive);
  });

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      budgets.value = await budgetService.getAll();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch budgets';
      console.error('Error fetching budgets:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchActive() {
    loading.value = true;
    error.value = null;
    try {
      const active = await budgetService.getActive();
      budgets.value = active;
      return active;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch active budgets';
      console.error('Error fetching active budgets:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const budget = await budgetService.getById(id);
      const index = budgets.value.findIndex((b) => b.id === id);
      if (index >= 0) {
        budgets.value[index] = budget;
      } else {
        budgets.value.push(budget);
      }
      return budget;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch budget';
      console.error('Error fetching budget:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(budget: CreateBudget) {
    loading.value = true;
    error.value = null;
    try {
      const newBudget = await budgetService.create(budget);
      budgets.value.unshift(newBudget);
      return newBudget;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create budget';
      console.error('Error creating budget:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, budget: UpdateBudget) {
    loading.value = true;
    error.value = null;
    try {
      const updatedBudget = await budgetService.update(id, budget);
      const index = budgets.value.findIndex((b) => b.id === id);
      if (index >= 0) {
        budgets.value[index] = updatedBudget;
      }
      return updatedBudget;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update budget';
      console.error('Error updating budget:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await budgetService.delete(id);
      budgets.value = budgets.value.filter((b) => b.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete budget';
      console.error('Error deleting budget:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStatus() {
    loading.value = true;
    error.value = null;
    try {
      return await budgetService.getStatus();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch budget status';
      console.error('Error fetching budget status:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  return {
    budgets,
    loading,
    error,
    activeBudgets,
    fetchAll,
    fetchActive,
    fetchById,
    create,
    update,
    remove,
    fetchStatus,
  };
});
