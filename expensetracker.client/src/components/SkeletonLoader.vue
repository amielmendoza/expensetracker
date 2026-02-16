<template>
  <div class="skeleton-loader">
    <!-- Stat variant: row of small rectangular pills -->
    <template v-if="variant === 'stat'">
      <div class="skeleton-stat-row">
        <div v-for="i in count" :key="i" class="skeleton-stat-pill">
          <div class="skeleton-bone bone-label"></div>
          <div class="skeleton-bone bone-value"></div>
        </div>
      </div>
    </template>

    <!-- Card variant: card-shaped rectangle with header + content lines -->
    <template v-else-if="variant === 'card'">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton-card-header">
          <div class="skeleton-bone bone-heading"></div>
          <div class="skeleton-bone bone-badge"></div>
        </div>
        <div class="skeleton-card-body">
          <div class="skeleton-bone bone-line-full"></div>
          <div class="skeleton-bone bone-line-short"></div>
        </div>
      </div>
    </template>

    <!-- List variant: rows with circle + 2 lines (like transaction items) -->
    <template v-else-if="variant === 'list'">
      <div class="skeleton-list">
        <div v-for="i in count" :key="i" class="skeleton-list-item">
          <div class="skeleton-bone bone-circle"></div>
          <div class="skeleton-list-text">
            <div class="skeleton-bone bone-line-name"></div>
            <div class="skeleton-bone bone-line-meta"></div>
          </div>
          <div class="skeleton-bone bone-amount"></div>
        </div>
      </div>
    </template>

    <!-- Chart variant: large rectangular placeholder -->
    <template v-else-if="variant === 'chart'">
      <div v-for="i in count" :key="i" class="skeleton-chart">
        <div class="skeleton-bone bone-chart-area"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
type SkeletonVariant = 'card' | 'list' | 'stat' | 'chart';

withDefaults(defineProps<{
  variant: SkeletonVariant;
  count?: number;
}>(), {
  count: 3,
});
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

/* Base bone element with shimmer animation */
.skeleton-bone {
  background: var(--bg-secondary);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.skeleton-bone::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.08) 80%,
    transparent 100%
  );
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* ── Stat variant ── */
.skeleton-stat-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.skeleton-stat-pill {
  flex: 1;
  min-width: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bone-label {
  width: 60%;
  height: 10px;
  border-radius: 4px;
}

.bone-value {
  width: 80%;
  height: 18px;
  border-radius: 6px;
}

/* ── Card variant ── */
.skeleton-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.skeleton-card:last-child {
  margin-bottom: 0;
}

.skeleton-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.bone-heading {
  width: 45%;
  height: 18px;
  border-radius: 6px;
}

.bone-badge {
  width: 36px;
  height: 22px;
  border-radius: 999px;
}

.skeleton-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.bone-line-full {
  width: 100%;
  height: 14px;
  border-radius: 4px;
}

.bone-line-short {
  width: 65%;
  height: 14px;
  border-radius: 4px;
}

/* ── List variant ── */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 12px;
}

.bone-circle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}

.skeleton-list-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.bone-line-name {
  width: 55%;
  height: 14px;
  border-radius: 4px;
}

.bone-line-meta {
  width: 40%;
  height: 10px;
  border-radius: 4px;
}

.bone-amount {
  width: 72px;
  height: 16px;
  border-radius: 6px;
  flex-shrink: 0;
}

/* ── Chart variant ── */
.skeleton-chart {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.skeleton-chart:last-child {
  margin-bottom: 0;
}

.bone-chart-area {
  width: 100%;
  height: 220px;
  border-radius: 12px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .skeleton-stat-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .skeleton-stat-pill {
    min-width: auto;
  }

  .bone-chart-area {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .skeleton-stat-pill {
    min-width: auto;
  }
}
</style>
