<template>
  <div>
    <button @click="showModal = true" class="fab-income" title="Add Income">
      <span class="fab-icon">₱</span>
    </button>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Quick Add Income</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveIncome" class="quick-form">
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
            <input v-model="form.description" required placeholder="Income source or description" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select v-model="form.categoryId" required>
                <option value="">Select category</option>
                <option v-for="cat in incomeCategories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Source</label>
              <select v-model.number="form.source">
                <option :value="0">Salary</option>
                <option :value="1">Freelance</option>
                <option :value="2">Business</option>
                <option :value="3">Investment</option>
                <option :value="7">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Account</label>
            <select v-model="form.accountId">
              <option value="">No account</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.icon }} {{ account.name }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="!isFormValid">Add Income</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useIncomeStore } from '@/stores/incomeStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAccountStore } from '@/stores/accountStore';
import { getTodayDateString } from '@/utils/dateUtils';
import { useToast } from '@/composables/useToast';
import { IncomeSource, CategoryType } from '@/types';

const incomeStore = useIncomeStore();
const categoryStore = useCategoryStore();
const accountStore = useAccountStore();
const { showSuccess, showError } = useToast();

const { categories } = storeToRefs(categoryStore);
const { fetchAll: fetchCategories } = categoryStore;

const { accounts } = storeToRefs(accountStore);
const { fetchAll: fetchAccounts } = accountStore;

const incomeCategories = computed(() =>
  categories.value?.filter(c => c.type === CategoryType.Income || c.type === CategoryType.Both) || []
);

const showModal = ref(false);

const form = reactive({
  amount: 0,
  description: '',
  categoryId: '',
  date: getTodayDateString(),
  source: IncomeSource.Salary,
  accountId: '',
  tags: [] as string[],
  notes: '',
});

const isFormValid = computed(() => {
  return form.amount > 0 && form.description.trim() !== '' && form.categoryId !== '';
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
  form.source = IncomeSource.Salary;
  form.accountId = '';
  form.tags = [];
  form.notes = '';
}

async function saveIncome() {
  if (!isFormValid.value) return;
  try {
    await incomeStore.create(form);
    showSuccess('Income added successfully');
    closeModal();
  } catch (err) {
    showError('Failed to add income');
    console.error('Failed to add income:', err);
  }
}
</script>

<style scoped>
.fab-income {
  position: fixed;
  bottom: 2rem;
  right: 6rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-income:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(34, 197, 94, 0.5);
}

.fab-icon {
  font-weight: 700;
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
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
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
}

.quick-form {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--success);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.amount-input {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.btn-primary {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}
</style>
