import { ref, watch } from 'vue';
import { aiService } from '@/services/api/aiService';
import type { CategorySuggestion, ParsedExpense } from '@/types/ai';

export function useSmartEntry() {
  const suggestion = ref<CategorySuggestion | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function suggestCategory(description: string) {
    suggestion.value = null;
    error.value = null;

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!description || description.trim().length < 3) {
      return;
    }

    debounceTimer = setTimeout(async () => {
      loading.value = true;
      try {
        suggestion.value = await aiService.suggestCategory(description.trim());
      } catch (err: any) {
        error.value = err.message;
        suggestion.value = null;
      } finally {
        loading.value = false;
      }
    }, 500);
  }

  async function parseText(text: string): Promise<ParsedExpense | null> {
    if (!text || text.trim().length < 3) return null;
    loading.value = true;
    error.value = null;
    try {
      return await aiService.parseExpenseText(text.trim());
    } catch (err: any) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  }

  function clearSuggestion() {
    suggestion.value = null;
    error.value = null;
    if (debounceTimer) clearTimeout(debounceTimer);
  }

  return {
    suggestion,
    loading,
    error,
    suggestCategory,
    parseText,
    clearSuggestion,
  };
}
