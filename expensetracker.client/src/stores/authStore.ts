import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import { useExpenseStore } from '@/stores/expenseStore';
import { useIncomeStore } from '@/stores/incomeStore';
import { useAccountStore } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useReportsStore } from '@/stores/reportsStore';
import { useSavingsGoalStore } from '@/stores/savingsGoalStore';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!session.value);
  const userEmail = computed(() => user.value?.email || '');

  async function initialize() {
    loading.value = true;
    try {
      const { data } = await supabase.auth.getSession();
      session.value = data.session;
      user.value = data.session?.user ?? null;
    } catch (err) {
      console.error('Failed to get session:', err);
    } finally {
      loading.value = false;
    }

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
    });
  }

  async function signUp(email: string, password: string) {
    error.value = null;
    loading.value = true;
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Signup failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function signIn(email: string, password: string) {
    error.value = null;
    loading.value = true;
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      session.value = data.session;
      user.value = data.user;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    session.value = null;
    user.value = null;
    resetAllStores();
  }

  function resetAllStores() {
    useExpenseStore().$patch({ expenses: [], error: null });
    useIncomeStore().$patch({ incomes: [], error: null });
    useAccountStore().$patch({ accounts: [], error: null });
    useCategoryStore().$patch({ categories: [], error: null });
    useDashboardStore().$patch({ summary: null, error: null });
    useReportsStore().$patch({ monthlyData: [], categoryBreakdown: [], error: null });
    useSavingsGoalStore().$patch({ savingsGoals: [], error: null });
  }

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    userEmail,
    initialize,
    signUp,
    signIn,
    signOut,
  };
});
