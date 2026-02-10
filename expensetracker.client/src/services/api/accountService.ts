import { supabase } from '@/lib/supabase';
import type { Account, CreateAccount, UpdateAccount } from '@/types';
import { AccountType } from '@/types';

const transformAccountRow = (row: any): Account => {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    color: row.color,
    balance: row.balance,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const accountService = {
  async getAll(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('Accounts')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching accounts:', error);
      throw new Error(`Failed to fetch accounts: ${error.message}`);
    }

    return (data || []).map(transformAccountRow);
  },

  async getById(id: string): Promise<Account> {
    const { data, error } = await supabase
      .from('Accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching account:', error);
      throw new Error(`Failed to fetch account: ${error.message}`);
    }

    return transformAccountRow(data);
  },

  async create(account: CreateAccount): Promise<Account> {
    const { data, error } = await supabase
      .from('Accounts')
      .insert({
        name: account.name,
        type: account.type,
        icon: account.icon,
        color: account.color,
        balance: account.balance ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      throw new Error(`Failed to create account: ${error.message}`);
    }

    return transformAccountRow(data);
  },

  async update(id: string, account: UpdateAccount): Promise<Account> {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (account.name !== undefined) updateData.name = account.name;
    if (account.type !== undefined) updateData.type = account.type;
    if (account.icon !== undefined) updateData.icon = account.icon;
    if (account.color !== undefined) updateData.color = account.color;
    if (account.balance !== undefined) updateData.balance = account.balance;

    const { data, error } = await supabase
      .from('Accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      throw new Error(`Failed to update account: ${error.message}`);
    }

    return transformAccountRow(data);
  },

  async adjustBalance(id: string, delta: number): Promise<Account> {
    const current = await this.getById(id);
    const newBalance = current.balance + delta;
    return this.update(id, { balance: newBalance });
  },

  async adjustForExpense(id: string, amount: number): Promise<Account> {
    const account = await this.getById(id);
    // Credit cards: expense increases balance (debt). Others: expense decreases balance.
    const delta = account.type === AccountType.CreditCard ? amount : -amount;
    return this.update(id, { balance: account.balance + delta });
  },

  async reverseForExpense(id: string, amount: number): Promise<Account> {
    const account = await this.getById(id);
    // Reverse of adjustForExpense
    const delta = account.type === AccountType.CreditCard ? -amount : amount;
    return this.update(id, { balance: account.balance + delta });
  },

  async adjustForIncome(id: string, amount: number): Promise<Account> {
    const account = await this.getById(id);
    // Credit cards: income decreases balance (paying off debt). Others: income increases balance.
    const delta = account.type === AccountType.CreditCard ? -amount : amount;
    return this.update(id, { balance: account.balance + delta });
  },

  async reverseForIncome(id: string, amount: number): Promise<Account> {
    const account = await this.getById(id);
    // Reverse of adjustForIncome
    const delta = account.type === AccountType.CreditCard ? amount : -amount;
    return this.update(id, { balance: account.balance + delta });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('Accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting account:', error);
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  },
};
