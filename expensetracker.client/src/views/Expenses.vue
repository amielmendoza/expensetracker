<template>
  <div class="expenses-page">
    <div class="page-header">
      <h1>Expenses</h1>
      <button @click="openAddModal" class="btn-primary">+ Add Expense</button>
    </div>

    <div v-if="loading" class="loading">Loading expenses...</div>
    <div v-else-if="error" class="error">
      <p><strong>Error:</strong> {{ error }}</p>
      <p style="font-size: 0.9rem; margin-top: 0.5rem;">Please check the browser console for more details.</p>
      <button @click="retryLoad" class="btn-primary" style="margin-top: 1rem;">Retry</button>
    </div>
    <div v-else>
      <div v-if="!expenses || expenses.length === 0" class="empty-state">
        <p>No expenses found. Add your first expense to get started!</p>
        <button @click="openAddModal" class="btn-primary" style="margin-top: 1rem;">+ Add Your First Expense</button>
      </div>
      <div v-else class="expenses-list">
        <div
          v-for="expense in expenses"
          :key="expense.id"
          class="expense-card"
        >
          <div class="expense-icon" :style="{ backgroundColor: expense.categoryColor }">
            {{ expense.categoryIcon }}
          </div>
          <div class="expense-details">
            <div class="expense-description">{{ expense.description }}</div>
            <div class="expense-meta">
              {{ formatDate(expense.date) }} • {{ expense.categoryName }}
            </div>
          </div>
          <div class="expense-amount">{{ formatCurrency(expense.amount) }}</div>
          <div class="expense-actions">
            <button @click="editExpense(expense)" class="btn-icon">✏️</button>
            <button @click="deleteExpense(expense.id)" class="btn-icon">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <div v-if="showAddModal || editingExpense" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingExpense ? 'Edit Expense' : 'Add Expense' }}</h2>
        <form @submit.prevent="saveExpense">
          <div class="form-group">
            <label>Amount *</label>
            <input
              v-model.number="expenseForm.amount"
              type="number"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label>Description *</label>
            <input v-model="expenseForm.description" required />
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select v-model="expenseForm.categoryId" required>
              <option value="">Select a category</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Date *</label>
            <input v-model="expenseForm.date" type="date" required />
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select v-model.number="expenseForm.paymentMethod">
              <option :value="0">Cash</option>
              <option :value="1">Card</option>
              <option :value="2">Digital Wallet</option>
              <option :value="3">Bank Transfer</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="expenseForm.notes" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useExpenseStore } from '@/stores/expenseStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate, getTodayDateString } from '@/utils/dateUtils';
import type { Expense } from '@/types';
import { PaymentMethod } from '@/types';

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const { expenses, loading, error } = storeToRefs(expenseStore);
const { fetchAll, create, update, remove } = expenseStore;

const { categories } = storeToRefs(categoryStore);
const { fetchAll: fetchCategories } = categoryStore;

const showAddModal = ref(false);
const editingExpense = ref<Expense | null>(null);

const expenseForm = reactive({
  amount: 0,
  description: '',
  categoryId: '',
  date: getTodayDateString(),
  paymentMethod: PaymentMethod.Cash,
  tags: [] as string[],
  notes: '',
});

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

function editExpense(expense: Expense) {
  editingExpense.value = expense;
  expenseForm.amount = expense.amount;
  expenseForm.description = expense.description;
  expenseForm.categoryId = expense.categoryId;
  expenseForm.date = expense.date.split('T')[0] || '';
  expenseForm.paymentMethod = expense.paymentMethod;
  expenseForm.tags = expense.tags;
  expenseForm.notes = expense.notes || '';
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
  expenseForm.tags = [];
  expenseForm.notes = '';
}

async function saveExpense() {
  try {
    if (editingExpense.value) {
      await update(editingExpense.value.id, expenseForm);
    } else {
      await create(expenseForm);
    }
    closeModal();
  } catch (err) {
    console.error('Failed to save expense:', err);
  }
}

async function deleteExpense(id: string) {
  if (confirm('Are you sure you want to delete this expense?')) {
    try {
      await remove(id);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  }
}
</script>

<style scoped>
.expenses-page {
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

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
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

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-card {
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

.expense-card:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.expense-icon {
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

.expense-card:hover .expense-icon {
  transform: scale(1.1);
}

.expense-details {
  flex: 1;
  min-width: 0;
}

.expense-description {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.expense-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.expense-amount {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.5rem;
  letter-spacing: -0.01em;
}

.expense-actions {
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
  background: var(--primary);
  color: white;
  border-color: var(--primary);
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
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

