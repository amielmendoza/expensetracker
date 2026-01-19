<template>
  <div class="savings-goals-page">
    <div class="page-header">
      <h1>Savings Goals</h1>
      <button @click="openAddModal" class="btn-primary">+ Add Goal</button>
    </div>

    <div v-if="loading" class="loading">Loading savings goals...</div>
    <div v-else-if="error" class="error">
      <p><strong>Error:</strong> {{ error }}</p>
      <p style="font-size: 0.9rem; margin-top: 0.5rem;">Please check the browser console for more details.</p>
      <button @click="retryLoad" class="btn-primary" style="margin-top: 1rem;">Retry</button>
    </div>
    <div v-else>
      <div v-if="!savingsGoals || savingsGoals.length === 0" class="empty-state">
        <p>No savings goals found. Create your first savings goal to get started!</p>
        <button @click="openAddModal" class="btn-primary" style="margin-top: 1rem;">+ Add Your First Goal</button>
      </div>
      <div v-else class="goals-grid">
        <div
          v-for="goal in savingsGoals"
          :key="goal.id"
          class="goal-card"
          :class="{ inactive: !goal.isActive }"
        >
          <div class="goal-header">
            <h3>{{ goal.name }}</h3>
            <div class="goal-actions">
              <button @click="recalculate(goal.id)" class="btn-icon" title="Recalculate Progress">🔄</button>
              <button @click="editGoal(goal)" class="btn-icon" title="Edit">✏️</button>
              <button @click="deleteGoal(goal.id)" class="btn-icon" title="Delete">🗑️</button>
            </div>
          </div>

          <div class="goal-amounts">
            <div class="amount-item">
              <span class="amount-label">Current</span>
              <span class="amount-value current">{{ formatLargeCurrency(goal.currentAmount) }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">Target</span>
              <span class="amount-value target">{{ formatLargeCurrency(goal.targetAmount) }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">Remaining</span>
              <span class="amount-value remaining">{{ formatLargeCurrency(goal.remainingAmount) }}</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-percentage">{{ goal.progressPercentage.toFixed(1) }}%</span>
              <span class="progress-days">{{ goal.daysRemaining }} days left</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${Math.max(2, Math.min(100, goal.progressPercentage))}%` }"
                :class="getProgressClass(goal.progressPercentage)"
              ></div>
            </div>
          </div>

          <div class="goal-meta">
            <span>{{ formatDate(goal.startDate) }} → {{ formatDate(goal.endDate) }}</span>
            <span class="goal-period">{{ getPeriodLabel(goal.period) }}</span>
            <span v-if="!goal.isActive" class="goal-status inactive">Inactive</span>
            <span v-else class="goal-status active">Active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Goal Modal -->
    <div v-if="showAddModal || editingGoal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal' }}</h2>
        <form @submit.prevent="saveGoal">
          <div class="form-group">
            <label>Goal Name *</label>
            <input
              v-model="goalForm.name"
              type="text"
              placeholder="e.g., Emergency Fund, Vacation"
              required
            />
          </div>
          <div class="form-group">
            <label>Target Amount *</label>
            <input
              v-model.number="goalForm.targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div class="form-group">
            <label>Period</label>
            <select v-model.number="goalForm.period">
              <option :value="0">Daily</option>
              <option :value="1">Weekly</option>
              <option :value="2">Monthly</option>
              <option :value="3">Yearly</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Date *</label>
            <input v-model="goalForm.startDate" type="date" required />
          </div>
          <div class="form-group">
            <label>End Date *</label>
            <input v-model="goalForm.endDate" type="date" required />
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="goalForm.isActive" />
              Active
            </label>
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
import { useSavingsGoalStore } from '@/stores/savingsGoalStore';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDate, getTodayDateString } from '@/utils/dateUtils';
import type { SavingsGoal } from '@/types';
import { BudgetPeriod } from '@/types';

const savingsGoalStore = useSavingsGoalStore();

const { savingsGoals, loading, error } = storeToRefs(savingsGoalStore);
const { fetchAll, create, update, remove, recalculateProgress } = savingsGoalStore;

const showAddModal = ref(false);
const editingGoal = ref<SavingsGoal | null>(null);

const goalForm = reactive({
  name: '',
  targetAmount: 0,
  period: BudgetPeriod.Monthly,
  startDate: getTodayDateString(),
  endDate: '',
  isActive: true,
});

function getPeriodLabel(period: BudgetPeriod): string {
  const labels = {
    [BudgetPeriod.Daily]: 'Daily',
    [BudgetPeriod.Weekly]: 'Weekly',
    [BudgetPeriod.Monthly]: 'Monthly',
    [BudgetPeriod.Yearly]: 'Yearly',
  };
  return labels[period] || 'Unknown';
}

function getProgressClass(percentage: number): string {
  if (percentage >= 100) return 'complete';
  if (percentage >= 75) return 'high';
  if (percentage >= 50) return 'medium';
  if (percentage >= 25) return 'low';
  return 'very-low';
}

function formatLargeCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `₱${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `₱${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

async function retryLoad() {
  try {
    await fetchAll();
  } catch (err) {
    console.error('Error loading savings goals:', err);
  }
}

onMounted(async () => {
  await retryLoad();
});

function editGoal(goal: SavingsGoal) {
  editingGoal.value = goal;
  goalForm.name = goal.name;
  goalForm.targetAmount = goal.targetAmount;
  goalForm.period = goal.period;
  goalForm.startDate = goal.startDate.split('T')[0] || '';
  goalForm.endDate = goal.endDate.split('T')[0] || '';
  goalForm.isActive = goal.isActive;
}

function openAddModal() {
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingGoal.value = null;
  resetForm();
}

function resetForm() {
  goalForm.name = '';
  goalForm.targetAmount = 0;
  goalForm.period = BudgetPeriod.Monthly;
  goalForm.startDate = getTodayDateString();
  goalForm.endDate = '';
  goalForm.isActive = true;
}

async function saveGoal() {
  try {
    if (editingGoal.value) {
      await update(editingGoal.value.id, goalForm);
    } else {
      await create(goalForm);
    }
    closeModal();
  } catch (err) {
    console.error('Failed to save savings goal:', err);
  }
}

async function recalculate(id: string) {
  try {
    await recalculateProgress(id);
  } catch (err) {
    console.error('Failed to recalculate progress:', err);
  }
}

async function deleteGoal(id: string) {
  if (confirm('Are you sure you want to delete this savings goal?')) {
    try {
      await remove(id);
    } catch (err) {
      console.error('Failed to delete savings goal:', err);
    }
  }
}
</script>

<style scoped>
.savings-goals-page {
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
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.goal-card {
  background: var(--bg-secondary);
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 2px solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.goal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.goal-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: var(--primary);
}

.goal-card:hover::before {
  opacity: 1;
}

.goal-card.inactive {
  opacity: 0.65;
  filter: grayscale(0.3);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.goal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 700;
}

.goal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
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

.goal-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.amount-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.amount-item:hover {
  background: var(--bg-secondary);
  border-color: var(--primary);
  transform: scale(1.05);
}

.amount-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.amount-value {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.amount-value.current {
  color: #10b981;
}

.amount-value.target {
  color: var(--primary);
}

.amount-value.remaining {
  color: #f59e0b;
}

.progress-section {
  margin-bottom: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.progress-days {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-bar {
  height: 12px;
  background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 100%);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
  border-radius: 999px;
}

.progress-fill.complete {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-fill.high {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.progress-fill.medium {
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
}

.progress-fill.low {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.progress-fill.very-low {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.goal-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.goal-period {
  font-weight: 600;
  color: var(--text-primary);
}

.goal-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.goal-status.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.goal-status.inactive {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: none;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
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
.form-group select:focus {
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
