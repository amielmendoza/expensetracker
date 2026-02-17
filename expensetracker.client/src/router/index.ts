import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';
import Dashboard from '@/views/Dashboard.vue';
import Expenses from '@/views/Expenses.vue';
import Income from '@/views/Income.vue';
import Accounts from '@/views/Accounts.vue';
import Reports from '@/views/Reports.vue';
import Categories from '@/views/Categories.vue';
import SavingsGoals from '@/views/SavingsGoals.vue';
import Login from '@/views/Login.vue';
import Landing from '@/views/Landing.vue';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing,
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: Expenses,
    },
    {
      path: '/income',
      name: 'income',
      component: Income,
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: Accounts,
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports,
    },
    {
      path: '/savings-goals',
      name: 'savings-goals',
      component: SavingsGoals,
    },
    {
      path: '/categories',
      name: 'categories',
      component: Categories,
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Wait for initial session check to complete
  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(() => authStore.loading, (val) => {
        if (!val) { unwatch(); resolve(); }
      }, { immediate: true });
    });
  }

  if (!to.meta?.public && !authStore.isAuthenticated) {
    return { name: 'login' };
  }

  if ((to.name === 'login') && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }
});

export default router;
