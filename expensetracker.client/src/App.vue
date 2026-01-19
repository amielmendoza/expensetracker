<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">💰 Expense Tracker</router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link" exact-active-class="router-link-exact-active">Dashboard</router-link>
          <router-link to="/expenses" class="nav-link" exact-active-class="router-link-exact-active">Expenses</router-link>
          <router-link to="/income" class="nav-link" exact-active-class="router-link-exact-active">Income</router-link>
          <router-link to="/savings-goals" class="nav-link" exact-active-class="router-link-exact-active">Savings Goals</router-link>
          <router-link to="/categories" class="nav-link" exact-active-class="router-link-exact-active">Categories</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <div class="page-container">
        <router-view />
      </div>
      <QuickAddExpense />
    </main>
  </div>
</template>

<script setup lang="ts">
import QuickAddExpense from '@/components/QuickAddExpense.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  --secondary: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid var(--border);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 3rem;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.nav-link.router-link-exact-active {
  color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
  font-weight: 600;
}

.main-content {
  flex: 1;
  padding: 0;
  background: var(--bg-primary);
  width: 100%;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 0 2rem;
}
</style>
