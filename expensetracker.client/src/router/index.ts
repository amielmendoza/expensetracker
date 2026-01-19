import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import Expenses from '@/views/Expenses.vue';
import Income from '@/views/Income.vue';
import Categories from '@/views/Categories.vue';
import SavingsGoals from '@/views/SavingsGoals.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
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

export default router;




