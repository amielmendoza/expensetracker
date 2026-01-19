-- =====================================================
-- Income Tracking Feature - Supabase Migration (Fixed)
-- Matches existing schema conventions
-- Execute this script in Supabase SQL Editor
-- =====================================================

-- 1. Add type column to existing Categories table
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Categories' AND column_name = 'type'
    ) THEN
        ALTER TABLE "Categories" ADD COLUMN type INTEGER DEFAULT 0 NOT NULL;
        COMMENT ON COLUMN "Categories".type IS '0=Expense, 1=Income, 2=Both';
    END IF;
END $$;


-- 2. Create Incomes table (matching Expenses table structure)
-- =====================================================
DROP TABLE IF EXISTS "Incomes" CASCADE;

CREATE TABLE "Incomes" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(200) NOT NULL,
  category_id UUID NOT NULL REFERENCES "Categories"(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  source INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "Incomes" IS 'Stores income transactions';
COMMENT ON COLUMN "Incomes".source IS '0=Salary, 1=Freelance, 2=Business, 3=Investment, 4=Rental, 5=Gift, 6=Refund, 7=Other';

-- Create indexes for Incomes
CREATE INDEX idx_incomes_date ON "Incomes"(date);
CREATE INDEX idx_incomes_category_id ON "Incomes"(category_id);
CREATE INDEX idx_incomes_created_at ON "Incomes"(created_at);

-- Create trigger for Incomes table (assuming update_updated_at_column function exists)
CREATE TRIGGER update_incomes_updated_at
BEFORE UPDATE ON "Incomes"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 3. Create SavingsGoals table
-- =====================================================
DROP TABLE IF EXISTS "SavingsGoals" CASCADE;

CREATE TABLE "SavingsGoals" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  period INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE "SavingsGoals" IS 'Stores savings goals with target amounts and periods';
COMMENT ON COLUMN "SavingsGoals".period IS '0=Daily, 1=Weekly, 2=Monthly, 3=Yearly';
COMMENT ON COLUMN "SavingsGoals".current_amount IS 'Calculated as Income - Expenses for the date range';

-- Create indexes for SavingsGoals
CREATE INDEX idx_savingsgoals_start_date ON "SavingsGoals"(start_date);
CREATE INDEX idx_savingsgoals_end_date ON "SavingsGoals"(end_date);
CREATE INDEX idx_savingsgoals_is_active ON "SavingsGoals"(is_active);


-- 4. Insert default Income categories
-- =====================================================
INSERT INTO "Categories" (name, icon, color, is_default, type)
VALUES
    ('Salary', '💼', '#4CAF50', true, 1),
    ('Freelance', '🖥️', '#2196F3', true, 1),
    ('Business', '🏢', '#FF9800', true, 1),
    ('Investment', '📈', '#9C27B0', true, 1),
    ('Rental Income', '🏠', '#00BCD4', true, 1),
    ('Gift', '🎁', '#E91E63', true, 1),
    ('Refund', '💵', '#009688', true, 1),
    ('Other Income', '💰', '#8BC34A', true, 1)
ON CONFLICT (name) DO NOTHING;


-- =====================================================
-- Verification Queries
-- =====================================================
-- Check if type column was added to Categories
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Categories' AND column_name = 'type';

-- Check if Incomes table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'Incomes';

-- Check if SavingsGoals table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'SavingsGoals';

-- Check all categories (both expense and income)
SELECT id, name, type, is_default FROM "Categories" ORDER BY type, name;

-- Count records in all tables
SELECT
    (SELECT COUNT(*) FROM "Categories") as categories_count,
    (SELECT COUNT(*) FROM "Expenses") as expenses_count,
    (SELECT COUNT(*) FROM "Incomes") as incomes_count,
    (SELECT COUNT(*) FROM "SavingsGoals") as savingsgoals_count;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
