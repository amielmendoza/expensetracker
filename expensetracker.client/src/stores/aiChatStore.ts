import { ref } from 'vue';
import { defineStore } from 'pinia';
import { aiService } from '@/services/api/aiService';
import type { ChatMessage } from '@/types/ai';

export const useAiChatStore = defineStore('aiChat', () => {
  const messages = ref<ChatMessage[]>([]);
  const streaming = ref(false);
  const streamingContent = ref('');
  const error = ref<string | null>(null);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming.value) return;

    error.value = null;

    // Add user message
    messages.value.push({
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    });

    // Prepare assistant placeholder
    streaming.value = true;
    streamingContent.value = '';

    const chatHistory = messages.value.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await aiService.streamChat(
      chatHistory,
      (chunk) => {
        streamingContent.value += chunk;
      },
      () => {
        // Done streaming — add assistant message
        messages.value.push({
          role: 'assistant',
          content: streamingContent.value,
          timestamp: new Date(),
        });
        streamingContent.value = '';
        streaming.value = false;
      },
      (errMsg) => {
        error.value = errMsg;
        streaming.value = false;
        streamingContent.value = '';
      },
    );
  }

  function clearChat() {
    messages.value = [];
    streamingContent.value = '';
    streaming.value = false;
    error.value = null;
  }

  return {
    messages,
    streaming,
    streamingContent,
    error,
    sendMessage,
    clearChat,
  };
});
