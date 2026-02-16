-- ============================================
-- Multi-User Auth Migration for ExpenseTracker
-- Run this in Supabase SQL Editor
-- ============================================

-- IMPORTANT: Before running this script:
-- 1. Create your first user account via the app's signup form
-- 2. Copy your user UUID from Supabase Auth > Users dashboard
-- 3. Replace 'YOUR_USER_UUID_HERE' below with that UUID

-- ============================================
-- Step 1: Add user_id columns
-- ============================================

-- Expenses
ALTER TABLE "Expenses" ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
UPDATE "Expenses" SET user_id = 'YOUR_USER_UUID_HERE' WHERE user_id IS NULL;
ALTER TABLE "Expenses" ALTER COLUMN user_id SET NOT NULL;

-- Incomes
ALTER TABLE "Incomes" ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
UPDATE "Incomes" SET user_id = 'YOUR_USER_UUID_HERE' WHERE user_id IS NULL;
ALTER TABLE "Incomes" ALTER COLUMN user_id SET NOT NULL;

-- Accounts
ALTER TABLE "Accounts" ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
UPDATE "Accounts" SET user_id = 'YOUR_USER_UUID_HERE' WHERE user_id IS NULL;
ALTER TABLE "Accounts" ALTER COLUMN user_id SET NOT NULL;

-- SavingsGoals
ALTER TABLE "SavingsGoals" ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
UPDATE "SavingsGoals" SET user_id = 'YOUR_USER_UUID_HERE' WHERE user_id IS NULL;
ALTER TABLE "SavingsGoals" ALTER COLUMN user_id SET NOT NULL;

-- Categories (user_id is NULLABLE: NULL = shared default category)
ALTER TABLE "Categories" ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
-- Default categories keep user_id = NULL (shared across all users)
-- User-created categories will get auth.uid() automatically

-- ============================================
-- Step 2: Create indexes for performance
-- ============================================

CREATE INDEX idx_expenses_user_id ON "Expenses"(user_id);
CREATE INDEX idx_incomes_user_id ON "Incomes"(user_id);
CREATE INDEX idx_accounts_user_id ON "Accounts"(user_id);
CREATE INDEX idx_savings_goals_user_id ON "SavingsGoals"(user_id);
CREATE INDEX idx_categories_user_id ON "Categories"(user_id);

-- ============================================
-- Step 3: Enable RLS and create policies
-- ============================================

-- EXPENSES
ALTER TABLE "Expenses" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own expenses" ON "Expenses"
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own expenses" ON "Expenses"
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own expenses" ON "Expenses"
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own expenses" ON "Expenses"
  FOR DELETE USING (auth.uid() = user_id);

-- INCOMES
ALTER TABLE "Incomes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own incomes" ON "Incomes"
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own incomes" ON "Incomes"
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own incomes" ON "Incomes"
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own incomes" ON "Incomes"
  FOR DELETE USING (auth.uid() = user_id);

-- ACCOUNTS
ALTER TABLE "Accounts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own accounts" ON "Accounts"
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own accounts" ON "Accounts"
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own accounts" ON "Accounts"
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own accounts" ON "Accounts"
  FOR DELETE USING (auth.uid() = user_id);

-- SAVINGS GOALS
ALTER TABLE "SavingsGoals" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own goals" ON "SavingsGoals"
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own goals" ON "SavingsGoals"
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own goals" ON "SavingsGoals"
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own goals" ON "SavingsGoals"
  FOR DELETE USING (auth.uid() = user_id);

-- CATEGORIES (special: defaults shared, custom per-user)
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see defaults and own categories" ON "Categories"
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users insert own categories" ON "Categories"
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own categories" ON "Categories"
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own categories" ON "Categories"
  FOR DELETE USING (auth.uid() = user_id);
