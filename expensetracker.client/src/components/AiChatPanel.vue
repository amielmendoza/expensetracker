<template>
  <div>
    <!-- Chat Toggle Button -->
    <button class="chat-fab" @click="open = !open" :title="open ? 'Close chat' : 'Ask AI'">
      <span v-if="!open" class="chat-fab-icon">&#10024;</span>
      <span v-else class="chat-fab-icon">&times;</span>
    </button>

    <!-- Chat Panel -->
    <div v-if="open" class="chat-panel">
      <div class="chat-header">
        <h3>&#10024; AI Assistant</h3>
        <button class="chat-clear" @click="clearChat" title="Clear chat">&#128465;</button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0 && !streaming" class="chat-welcome">
          <p class="welcome-text">Ask me anything about your spending!</p>
          <div class="suggested-questions">
            <button
              v-for="q in suggestedQuestions"
              :key="q"
              class="suggested-btn"
              @click="sendMessage(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['chat-message', msg.role]"
        >
          <div class="message-bubble">{{ msg.content }}</div>
        </div>

        <!-- Streaming response -->
        <div v-if="streaming" class="chat-message assistant">
          <div class="message-bubble">
            {{ streamingContent || '...' }}
            <span class="typing-cursor">|</span>
          </div>
        </div>

        <div v-if="error" class="chat-error">{{ error }}</div>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <input
          v-model="inputText"
          @keyup.enter="handleSend"
          placeholder="Ask about your spending..."
          :disabled="streaming"
          class="chat-input"
        />
        <button
          class="chat-send"
          @click="handleSend"
          :disabled="!inputText.trim() || streaming"
        >
          &#10148;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAiChatStore } from '@/stores/aiChatStore';

const chatStore = useAiChatStore();
const { messages, streaming, streamingContent, error } = storeToRefs(chatStore);
const { sendMessage, clearChat } = chatStore;

const open = ref(false);
const inputText = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const suggestedQuestions = [
  'What did I spend the most on?',
  'Am I on track this month?',
  'Where can I cut costs?',
  'How much did I save?',
];

function handleSend() {
  if (!inputText.value.trim() || streaming.value) return;
  sendMessage(inputText.value);
  inputText.value = '';
}

// Auto-scroll to bottom on new messages
watch([messages, streamingContent], () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
});
</script>

<style scoped>
.chat-fab {
  position: fixed;
  bottom: 6rem;
  right: 1.25rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.chat-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.5);
}

.chat-fab-icon {
  line-height: 1;
}

.chat-panel {
  position: fixed;
  bottom: 9.5rem;
  right: 1.25rem;
  width: 360px;
  max-height: 500px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  z-index: 999;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.chat-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.chat-clear {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.chat-clear:hover {
  color: var(--danger);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 200px;
  max-height: 340px;
}

.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.welcome-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

.suggested-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.suggested-btn {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s;
}

.suggested-btn:hover {
  background: rgba(99, 102, 241, 0.15);
}

.chat-message {
  display: flex;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.user .message-bubble {
  background: var(--primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant .message-bubble {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.typing-cursor {
  animation: blink 0.8s infinite;
  color: var(--primary);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.chat-error {
  font-size: 0.78rem;
  color: var(--danger);
  padding: 0.4rem 0.6rem;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
}

.chat-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: var(--primary);
}

.chat-send {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.chat-send:hover:not(:disabled) {
  background: var(--primary-dark);
}

.chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .chat-panel {
    width: calc(100vw - 2rem);
    right: 1rem;
    bottom: 8rem;
    max-height: 60vh;
  }

  .chat-fab {
    bottom: 5rem;
    right: 1rem;
    width: 46px;
    height: 46px;
    font-size: 1.25rem;
  }
}
</style>
