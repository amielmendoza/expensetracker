import { supabase } from '@/lib/supabase';
import type {
  CategorySuggestion,
  ParsedExpense,
  ReceiptScanResult,
  SpendingInsights,
} from '@/types/ai';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function callEdgeFunction<T>(name: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a moment.');
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `AI service error (${response.status})`);
  }
  return response.json();
}

export const aiService = {
  // Feature 1: Smart categorization
  async suggestCategory(description: string): Promise<CategorySuggestion> {
    return callEdgeFunction<CategorySuggestion>('ai-categorize', {
      mode: 'suggest',
      description,
    });
  },

  async parseExpenseText(text: string): Promise<ParsedExpense> {
    return callEdgeFunction<ParsedExpense>('ai-categorize', {
      mode: 'parse',
      text,
    });
  },

  // Feature 2: Chat (streaming)
  async streamChat(
    messages: Array<{ role: string; content: string }>,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (error: string) => void,
  ): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${FUNCTIONS_URL}/ai-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        onError(err.error || `Chat error (${response.status})`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('No response stream');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                onChunk(parsed.delta.text);
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
      onDone();
    } catch (err: any) {
      onError(err.message || 'Chat stream failed');
    }
  },

  // Feature 3: Receipt scanning
  async scanReceipt(base64Image: string): Promise<ReceiptScanResult> {
    return callEdgeFunction<ReceiptScanResult>('ai-receipt', {
      image: base64Image,
    });
  },

  // Feature 4: Insights
  async getInsights(refresh = false): Promise<SpendingInsights> {
    return callEdgeFunction<SpendingInsights>('ai-insights', { refresh });
  },
};
