<template>
  <div class="incomes-page">
    <div class="page-header">
      <h1>Income</h1>
      <button @click="openAddModal" class="btn-success">+ Add Income</button>
    </div>

    <div v-if="loading" class="loading">Loading income...</div>
    <div v-else-if="error" class="error">
      <p><strong>Error:</strong> {{ error }}</p>
      <p style="font-size: 0.9rem; margin-top: 0.5rem;">Please check the browser console for more details.</p>
      <button @click="retryLoad" class="btn-success" style="margin-top: 1rem;">Retry</button>
    </div>
    <div v-else>
      <div v-if="!incomes || incomes.length === 0" class="empty-state">
        <p>No income found. Add your first income to get started!</p>
        <button @click="openAddModal" class="btn-success" style="margin-top: 1rem;">+ Add Your First Income</button>
      </div>
      <div v-else class="incomes-list">
        <div
          v-for="income in incomes"
          :key="income.id"
          class="income-card"
        >
          <div class="income-icon" :style="{ backgroundColor: income.categoryColor }">
            {{ income.categoryIcon }}
          </div>
          <div class="income-details">
            <div class="income-description">{{ income.description }}</div>
            <div class="income-meta">
              {{ formatDate(income.date) }} • {{ income.categoryName }} • {{ getSourceLabel(income.source) }}
            </div>
          </div>
          <div class="income-amount">{{ formatCurrency(income.amount) }}</div>
          <div class="income-actions">
            <button @click="editIncome(income)" class="btn-icon">✏️</button>
            <button @click="deleteIncome(income.id)" class="btn-icon">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Income Modal -->
    <div v-if="showAddModal || editingIncome" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingIncome ? 'Edit Income' : 'Add Income' }}</h2>
        <form @submit.prevent="saveIncome">
          <div class="form-group">
            <label>Amount *</label>
            <input
              v-model.number="incomeForm.amount"
              type="number"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label>Description *</label>
            <input v-model="incomeForm.description" required />
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select v-model="incomeForm.categoryId" required>
              <option value="">Select a category</option>
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
            <label>Date *</label>
            <input v-model="incomeForm.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Source</label>
            <select v-model.number="incomeForm.source">
              <option :value="0">Salary</option>
              <option :value="1">Freelance</option>
              <option :value="2">Business</option>
              <option :value="3">Investment</option>
              <option :value="4">Rental</option>
              <option :value="5">Gift</option>
              <option :value="6">Refund</option>
              <option :value="7">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="incomeForm.notes" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-success">Save</button>
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
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate, getTodayDateString } from '@/utils/dateUtils';
import type { Income } from '@/types';
import { IncomeSource, CategoryType } from '@/types';

const incomeStore = useIncomeStore();
const categoryStore = useCategoryStore();

const { incomes, loading, error } = storeToRefs(incomeStore);
const { fetchAll, create, update, remove } = incomeStore;

const { categories } = storeToRefs(categoryStore);
const { fetchAll: fetchCategories } = categoryStore;

const showAddModal = ref(false);
const editingIncome = ref<Income | null>(null);

const incomeCategories = computed(() => {
  return categories.value.filter(
    (cat) => cat.type === CategoryType.Income || cat.type === CategoryType.Both
  );
});

const incomeForm = reactive({
  amount: 0,
  description: '',
  categoryId: '',
  date: getTodayDateString(),
  source: IncomeSource.Salary,
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
  return labels[source] || 'Unknown';
}

async function retryLoad() {
  try {
    await Promise.all([fetchAll(), fetchCategories()]);
  } catch (err) {
    console.error('Error loading initial data:', err);
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
  incomeForm.tags = income.tags;
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
  incomeForm.tags = [];
  incomeForm.notes = '';
}

async function saveIncome() {
  try {
    if (editingIncome.value) {
      await update(editingIncome.value.id, incomeForm);
    } else {
      await create(incomeForm);
    }
    closeModal();
  } catch (err) {
    console.error('Failed to save income:', err);
  }
}

async function deleteIncome(id: string) {
  if (confirm('Are you sure you want to delete this income?')) {
    try {
      await remove(id);
    } catch (err) {
      console.error('Failed to delete income:', err);
    }
  }
}
</script>

<style scoped>
.incomes-page {
  padding: 3rem 0 2rem 0;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-success:active {
  transform: translateY(0);
}

.loading,
.error {
  text-align: center;
  padding: 3rem 2rem;
}

.loading {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.incomes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.income-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.income-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-lg);
  border-color: #10b981;
}

.income-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.income-card:hover .income-icon {
  transform: scale(1.1);
}

.income-details {
  flex: 1;
  min-width: 0;
}

.income-description {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.income-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.income-amount {
  font-weight: 700;
  color: #10b981;
  font-size: 1.5rem;
  letter-spacing: -0.01em;
}

.income-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h2 {
  margin: 0 0 2rem 0;
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  background: var(--bg-secondary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}
</style>
