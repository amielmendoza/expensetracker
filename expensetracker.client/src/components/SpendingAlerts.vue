<template>
  <div class="ai-insights-card">
    <div class="insights-header">
      <h3><span class="sparkle">&#10024;</span> AI Insights</h3>
      <div class="insights-actions">
        <span v-if="insights" class="insights-time">{{ timeAgo }}</span>
        <button class="refresh-btn" :disabled="loading" @click="fetchInsights(true)" title="Refresh">
          <span :class="{ spinning: loading }">&#8635;</span>
        </button>
      </div>
    </div>

    <div v-if="loading && !insights" class="insights-loading">
      <div class="loading-spinner small"></div>
      <span>Generating insights...</span>
    </div>

    <div v-else-if="error" class="insights-error">
      {{ error }}
      <button class="btn-retry" @click="fetchInsights(true)">Retry</button>
    </div>

    <div v-else-if="insights" class="insights-body">
      <!-- Anomalies -->
      <div v-for="(anomaly, i) in insights.anomalies" :key="i" :class="['alert-item', anomaly.severity]">
        <span class="alert-icon">
          {{ anomaly.severity === 'critical' ? '&#9888;&#65039;' : anomaly.severity === 'warning' ? '&#128993;' : '&#8505;&#65039;' }}
        </span>
        <span class="alert-message">{{ anomaly.message }}</span>
      </div>

      <!-- Prediction -->
      <div v-if="insights.predictions" class="prediction-pill">
        <span class="prediction-label">Month-end forecast</span>
        <span class="prediction-value">{{ formatAmount(insights.predictions.projectedMonthEnd) }}</span>
        <span class="prediction-savings" :class="{ negative: insights.predictions.projectedSavings < 0 }">
          Savings: {{ formatAmount(insights.predictions.projectedSavings) }}
          ({{ insights.predictions.projectedSavingsRate.toFixed(0) }}%)
        </span>
      </div>

      <!-- Tips -->
      <div v-if="insights.tips.length > 0" class="tips-section">
        <button class="tips-toggle" @click="showTips = !showTips">
          <span>&#128161; Tips ({{ insights.tips.length }})</span>
          <span class="chevron" :class="{ expanded: showTips }">&#9660;</span>
        </button>
        <div v-if="showTips" class="tips-list">
          <div v-for="(tip, i) in insights.tips" :key="i" class="tip-item">{{ tip }}</div>
        </div>
      </div>
    </div>

    <div v-else class="insights-empty">
      <button class="btn-generate" @click="fetchInsights()">Generate AI Insights</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { aiService } from '@/services/api/aiService';
import { formatAmount } from '@/utils/currencyUtils';
import type { SpendingInsights } from '@/types/ai';

const insights = ref<SpendingInsights | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const showTips = ref(false);

const timeAgo = computed(() => {
  if (!insights.value?.generatedAt) return '';
  const diff = Date.now() - new Date(insights.value.generatedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
});

async function fetchInsights(refresh = false) {
  loading.value = true;
  error.value = null;
  try {
    insights.value = await aiService.getInsights(refresh);
  } catch (err: any) {
    error.value = err.message || 'Failed to load insights';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchInsights();
});
</script>

<style scoped>
.ai-insights-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.insights-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sparkle {
  margin-right: 0.25rem;
}

.insights-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.insights-time {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.refresh-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1rem;
  transition: all 0.2s;
}

.refresh-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.insights-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.loading-spinner.small {
  width: 18px;
  height: 18px;
}

.insights-error {
  color: var(--danger);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-retry {
  background: none;
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
}

.insights-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  line-height: 1.4;
}

.alert-item.info {
  background: rgba(59, 130, 246, 0.08);
  color: var(--text-primary);
}

.alert-item.warning {
  background: rgba(245, 158, 11, 0.08);
  color: var(--text-primary);
}

.alert-item.critical {
  background: rgba(239, 68, 68, 0.08);
  color: var(--text-primary);
}

.alert-icon {
  flex-shrink: 0;
  font-size: 0.9rem;
}

.prediction-pill {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 8px;
}

.prediction-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.prediction-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.prediction-savings {
  font-size: 0.8rem;
  color: #22c55e;
  font-weight: 600;
}

.prediction-savings.negative {
  color: #ef4444;
}

.tips-section {
  border-top: 1px solid var(--border);
  padding-top: 0.5rem;
}

.tips-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0;
}

.chevron {
  font-size: 0.6rem;
  color: var(--text-secondary);
  transition: transform 0.25s;
}

.chevron.expanded {
  transform: rotate(180deg);
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tip-item {
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border-radius: 6px;
  line-height: 1.4;
}

.insights-empty {
  text-align: center;
  padding: 0.5rem 0;
}

.btn-generate {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
</style>
