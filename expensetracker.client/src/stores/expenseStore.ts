import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Expense, CreateExpense, UpdateExpense, ExpenseFilter } from '@/types';
import { expenseService } from '@/services/api/expenseService';

export const useExpenseStore = defineStore('expense', () => {
  const expenses = ref<Expense[]>([]);
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

  const todayExpenses = computed(() => {
    const today = new Date().toISOString().split('T')[0] || '';
    return expenses.value.filter((e) => e.date.startsWith(today));
  });

  const todayTotal = computed(() => {
    return todayExpenses.value.reduce((sum, e) => sum + e.amount, 0);
  });

  async function fetchAll(filter?: ExpenseFilter) {
    loading.value = true;
    error.value = null;
    try {
      const result = await expenseService.getAll(filter);
      expenses.value = result || [];
      console.log('Fetched expenses:', expenses.value.length);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch expenses';
      console.error('Error fetching expenses:', err);
      expenses.value = []; // Ensure it's an empty array on error
      // Don't rethrow - let the component handle the error state
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const expense = await expenseService.getById(id);
      const index = expenses.value.findIndex((e) => e.id === id);
      if (index >= 0) {
        expenses.value[index] = expense;
      } else {
        expenses.value.push(expense);
      }
      return expense;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch expense';
      console.error('Error fetching expense:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchToday() {
    loading.value = true;
    error.value = null;
    try {
      const today = await expenseService.getToday();
      // Merge with existing expenses
      today.forEach((expense) => {
        const index = expenses.value.findIndex((e) => e.id === expense.id);
        if (index >= 0) {
          expenses.value[index] = expense;
        } else {
          expenses.value.push(expense);
        }
      });
      return today;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch today\'s expenses';
      console.error('Error fetching today\'s expenses:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchThisMonth() {
    loading.value = true;
    error.value = null;
    try {
      const monthExpenses = await expenseService.getThisMonth();
      expenses.value = monthExpenses;
      return monthExpenses;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch this month\'s expenses';
      console.error('Error fetching this month\'s expenses:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function create(expense: CreateExpense) {
    loading.value = true;
    error.value = null;
    try {
      const newExpense = await expenseService.create(expense);
      expenses.value.unshift(newExpense);
      return newExpense;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create expense';
      console.error('Error creating expense:', err);
      throw err; // Re-throw for UI to show error message
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, expense: UpdateExpense) {
    loading.value = true;
    error.value = null;
    try {
      const updatedExpense = await expenseService.update(id, expense);
      const index = expenses.value.findIndex((e) => e.id === id);
      if (index >= 0) {
        expenses.value[index] = updatedExpense;
      }
      return updatedExpense;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update expense';
      console.error('Error updating expense:', err);
      throw err; // Re-throw for UI to show error message
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await expenseService.delete(id);
      expenses.value = expenses.value.filter((e) => e.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete expense';
      console.error('Error deleting expense:', err);
      throw err; // Re-throw for UI to show error message
    } finally {
      loading.value = false;
    }
  }

  async function fetchSelectedMonth(year?: number, month?: number) {
    // Update selected month if provided
    if (year !== undefined) selectedYear.value = year;
    if (month !== undefined) selectedMonth.value = month;

    // Use local date formatting to avoid timezone issues
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
    fetchSelectedMonth();
  }

  function goToCurrentMonth() {
    const now = new Date();
    selectedYear.value = now.getFullYear();
    selectedMonth.value = now.getMonth();
    fetchSelectedMonth();
  }

  return {
    expenses,
    loading,
    error,
    selectedYear,
    selectedMonth,
    selectedMonthLabel,
    isCurrentMonth,
    todayExpenses,
    todayTotal,
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

