<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Income</h1>
      </div>
      <div class="header-right">
        <button class="btn-export" @click="exportCSV" v-if="incomes && incomes.length > 0" title="Export CSV">CSV</button>
        <button class="btn-add income" @click="openAddModal">+ Add Income</button>
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
          placeholder="Search income..."
          @input="onSearchInput"
        />
      </div>
      <div class="filter-category">
        <select v-model="filterCategoryId" @change="onFilterChange">
          <option value="">All Categories</option>
          <option v-for="cat in incomeCategories" :key="cat.id" :value="cat.id">
            {{ cat.icon }} {{ cat.name }}
          </option>
        </select>
      </div>
      <button v-if="hasActiveFilters" class="filter-clear" @click="onClearFilters">Clear</button>
    </div>

    <!-- Summary Stats -->
    <div class="summary-row" v-if="incomes && incomes.length > 0">
      <div class="summary-stat">
        <span class="stat-label">Total Income</span>
        <span class="stat-value income">{{ formatLargeAmount(totalIncome) }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Entries</span>
        <span class="stat-value">{{ incomes.length }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading income...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="btn-secondary">Retry</button>
    </div>
    <div v-else>
      <div v-if="!incomes || incomes.length === 0" class="empty-state">
        <div class="empty-icon">💰</div>
        <h3>No income recorded</h3>
        <p>Add your first income entry to start tracking your earnings!</p>
        <button @click="openAddModal" class="btn-add income">+ Add Your First Income</button>
      </div>
      <div v-else class="card">
        <div class="card-title">
          <h2>💵 Income Entries</h2>
          <span class="badge">{{ incomes.length }}</span>
        </div>
        <div class="transactions-list">
          <div
            v-for="income in sortedIncomes"
            :key="income.id"
            class="transaction-item"
          >
            <div class="transaction-icon" :style="{ backgroundColor: income.categoryColor || '#22c55e' }">
              {{ income.categoryIcon || '💰' }}
            </div>
            <div class="transaction-info">
              <div class="transaction-name">{{ income.description }}</div>
              <div class="transaction-meta">
                {{ income.categoryName || 'Income' }} • {{ formatDate(income.date) }} • {{ getSourceLabel(income.source) }}{{ income.accountName ? ' • ' + income.accountName : '' }}
              </div>
            </div>
            <div class="transaction-amount income">+{{ formatLargeAmount(income.amount) }}</div>
            <div class="transaction-actions">
              <button @click="editIncome(income)" class="btn-icon" title="Edit">✏️</button>
              <button @click="deleteIncome(income.id)" class="btn-icon delete" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :visible="!!deletingId"
      title="Delete Income?"
      message="This income entry will be permanently removed. This action cannot be undone."
      confirm-text="Delete"
      icon="🗑️"
      @confirm="confirmDelete"
      @cancel="deletingId = null"
    />

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingIncome" class="modal-overlay" @mousedown.self="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingIncome ? 'Edit Income' : 'Add Income' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="saveIncome">
          <div class="form-row">
            <div class="form-group">
              <label>Amount *</label>
              <input
                v-model.number="incomeForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input v-model="incomeForm.date" type="date" required />
            </div>
          </div>
          <div class="form-group">
            <label>Description *</label>
            <input v-model="incomeForm.description" placeholder="Income source or description" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select v-model="incomeForm.categoryId" required>
                <option value="">Select category</option>
                <option
                  v-for="category in incomeCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Source</label>
              <select v-model.number="incomeForm.source">
                <option :value="0">💼 Salary</option>
                <option :value="1">💻 Freelance</option>
                <option :value="2">🏢 Business</option>
                <option :value="3">📈 Investment</option>
                <option :value="4">🏠 Rental</option>
                <option :value="5">🎁 Gift</option>
                <option :value="6">↩️ Refund</option>
                <option :value="7">📦 Other</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Account</label>
            <select v-model="incomeForm.accountId">
              <option value="">No account</option>
              <option
                v-for="account in accounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.icon }} {{ account.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="incomeForm.notes" rows="2" placeholder="Optional notes..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-add income">{{ editingIncome ? 'Update' : 'Add' }} Income</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useIncomeStore } from '@/stores/incomeStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAccountStore } from '@/stores/accountStore';
import { formatDate, getTodayDateString } from '@/utils/dateUtils';
import { useToast } from '@/composables/useToast';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { downloadCSV } from '@/utils/exportUtils';
import type { Income } from '@/types';
import { IncomeSource, CategoryType } from '@/types';
import { formatAmount as formatLargeAmount } from '@/utils/currencyUtils';

const incomeStore = useIncomeStore();
const categoryStore = useCategoryStore();
const accountStore = useAccountStore();
const { showSuccess, showError } = useToast();

const { incomes, loading, error, selectedMonthLabel, isCurrentMonth, searchTerm, filterCategoryId } = storeToRefs(incomeStore);
const { fetchSelectedMonth, create, update, remove, goToPreviousMonth, goToNextMonth, goToCurrentMonth, clearFilters } = incomeStore;

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

const { categories } = storeToRefs(categoryStore);
const { fetchAll: fetchCategories } = categoryStore;

const { accounts } = storeToRefs(accountStore);
const { fetchAll: fetchAccounts } = accountStore;

const incomeCategories = computed(() =>
  categories.value?.filter(c => c.type === CategoryType.Income || c.type === CategoryType.Both) || []
);

const sortedIncomes = computed(() =>
  [...(incomes.value || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
);

const totalIncome = computed(() => incomes.value?.reduce((sum, i) => sum + i.amount, 0) || 0);

const showAddModal = ref(false);
const editingIncome = ref<Income | null>(null);

const incomeForm = reactive({
  amount: 0,
  description: '',
  categoryId: '',
  date: getTodayDateString(),
  source: IncomeSource.Salary,
  accountId: '',
  tags: [] as string[],
  notes: '',
});


function getSourceLabel(source: IncomeSource): string {
  const labels = {
    [IncomeSource.Salary]: 'Salary',
    [IncomeSource.Freelance]: 'Freelance',
    [IncomeSource.Business]: 'Business',
    [IncomeSource.Investment]: 'Investment',
    [IncomeSource.Rental]: 'Rental',
    [IncomeSource.Gift]: 'Gift',
    [IncomeSource.Refund]: 'Refund',
    [IncomeSource.Other]: 'Other',
  };
  return labels[source] || 'Other';
}

async function retryLoad() {
  try {
    await Promise.all([fetchSelectedMonth(), fetchCategories(), fetchAccounts()]);
  } catch (err) {
    console.error('Error loading income:', err);
  }
}

onMounted(async () => {
  await retryLoad();
});

function editIncome(income: Income) {
  editingIncome.value = income;
  incomeForm.amount = income.amount;
  incomeForm.description = income.description;
  incomeForm.categoryId = income.categoryId;
  incomeForm.date = income.date.split('T')[0] || '';
  incomeForm.source = income.source;
  incomeForm.accountId = income.accountId || '';
  incomeForm.tags = income.tags || [];
  incomeForm.notes = income.notes || '';
}

function openAddModal() {
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingIncome.value = null;
  resetForm();
}

function resetForm() {
  incomeForm.amount = 0;
  incomeForm.description = '';
  incomeForm.categoryId = '';
  incomeForm.date = getTodayDateString();
  incomeForm.source = IncomeSource.Salary;
  incomeForm.accountId = '';
  incomeForm.tags = [];
  incomeForm.notes = '';
}

async function saveIncome() {
  try {
    if (editingIncome.value) {
      await update(editingIncome.value.id, incomeForm);
      showSuccess('Income updated successfully');
    } else {
      await create(incomeForm);
      showSuccess('Income created successfully');
    }
    closeModal();
    await fetchSelectedMonth();
  } catch (err) {
    showError('Failed to save income');
    console.error('Failed to save income:', err);
  }
}

function exportCSV() {
  if (!incomes.value || incomes.value.length === 0) return;
  const data = incomes.value.map(i => ({
    Date: i.date.split('T')[0],
    Description: i.description,
    Amount: i.amount,
    Category: i.categoryName,
    Source: getSourceLabel(i.source),
    Account: i.accountName || '',
    Notes: i.notes || '',
  }));
  downloadCSV(data, `income-${selectedMonthLabel.value.replace(' ', '-')}.csv`);
  showSuccess('Income exported');
}

const deletingId = ref<string | null>(null);

function deleteIncome(id: string) {
  deletingId.value = id;
}

async function confirmDelete() {
  if (!deletingId.value) return;
  try {
    await remove(deletingId.value);
    showSuccess('Income deleted');
  } catch (err) {
    showError('Failed to delete income');
    console.error('Failed to delete income:', err);
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

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

.btn-add.income {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
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

.btn-add:hover {
  transform: translateY(-2px);
}

.btn-add.income:hover {
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.summary-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-stat {
  flex: 1;
  min-width: 120px;
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

.stat-value.income {
  color: #22c55e;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
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

.transaction-amount.income {
  color: #22c55e;
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
}

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

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

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

  .filter-bar {
    flex-wrap: wrap;
  }

  .filter-search {
    flex: 1 1 100%;
  }

  .filter-category {
    flex: 1;
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
