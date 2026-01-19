import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SavingsGoal, CreateSavingsGoal, UpdateSavingsGoal } from '@/types';
import { savingsGoalService } from '@/services/api/savingsGoalService';

export const useSavingsGoalStore = defineStore('savingsGoal', () => {
  const savingsGoals = ref<SavingsGoal[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const activeGoals = computed(() => {
    const now = new Date().toISOString().split('T')[0] || '';
    return savingsGoals.value.filter(
      (goal) => goal.isActive && goal.startDate <= now && goal.endDate >= now
    );
  });

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const result = await savingsGoalService.getAll();
      savingsGoals.value = result || [];
      console.log('Fetched savings goals:', savingsGoals.value.length);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch savings goals';
      console.error('Error fetching savings goals:', err);
      savingsGoals.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllActive() {
    loading.value = true;
    error.value = null;
    try {
      const result = await savingsGoalService.getAllActive();
      // Merge with existing goals
      result.forEach((goal) => {
        const index = savingsGoals.value.findIndex((g) => g.id === goal.id);
        if (index >= 0) {
          savingsGoals.value[index] = goal;
        } else {
          savingsGoals.value.push(goal);
        }
      });
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch active savings goals';
      console.error('Error fetching active savings goals:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const goal = await savingsGoalService.getById(id);
      const index = savingsGoals.value.findIndex((g) => g.id === id);
      if (index >= 0) {
        savingsGoals.value[index] = goal;
      } else {
        savingsGoals.value.push(goal);
      }
      return goal;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch savings goal';
      console.error('Error fetching savings goal:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function create(savingsGoal: CreateSavingsGoal) {
    loading.value = true;
    error.value = null;
    try {
      const newGoal = await savingsGoalService.create(savingsGoal);
      savingsGoals.value.unshift(newGoal);
      return newGoal;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create savings goal';
      console.error('Error creating savings goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, savingsGoal: UpdateSavingsGoal) {
    loading.value = true;
    error.value = null;
    try {
      const updatedGoal = await savingsGoalService.update(id, savingsGoal);
      const index = savingsGoals.value.findIndex((g) => g.id === id);
      if (index >= 0) {
        savingsGoals.value[index] = updatedGoal;
      }
      return updatedGoal;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update savings goal';
      console.error('Error updating savings goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function recalculateProgress(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const updatedGoal = await savingsGoalService.recalculateProgress(id);
      const index = savingsGoals.value.findIndex((g) => g.id === id);
      if (index >= 0) {
        savingsGoals.value[index] = updatedGoal;
      }
      return updatedGoal;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to recalculate savings goal progress';
      console.error('Error recalculating savings goal progress:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await savingsGoalService.delete(id);
      savingsGoals.value = savingsGoals.value.filter((g) => g.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete savings goal';
      console.error('Error deleting savings goal:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    savingsGoals,
    loading,
    error,
    activeGoals,
    fetchAll,
    fetchAllActive,
    fetchById,
    create,
    update,
    recalculateProgress,
    remove,
  };
});
