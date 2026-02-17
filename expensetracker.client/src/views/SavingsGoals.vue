<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Savings Goals</h1>
      </div>
      <div class="header-right">
        <button class="btn-add" @click="openAddModal">+ Add Goal</button>
      </div>
    </div>

    <!-- Month Selector -->
    <div class="month-selector">
      <button class="month-nav-btn" @click="goToPreviousMonth">&larr;</button>
      <span class="current-month">{{ selectedMonthLabel }}</span>
      <button class="month-nav-btn" @click="goToNextMonth" :disabled="isCurrentMonth">&rarr;</button>
      <button v-if="!isCurrentMonth" class="today-btn" @click="goToCurrentMonth">Today</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading savings goals...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="btn-secondary">Retry</button>
    </div>
    <div v-else>
      <div v-if="!filteredGoals || filteredGoals.length === 0" class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>No savings goals yet</h3>
        <p>Create your first savings goal to start tracking your progress!</p>
        <button @click="openAddModal" class="btn-add">+ Create Your First Goal</button>
      </div>
      <div v-else class="goals-grid">
        <div
          v-for="goal in filteredGoals"
          :key="goal.id"
          class="goal-card"
          :class="{ inactive: !goal.isActive }"
        >
          <div class="goal-header">
            <div class="goal-title">
              <h3>{{ goal.name }}</h3>
              <span class="goal-period-badge">{{ getPeriodLabel(goal.period) }}</span>
            </div>
            <div class="goal-actions">
              <button @click="recalculate(goal.id)" class="btn-icon" title="Recalculate">🔄</button>
              <button @click="editGoal(goal)" class="btn-icon" title="Edit">✏️</button>
              <button @click="deleteGoal(goal.id)" class="btn-icon delete" title="Delete">🗑️</button>
            </div>
          </div>

          <div class="goal-progress">
            <div class="progress-circle" :class="getProgressClass(goal.progressPercentage)">
              <svg viewBox="0 0 36 36">
                <path
                  class="progress-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="progress-fill"
                  :stroke-dasharray="`${Math.max(0, Math.min(100, goal.progressPercentage))}, 100`"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span class="progress-text" :class="{ negative: goal.progressPercentage < 0 }">
                {{ goal.progressPercentage.toFixed(0) }}%
              </span>
            </div>
            <div class="progress-details">
              <div class="progress-row">
                <span class="progress-label">Current</span>
                <span class="progress-value" :class="{ negative: goal.currentAmount < 0 }">
                  {{ formatLargeAmount(goal.currentAmount) }}
                </span>
              </div>
              <div class="progress-row">
                <span class="progress-label">Target</span>
                <span class="progress-value target">{{ formatLargeAmount(goal.targetAmount) }}</span>
              </div>
              <div class="progress-row">
                <span class="progress-label">Remaining</span>
                <span class="progress-value remaining">{{ formatLargeAmount(goal.remainingAmount) }}</span>
              </div>
            </div>
          </div>

          <div class="goal-bar">
            <div
              class="goal-bar-fill"
              :style="{ width: `${Math.max(2, Math.min(100, goal.progressPercentage))}%` }"
              :class="getProgressClass(goal.progressPercentage)"
            ></div>
          </div>

          <div class="goal-footer">
            <div class="goal-dates">
              {{ formatDate(goal.startDate) }} → {{ formatDate(goal.endDate) }}
            </div>
            <div class="goal-status-row">
              <span class="days-left">{{ goal.daysRemaining }} days left</span>
              <span class="status-badge" :class="goal.isActive ? 'active' : 'inactive'">
                {{ goal.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingGoal" class="modal-overlay" @mousedown.self="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingGoal ? 'Edit Goal' : 'Create Goal' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
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
          <div class="form-row">
            <div class="form-group">
              <label>Target Amount *</label>
              <input
                v-model.number="goalForm.targetAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
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
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Start Date *</label>
              <input v-model="goalForm.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>End Date *</label>
              <input v-model="goalForm.endDate" type="date" required />
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="goalForm.isActive" />
              <span class="checkbox-text">Active</span>
            </label>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-add">{{ editingGoal ? 'Update' : 'Create' }} Goal</button>
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
import { formatDate, getTodayDateString } from '@/utils/dateUtils';
import type { SavingsGoal } from '@/types';
import { BudgetPeriod } from '@/types';
import { formatAmount as formatLargeAmount } from '@/utils/currencyUtils';

const savingsGoalStore = useSavingsGoalStore();

const { savingsGoals, loading, error, filteredGoals, selectedMonthLabel, isCurrentMonth } = storeToRefs(savingsGoalStore);
const { fetchAll, create, update, remove, recalculateProgress, goToPreviousMonth, goToNextMonth, goToCurrentMonth } = savingsGoalStore;

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
  if (percentage < 0) return 'negative';
  if (percentage >= 100) return 'complete';
  if (percentage >= 75) return 'high';
  if (percentage >= 50) return 'medium';
  if (percentage >= 25) return 'low';
  return 'very-low';
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

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.goal-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.goal-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.goal-card.inactive {
  opacity: 0.6;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.goal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.goal-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.goal-period-badge {
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.goal-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
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

.goal-progress {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-circle {
  width: 80px;
  height: 80px;
  position: relative;
  flex-shrink: 0;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: var(--border);
  stroke-width: 3;
}

.progress-fill {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-circle.complete .progress-fill { stroke: #22c55e; }
.progress-circle.high .progress-fill { stroke: #3b82f6; }
.progress-circle.medium .progress-fill { stroke: #8b5cf6; }
.progress-circle.low .progress-fill { stroke: #f59e0b; }
.progress-circle.very-low .progress-fill { stroke: #ef4444; }
.progress-circle.negative .progress-fill { stroke: #ef4444; }

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.progress-text.negative {
  color: #ef4444;
}

.progress-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.progress-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.progress-value.negative {
  color: #ef4444;
}

.progress-value.target {
  color: var(--primary);
}

.progress-value.remaining {
  color: #f59e0b;
}

.goal-bar {
  height: 6px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.goal-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.goal-bar-fill.complete { background: linear-gradient(90deg, #22c55e, #16a34a); }
.goal-bar-fill.high { background: linear-gradient(90deg, #3b82f6, #2563eb); }
.goal-bar-fill.medium { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
.goal-bar-fill.low { background: linear-gradient(90deg, #f59e0b, #d97706); }
.goal-bar-fill.very-low { background: linear-gradient(90deg, #ef4444, #dc2626); }
.goal-bar-fill.negative { background: linear-gradient(90deg, #ef4444, #dc2626); }

.goal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.goal-dates {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.goal-status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.days-left {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge.inactive {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
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
.form-group select {
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
.form-group select:focus {
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

  .goals-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .goal-progress {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-circle {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .header-left h1 {
    font-size: 1.5rem;
  }

  .goal-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
