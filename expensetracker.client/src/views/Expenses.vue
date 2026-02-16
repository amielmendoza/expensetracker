<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Expenses</h1>
      </div>
      <div class="header-right">
        <button class="btn-export" @click="exportCSV" v-if="expenses && expenses.length > 0" title="Export CSV">CSV</button>
        <button class="btn-add" @click="openAddModal">+ Add Expense</button>
      </div>
    </div>

    <!-- Month Selector -->
    <div class="month-selector">
      <button class="month-nav-btn" @click="goToPreviousMonth">&larr;</button>
      <span class="current-month">{{ selectedMonthLabel }}</span>
      <button class="month-nav-btn" @click="goToNextMonth" :disabled="isCurrentMonth">&rarr;</button>
      <button v-if="!isCurrentMonth" class="today-btn" @click="goToCurrentMonth">Today</button>
    </div>

    <!-- Search & Filters -->
    <div class="filter-bar">
      <div class="filter-search">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Search expenses..."
          @input="onSearchInput"
        />
      </div>
      <div class="filter-category">
        <select v-model="filterCategoryId" @change="onFilterChange">
          <option value="">All Categories</option>
          <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
            {{ cat.icon }} {{ cat.name }}
          </option>
        </select>
      </div>
      <button v-if="hasActiveFilters" class="filter-clear" @click="onClearFilters">Clear</button>
    </div>

    <!-- Summary Stats -->
    <div class="summary-row" v-if="expenses && expenses.length > 0">
      <div class="summary-stat">
        <span class="stat-label">Total</span>
        <span class="stat-value expense">{{ formatLargeAmount(totalExpenses) }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Recurring</span>
        <span class="stat-value">{{ formatLargeAmount(recurringTotal) }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">One-time</span>
        <span class="stat-value">{{ formatLargeAmount(oneTimeTotal) }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Count</span>
        <span class="stat-value">{{ expenses.length }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading expenses...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="btn-secondary">Retry</button>
    </div>
    <div v-else>
      <div v-if="!expenses || expenses.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No expenses found</h3>
        <p>Add your first expense to get started tracking your spending!</p>
        <button @click="openAddModal" class="btn-add">+ Add Your First Expense</button>
      </div>
      <div v-else class="sections-container">
        <!-- Recurring Expenses -->
        <div class="card" v-if="recurringExpenses.length > 0">
          <div class="card-title">
            <h2>🔄 Monthly Recurring</h2>
            <span class="badge">{{ recurringExpenses.length }}</span>
          </div>
          <div class="transactions-list">
            <div
              v-for="expense in recurringExpenses"
              :key="expense.id"
              class="transaction-item"
            >
              <div class="transaction-icon" :style="{ backgroundColor: expense.categoryColor }">
                {{ expense.categoryIcon }}
              </div>
              <div class="transaction-info">
                <div class="transaction-name">{{ expense.description }}</div>
                <div class="transaction-meta">{{ expense.categoryName }} • {{ formatDate(expense.date) }}{{ expense.accountName ? ' • ' + expense.accountName : '' }}</div>
              </div>
              <div class="transaction-amount expense">-{{ formatLargeAmount(expense.amount) }}</div>
              <div class="transaction-actions">
                <button @click="editExpense(expense)" class="btn-icon" title="Edit">✏️</button>
                <button @click="deleteExpense(expense.id)" class="btn-icon delete" title="Delete">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- One-time Expenses -->
        <div class="card">
          <div class="card-title">
            <h2>📝 One-time Expenses</h2>
            <span class="badge">{{ oneTimeExpenses.length }}</span>
          </div>
          <div v-if="oneTimeExpenses.length === 0" class="empty-section">
            No one-time expenses this month
          </div>
          <div v-else class="transactions-list">
            <div
              v-for="expense in oneTimeExpenses"
              :key="expense.id"
              class="transaction-item"
            >
              <div class="transaction-icon" :style="{ backgroundColor: expense.categoryColor }">
                {{ expense.categoryIcon }}
              </div>
              <div class="transaction-info">
                <div class="transaction-name">{{ expense.description }}</div>
                <div class="transaction-meta">{{ expense.categoryName }} • {{ formatDate(expense.date) }}{{ expense.accountName ? ' • ' + expense.accountName : '' }}</div>
              </div>
              <div class="transaction-amount expense">-{{ formatLargeAmount(expense.amount) }}</div>
              <div class="transaction-actions">
                <button @click="editExpense(expense)" class="btn-icon" title="Edit">✏️</button>
                <button @click="deleteExpense(expense.id)" class="btn-icon delete" title="Delete">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :visible="!!deletingId"
      title="Delete Expense?"
      message="This expense will be permanently removed. This action cannot be undone."
      confirm-text="Delete"
      icon="🗑️"
      @confirm="confirmDelete"
      @cancel="deletingId = null"
    />

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingExpense" class="modal-overlay" @mousedown.self="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingExpense ? 'Edit Expense' : 'Add Expense' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="saveExpense">
          <div class="form-row">
            <div class="form-group">
              <label>Amount *</label>
              <input
                v-model.number="expenseForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input v-model="expenseForm.date" type="date" required />
            </div>
          </div>
          <div class="form-group">
            <label>Description *</label>
            <input v-model="expenseForm.description" placeholder="What did you spend on?" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select v-model="expenseForm.categoryId" required>
                <option value="">Select category</option>
                <option
                  v-for="category in expenseCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Account</label>
              <select v-model="expenseForm.accountId">
                <option value="">No account (cash)</option>
                <option
                  v-for="account in accounts"
                  :key="account.id"
                  :value="account.id"
                >
                  {{ account.icon }} {{ account.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="expenseForm.notes" rows="2" placeholder="Optional notes..."></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="expenseForm.isMonthlyRecurring" />
              <span class="checkbox-text">Monthly Recurring</span>
            </label>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-add">{{ editingExpense ? 'Update' : 'Add' }} Expense</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useExpenseStore } from '@/stores/expenseStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAccountStore } from '@/stores/accountStore';
import { formatDate, getTodayDateString } from '@/utils/dateUtils';
import { useToast } from '@/composables/useToast';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { downloadCSV } from '@/utils/exportUtils';
import type { Expense } from '@/types';
import { PaymentMethod, CategoryType } from '@/types';

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const accountStore = useAccountStore();
const { showSuccess, showError } = useToast();

const { expenses, loading, error, selectedMonthLabel, isCurrentMonth, searchTerm, filterCategoryId } = storeToRefs(expenseStore);
const { fetchSelectedMonth, create, update, remove, goToPreviousMonth, goToNextMonth, goToCurrentMonth, clearFilters } = expenseStore;

const hasActiveFilters = computed(() => searchTerm.value !== '' || filterCategoryId.value !== '');

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchSelectedMonth();
  }, 300);
}

function onFilterChange() {
  fetchSelectedMonth();
}

function onClearFilters() {
  clearFilters();
}

const recurringExpenses = computed(() =>
  expenses.value?.filter(e => e.isMonthlyRecurring).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []
);

const oneTimeExpenses = computed(() =>
  expenses.value?.filter(e => !e.isMonthlyRecurring).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || []
);

const totalExpenses = computed(() => expenses.value?.reduce((sum, e) => sum + e.amount, 0) || 0);
const recurringTotal = computed(() => recurringExpenses.value.reduce((sum, e) => sum + e.amount, 0));
const oneTimeTotal = computed(() => oneTimeExpenses.value.reduce((sum, e) => sum + e.amount, 0));

const { categories } = storeToRefs(categoryStore);
const { fetchAll: fetchCategories } = categoryStore;

const { accounts } = storeToRefs(accountStore);
const { fetchAll: fetchAccounts } = accountStore;

const expenseCategories = computed(() =>
  categories.value?.filter(c => c.type === CategoryType.Expense || c.type === CategoryType.Both) || []
);

const showAddModal = ref(false);
const editingExpense = ref<Expense | null>(null);

const expenseForm = reactive({
  amount: 0,
  description: '',
  categoryId: '',
  date: getTodayDateString(),
  paymentMethod: PaymentMethod.Cash,
  accountId: '',
  tags: [] as string[],
  notes: '',
  isMonthlyRecurring: false,
});

const formatLargeAmount = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absAmount >= 1000000) {
    return `${sign}₱${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}₱${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}₱${absAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

async function retryLoad() {
  try {
    await Promise.all([fetchSelectedMonth(), fetchCategories(), fetchAccounts()]);
  } catch (err) {
    console.error('Error loading initial data:', err);
  }
}

onMounted(async () => {
  await retryLoad();
});

function editExpense(expense: Expense) {
  editingExpense.value = expense;
  expenseForm.amount = expense.amount;
  expenseForm.description = expense.description;
  expenseForm.categoryId = expense.categoryId;
  expenseForm.date = expense.date.split('T')[0] || '';
  expenseForm.paymentMethod = expense.paymentMethod;
  expenseForm.accountId = expense.accountId || '';
  expenseForm.tags = expense.tags;
  expenseForm.notes = expense.notes || '';
  expenseForm.isMonthlyRecurring = expense.isMonthlyRecurring;
}

function openAddModal() {
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingExpense.value = null;
  resetForm();
}

function resetForm() {
  expenseForm.amount = 0;
  expenseForm.description = '';
  expenseForm.categoryId = '';
  expenseForm.date = getTodayDateString();
  expenseForm.paymentMethod = PaymentMethod.Cash;
  expenseForm.accountId = '';
  expenseForm.tags = [];
  expenseForm.notes = '';
  expenseForm.isMonthlyRecurring = false;
}

async function saveExpense() {
  try {
    if (editingExpense.value) {
      await update(editingExpense.value.id, expenseForm);
      showSuccess('Expense updated successfully');
    } else {
      await create(expenseForm);
      showSuccess('Expense created successfully');
    }
    closeModal();
    await fetchSelectedMonth();
  } catch (err) {
    showError('Failed to save expense');
    console.error('Failed to save expense:', err);
  }
}

function exportCSV() {
  if (!expenses.value || expenses.value.length === 0) return;
  const data = expenses.value.map(e => ({
    Date: e.date.split('T')[0],
    Description: e.description,
    Amount: e.amount,
    Category: e.categoryName,
    Account: e.accountName || 'Cash',
    Recurring: e.isMonthlyRecurring ? 'Yes' : 'No',
    Notes: e.notes || '',
  }));
  downloadCSV(data, `expenses-${selectedMonthLabel.value.replace(' ', '-')}.csv`);
  showSuccess('Expenses exported');
}

const deletingId = ref<string | null>(null);

function deleteExpense(id: string) {
  deletingId.value = id;
}

async function confirmDelete() {
  if (!deletingId.value) return;
  try {
    await remove(deletingId.value);
    showSuccess('Expense deleted');
  } catch (err) {
    showError('Failed to delete expense');
    console.error('Failed to delete expense:', err);
  } finally {
    deletingId.value = null;
  }
}
</script>

<style scoped>
.page-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.btn-add {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.btn-export {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-export:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Month Selector */
.month-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.month-nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-nav-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.filter-search {
  flex: 1;
}

.filter-search input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-search input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filter-category select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-clear {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-clear:hover {
  background: var(--danger);
  color: white;
}

.month-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.current-month {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.today-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--primary);
  border-radius: 6px;
  background: transparent;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-btn:hover {
  background: var(--primary);
  color: white;
}

/* Summary Row */
.summary-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-stat {
  flex: 1;
  min-width: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.expense {
  color: #ef4444;
}

/* Card */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.badge {
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

/* Transactions List */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.transaction-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.transaction-amount {
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
}

.transaction-amount.expense {
  color: #ef4444;
}

.transaction-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--border);
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
}

.empty-section {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Loading & Error */
.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--text-secondary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
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

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  text-transform: none;
  letter-spacing: normal;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .summary-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .transaction-item {
    flex-wrap: wrap;
  }

  .transaction-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border);
  }
}

@media (max-width: 480px) {
  .header-left h1 {
    font-size: 1.5rem;
  }

  .transaction-name {
    max-width: 150px;
  }

  .summary-stat {
    min-width: auto;
  }
}
</style>
