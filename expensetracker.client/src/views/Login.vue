<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h1>ExpenseTracker</h1>
        <p>{{ isSignUp ? 'Create your account' : 'Sign in to your account' }}</p>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Your password"
            minlength="6"
            :autocomplete="isSignUp ? 'new-password' : 'current-password'"
          />
        </div>
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success-text">{{ successMsg }}</p>
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>
      <p class="toggle-text">
        {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" @click.prevent="toggleMode">
          {{ isSignUp ? 'Sign In' : 'Sign Up' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isSignUp = ref(false);
const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

function toggleMode() {
  isSignUp.value = !isSignUp.value;
  errorMsg.value = '';
  successMsg.value = '';
}

async function handleSubmit() {
  errorMsg.value = '';
  successMsg.value = '';
  submitting.value = true;

  try {
    if (isSignUp.value) {
      const data = await authStore.signUp(email.value, password.value);
      if (data.session) {
        router.push('/');
      } else {
        successMsg.value = 'Account created! Check your email to confirm, then sign in.';
        isSignUp.value = false;
      }
    } else {
      await authStore.signIn(email.value, password.value);
      router.push('/');
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Something went wrong';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 1rem;
}

.login-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-xl);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f5b731 0%, #e5a520 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 183, 49, 0.3);
}

.login-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.login-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: var(--danger);
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
  padding: 0.625rem 0.875rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}

.success-text {
  color: var(--success);
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
  padding: 0.625rem 0.875rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
}

.toggle-text {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.toggle-text a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.toggle-text a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
    border-radius: 16px;
  }
}
</style>
