<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  max-width: 380px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}

.toast-icon {
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.toast-close:hover {
  color: white;
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 480px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    bottom: 5rem;
    max-width: none;
  }
}
</style>
