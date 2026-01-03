import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import Expenses from '@/views/Expenses.vue';
import Categories from '@/views/Categories.vue';

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
      path: '/categories',
      name: 'categories',
      component: Categories,
    },
  ],
});

export default router;


