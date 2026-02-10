<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>Accounts</h1>
      </div>
      <div class="header-right">
        <button class="btn-add" @click="openAddModal">+ Add Account</button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary-row" v-if="accounts && accounts.length > 0">
      <div class="summary-stat">
        <span class="stat-label">Total Balance</span>
        <span class="stat-value" :class="{ negative: totalBalance < 0 }">{{ formatLargeAmount(totalBalance) }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Banks</span>
        <span class="stat-value">{{ formatLargeAmount(banksTotal) }}</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">E-Wallets</span>
        <span class="stat-value">{{ formatLargeAmount(eWalletsTotal) }}</span>
      </div>
      <div class="summary-stat" v-if="creditCards.length > 0">
        <span class="stat-label">Credit Cards</span>
        <span class="stat-value credit-card">{{ formatLargeAmount(creditCardsTotal) }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading accounts...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="btn-secondary">Retry</button>
    </div>
    <div v-else>
      <div v-if="!accounts || accounts.length === 0" class="empty-state">
        <div class="empty-icon">🏦</div>
        <h3>No accounts yet</h3>
        <p>Add your bank accounts and e-wallets to track balances!</p>
        <button @click="openAddModal" class="btn-add">+ Add Your First Account</button>
      </div>
      <div v-else class="accounts-grouped">
        <!-- Debit Accounts (Banks + E-Wallets) -->
        <div class="account-group" v-if="debitAccounts.length > 0">
          <div class="group-header">
            <div class="group-title">
              <span class="group-icon">🏦</span>
              <h2>Debit Accounts</h2>
            </div>
            <span class="group-total">{{ formatLargeAmount(debitTotal) }}</span>
          </div>
          <div class="accounts-grid">
            <div
              v-for="account in debitAccounts"
              :key="account.id"
              class="account-card"
            >
              <div class="account-header">
                <div class="account-icon" :style="{ backgroundColor: account.color }">
                  {{ account.icon }}
                </div>
                <div class="account-info">
                  <h3>{{ account.name }}</h3>
                  <span class="account-type-badge">{{ account.type === 0 ? 'Bank' : 'E-Wallet' }}</span>
                </div>
                <div class="account-actions">
                  <button @click="editAccount(account)" class="btn-icon" title="Edit">&#9998;&#65039;</button>
                  <button @click="deleteAccount(account.id)" class="btn-icon delete" title="Delete">&#128465;&#65039;</button>
                </div>
              </div>
              <div class="account-balance" :class="{ negative: account.balance < 0 }">
                {{ formatLargeAmount(account.balance) }}
              </div>
              <div class="account-footer">
                <button class="btn-adjust" @click="openAdjustModal(account)">Adjust Balance</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Credit Cards -->
        <div class="account-group" v-if="creditCards.length > 0">
          <div class="group-header">
            <div class="group-title">
              <span class="group-icon">💳</span>
              <h2>Credit Cards</h2>
            </div>
            <span class="group-total cc-total">{{ formatLargeAmount(creditCardsTotal) }}</span>
          </div>
          <div class="accounts-grid">
            <div
              v-for="account in creditCards"
              :key="account.id"
              class="account-card cc-card"
            >
              <div class="account-header">
                <div class="account-icon" :style="{ backgroundColor: account.color }">
                  {{ account.icon }}
                </div>
                <div class="account-info">
                  <h3>{{ account.name }}</h3>
                  <span class="account-type-badge cc-badge">Credit Card</span>
                </div>
                <div class="account-actions">
                  <button @click="editAccount(account)" class="btn-icon" title="Edit">&#9998;&#65039;</button>
                  <button @click="deleteAccount(account.id)" class="btn-icon delete" title="Delete">&#128465;&#65039;</button>
                </div>
              </div>
              <div class="account-balance" :class="{ negative: account.balance < 0 }">
                {{ formatLargeAmount(account.balance) }}
              </div>
              <div class="account-footer">
                <button class="btn-adjust" @click="openAdjustModal(account)">Adjust Balance</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingAccount" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingAccount ? 'Edit Account' : 'Add Account' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="saveAccount">
          <div class="form-group">
            <label>Account Name *</label>
            <input
              v-model="accountForm.name"
              type="text"
              placeholder="e.g., BPI, GCash"
              required
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Type</label>
              <select v-model.number="accountForm.type">
                <option :value="0">Bank</option>
                <option :value="1">E-Wallet</option>
                <option :value="2">Credit Card</option>
              </select>
            </div>
            <div class="form-group">
              <label>Icon</label>
              <input v-model="accountForm.icon" type="text" placeholder="e.g., &#127974;" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Color</label>
              <input v-model="accountForm.color" type="color" />
            </div>
            <div class="form-group" v-if="!editingAccount">
              <label>Initial Balance</label>
              <input
                v-model.number="accountForm.balance"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-add">{{ editingAccount ? 'Update' : 'Add' }} Account</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Adjust Balance Modal -->
    <div v-if="adjustingAccount" class="modal-overlay" @click="closeAdjustModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Adjust Balance - {{ adjustingAccount.name }}</h2>
          <button class="modal-close" @click="closeAdjustModal">&times;</button>
        </div>
        <form @submit.prevent="saveBalance">
          <div class="form-group">
            <label>Current Balance</label>
            <div class="current-balance-display">{{ formatLargeAmount(adjustingAccount.balance) }}</div>
          </div>
          <div class="form-group">
            <label>New Balance *</label>
            <input
              v-model.number="newBalance"
              type="number"
              step="0.01"
              required
              autofocus
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeAdjustModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-add">Update Balance</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/accountStore';
import type { Account } from '@/types';
import { AccountType } from '@/types';

const accountStore = useAccountStore();

const { accounts, loading, error, totalBalance, bankAccounts, eWallets, creditCards } = storeToRefs(accountStore);
const { fetchAll, create, update, remove } = accountStore;

const banksTotal = computed(() => bankAccounts.value.reduce((sum, a) => sum + a.balance, 0));
const eWalletsTotal = computed(() => eWallets.value.reduce((sum, a) => sum + a.balance, 0));
const creditCardsTotal = computed(() => creditCards.value.reduce((sum, a) => sum + a.balance, 0));
const debitAccounts = computed(() => accounts.value.filter(a => a.type === AccountType.Bank || a.type === AccountType.EWallet));
const debitTotal = computed(() => debitAccounts.value.reduce((sum, a) => sum + a.balance, 0));

const showAddModal = ref(false);
const editingAccount = ref<Account | null>(null);
const adjustingAccount = ref<Account | null>(null);
const newBalance = ref(0);

const accountForm = reactive({
  name: '',
  type: AccountType.Bank as AccountType,
  icon: '',
  color: '#6366f1',
  balance: 0,
});

const formatLargeAmount = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absAmount >= 1000000) {
    return `${sign}P${(absAmount / 1000000).toFixed(2)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}P${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}P${absAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

async function retryLoad() {
  try {
    await fetchAll();
  } catch (err) {
    console.error('Error loading accounts:', err);
  }
}

onMounted(async () => {
  await retryLoad();
});

function editAccount(account: Account) {
  editingAccount.value = account;
  accountForm.name = account.name;
  accountForm.type = account.type;
  accountForm.icon = account.icon;
  accountForm.color = account.color;
  accountForm.balance = account.balance;
}

function openAddModal() {
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingAccount.value = null;
  resetForm();
}

function resetForm() {
  accountForm.name = '';
  accountForm.type = AccountType.Bank;
  accountForm.icon = '';
  accountForm.color = '#6366f1';
  accountForm.balance = 0;
}

function openAdjustModal(account: Account) {
  adjustingAccount.value = account;
  newBalance.value = account.balance;
}

function closeAdjustModal() {
  adjustingAccount.value = null;
  newBalance.value = 0;
}

async function saveAccount() {
  try {
    if (editingAccount.value) {
      await update(editingAccount.value.id, {
        name: accountForm.name,
        type: accountForm.type,
        icon: accountForm.icon,
        color: accountForm.color,
      });
    } else {
      await create({
        name: accountForm.name,
        type: accountForm.type,
        icon: accountForm.icon || (accountForm.type === AccountType.CreditCard ? '\u{1F4B3}' : accountForm.type === AccountType.Bank ? '\u{1F3E6}' : '\u{1F4F1}'),
        color: accountForm.color,
        balance: accountForm.balance,
      });
    }
    closeModal();
  } catch (err) {
    console.error('Failed to save account:', err);
  }
}

async function saveBalance() {
  if (!adjustingAccount.value) return;
  try {
    await update(adjustingAccount.value.id, { balance: newBalance.value });
    closeAdjustModal();
  } catch (err) {
    console.error('Failed to adjust balance:', err);
  }
}

async function deleteAccount(id: string) {
  if (confirm('Are you sure you want to delete this account? Linked transactions will lose their account reference.')) {
    try {
      await remove(id);
    } catch (err) {
      console.error('Failed to delete account:', err);
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

.btn-add {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.summary-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-stat {
  flex: 1;
  min-width: 120px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #22c55e;
}

.stat-value.negative {
  color: #ef4444;
}

.stat-value.credit-card {
  color: #f59e0b;
}

.accounts-grouped {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.account-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border);
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-icon {
  font-size: 1.25rem;
}

.group-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.group-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: #22c55e;
}

.group-total.cc-total {
  color: #f59e0b;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.cc-card {
  border-color: rgba(245, 158, 11, 0.2);
}

.account-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.account-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.account-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.account-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.account-type-badge {
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.account-type-badge.cc-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.account-actions {
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

.account-balance {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.account-balance.negative {
  color: #ef4444;
}

.account-footer {
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
}

.btn-adjust {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-adjust:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.current-balance-display {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border-radius: 10px;
  border: 1px solid var(--border);
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

.form-group input[type="color"] {
  height: 44px;
  padding: 0.25rem;
  cursor: pointer;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

  .summary-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-left h1 {
    font-size: 1.5rem;
  }
}
</style>
