<template>
  <div>
    <!-- Floating Action Button -->
    <button @click="showModal = true" class="fab" title="Add Expense">
      <span class="fab-icon">+</span>
    </button>

    <!-- Quick Add Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Quick Add Expense</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveExpense" class="quick-form">
          <div class="form-row">
            <div class="form-group amount-group">
              <label>Amount *</label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                autofocus
                class="amount-input"
                placeholder="0.00"
              />
            </div>
            <div class="form-group">
              <label>Date *</label>
              <input v-model="form.date" type="date" required />
            </div>
          </div>

          <div class="form-group">
            <label>Description *</label>
            <input
              v-model="form.description"
              required
              placeholder="What did you spend on?"
              list="recent-descriptions"
            />
            <datalist id="recent-descriptions">
              <option v-for="desc in recentDescriptions" :key="desc" :value="desc" />
            </datalist>
          </div>

          <div class="form-group">
            <label>Category *</label>
            <div class="category-grid">
              <button
                v-for="category in categories"
                :key="category.id"
                type="button"
                @click="form.categoryId = category.id"
                :class="['category-btn', { active: form.categoryId === category.id }]"
                :style="{ borderColor: form.categoryId === category.id ? category.color : '#ddd' }"
              >
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Account</label>
            <select v-model="form.accountId">
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

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="!isFormValid">Add Expense</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useExpenseStore } from '@/stores/expenseStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAccountStore } from '@/stores/accountStore';
import { getTodayDateString } from '@/utils/dateUtils';
import { useToast } from '@/composables/useToast';
import { PaymentMethod } from '@/types';

const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const accountStore = useAccountStore();
const { showSuccess, showError } = useToast();

const { expenses } = storeToRefs(expenseStore);
const { create } = expenseStore;

const { categories } = storeToRefs(categoryStore);
const { fetchAll: fetchCategories } = categoryStore;

const { accounts } = storeToRefs(accountStore);
const { fetchAll: fetchAccounts } = accountStore;

const showModal = ref(false);

const form = reactive({
  amount: 0,
  description: '',
  categoryId: '',
  date: getTodayDateString(),
  paymentMethod: PaymentMethod.Cash,
  accountId: '',
  tags: [] as string[],
  notes: '',
});

const isFormValid = computed(() => {
  return form.amount > 0 && form.description.trim() !== '' && form.categoryId !== '';
});

const recentDescriptions = computed(() => {
  if (!expenses.value || expenses.value.length === 0) {
    return [];
  }
  const descriptions = new Set<string>();
  expenses.value.slice(0, 10).forEach((exp) => {
    if (exp.description) {
      descriptions.add(exp.description);
    }
  });
  return Array.from(descriptions);
});

onMounted(async () => {
  try {
    await Promise.all([fetchCategories(), fetchAccounts()]);
  } catch (err) {
    console.error('Error loading data:', err);
  }
});

function closeModal() {
  showModal.value = false;
  resetForm();
}

function resetForm() {
  form.amount = 0;
  form.description = '';
  form.categoryId = '';
  form.date = getTodayDateString();
  form.paymentMethod = PaymentMethod.Cash;
  form.accountId = '';
  form.tags = [];
  form.notes = '';
}

async function saveExpense() {
  if (!isFormValid.value) return;

  try {
    await create(form);
    showSuccess('Expense created successfully');
    closeModal();
  } catch (err) {
    showError('Failed to create expense');
    console.error('Failed to create expense:', err);
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  line-height: 1;
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
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  max-width: 650px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.close-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
  transform: rotate(90deg);
}

.quick-form {
  padding: 2.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input,
.form-group select {
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
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: var(--bg-secondary);
}

.amount-input {
  font-size: 1.75rem;
  font-weight: 700;
  text-align: right;
  letter-spacing: -0.02em;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1rem;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 0.75rem;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:hover {
  background: var(--bg-secondary);
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.category-btn.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
  border-width: 3px;
  box-shadow: var(--shadow-sm);
}

.category-icon {
  font-size: 2rem;
  transition: transform 0.2s ease;
}

.category-btn:hover .category-icon,
.category-btn.active .category-icon {
  transform: scale(1.2);
}

.category-name {
  font-size: 0.8rem;
  color: var(--text-primary);
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border);
  padding: 0.875rem 2rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}

@media (max-width: 600px) {
  .fab {
    bottom: 1.25rem;
    right: 1.25rem;
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .modal-content {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 12px 12px 0 0;
    margin-top: auto;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-header {
    padding: 1.25rem 1.25rem 1rem;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .quick-form {
    padding: 1.25rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .amount-input {
    font-size: 1.35rem;
  }

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 0.5rem;
  }

  .category-btn {
    padding: 0.75rem 0.5rem;
    gap: 0.4rem;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .category-name {
    font-size: 0.7rem;
  }

  .form-actions {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
  }
}
</style>

