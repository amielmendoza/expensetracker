import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

function addToast(message: string, type: 'success' | 'error') {
  const id = nextId++;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

function removeToast(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToast() {
  return {
    toasts,
    showSuccess: (message: string) => addToast(message, 'success'),
    showError: (message: string) => addToast(message, 'error'),
    removeToast,
  };
}
