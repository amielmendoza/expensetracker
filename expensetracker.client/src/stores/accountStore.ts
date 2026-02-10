import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Account, CreateAccount, UpdateAccount } from '@/types';
import { AccountType } from '@/types';
import { accountService } from '@/services/api/accountService';

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const totalBalance = computed(() =>
    accounts.value.reduce((sum, a) =>
      a.type === AccountType.CreditCard ? sum - a.balance : sum + a.balance, 0)
  );

  const bankAccounts = computed(() =>
    accounts.value.filter(a => a.type === AccountType.Bank)
  );

  const eWallets = computed(() =>
    accounts.value.filter(a => a.type === AccountType.EWallet)
  );

  const creditCards = computed(() =>
    accounts.value.filter(a => a.type === AccountType.CreditCard)
  );

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const result = await accountService.getAll();
      accounts.value = result || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch accounts';
      console.error('Error fetching accounts:', err);
      accounts.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function create(account: CreateAccount) {
    loading.value = true;
    error.value = null;
    try {
      const newAccount = await accountService.create(account);
      accounts.value.unshift(newAccount);
      return newAccount;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create account';
      console.error('Error creating account:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function update(id: string, account: UpdateAccount) {
    loading.value = true;
    error.value = null;
    try {
      const updatedAccount = await accountService.update(id, account);
      const index = accounts.value.findIndex((a) => a.id === id);
      if (index >= 0) {
        accounts.value[index] = updatedAccount;
      }
      return updatedAccount;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update account';
      console.error('Error updating account:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function adjustBalance(id: string, delta: number) {
    try {
      const updatedAccount = await accountService.adjustBalance(id, delta);
      const index = accounts.value.findIndex((a) => a.id === id);
      if (index >= 0) {
        accounts.value[index] = updatedAccount;
      }
      return updatedAccount;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to adjust account balance';
      console.error('Error adjusting account balance:', err);
      throw err;
    }
  }

  async function remove(id: string) {
    loading.value = true;
    error.value = null;
    try {
      await accountService.delete(id);
      accounts.value = accounts.value.filter((a) => a.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete account';
      console.error('Error deleting account:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    accounts,
    loading,
    error,
    totalBalance,
    bankAccounts,
    eWallets,
    creditCards,
    fetchAll,
    create,
    update,
    adjustBalance,
    remove,
  };
});
