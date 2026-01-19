-- =====================================================
-- Complete ExpenseTracker Database Schema
-- Execute this script in Supabase SQL Editor
-- This creates ALL tables including income tracking
-- =====================================================

-- 1. Create Categories table
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id bigserial PRIMARY KEY,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name varchar(50) NOT NULL UNIQUE,
    icon varchar(50),
    color varchar(7) DEFAULT '#000000',
    "isDefault" boolean DEFAULT false,
    type integer DEFAULT 0 NOT NULL,
    "parentCategoryId" bigint,

    CONSTRAINT fk_categories_parent
        FOREIGN KEY ("parentCategoryId")
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

COMMENT ON COLUMN categories.type IS '0=Expense, 1=Income, 2=Both';
COMMENT ON COLUMN categories."isDefault" IS 'Whether this is a system default category';

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);


-- 2. Create Expenses table
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric(18,2) NOT NULL,
    description varchar(200) NOT NULL,
    category_id bigint NOT NULL,
    date timestamp with time zone NOT NULL,
    payment_method integer NOT NULL,
    tags text DEFAULT ''::text NOT NULL,
    notes varchar(1000),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_expenses_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE expenses IS 'Stores expense transactions';
COMMENT ON COLUMN expenses.payment_method IS '0=Cash, 1=Card, 2=DigitalWallet, 3=BankTransfer';
COMMENT ON COLUMN expenses.tags IS 'JSON array stored as string';

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);


-- 3. Create Incomes table
-- =====================================================
CREATE TABLE IF NOT EXISTS incomes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric(18,2) NOT NULL,
    description varchar(200) NOT NULL,
    category_id bigint NOT NULL,
    date timestamp with time zone NOT NULL,
    source integer NOT NULL,
    tags text DEFAULT ''::text NOT NULL,
    notes varchar(1000),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_incomes_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE incomes IS 'Stores income transactions';
COMMENT ON COLUMN incomes.source IS '0=Salary, 1=Freelance, 2=Business, 3=Investment, 4=Rental, 5=Gift, 6=Refund, 7=Other';
COMMENT ON COLUMN incomes.tags IS 'JSON array stored as string';

CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_incomes_category_id ON incomes(category_id);
CREATE INDEX IF NOT EXISTS idx_incomes_created_at ON incomes(created_at);


-- 4. Create Budgets table
-- =====================================================
CREATE TABLE IF NOT EXISTS budgets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric(18,2) NOT NULL,
    period integer NOT NULL,
    category_id bigint,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE budgets IS 'Stores budget limits';
COMMENT ON COLUMN budgets.period IS '0=Daily, 1=Weekly, 2=Monthly, 3=Yearly';
COMMENT ON COLUMN budgets.category_id IS 'NULL for overall budget, or specific category';


-- 5. Create RecurringExpenses table
-- =====================================================
CREATE TABLE IF NOT EXISTS recurringexpenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric(18,2) NOT NULL,
    description varchar(200) NOT NULL,
    category_id bigint NOT NULL,
    frequency integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_recurringexpenses_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE recurringexpenses IS 'Stores recurring expense templates';
COMMENT ON COLUMN recurringexpenses.frequency IS '0=Daily, 1=Weekly, 2=Monthly, 3=Yearly';


-- 6. Create SavingsGoals table
-- =====================================================
CREATE TABLE IF NOT EXISTS savingsgoals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    target_amount numeric(18,2) NOT NULL,
    current_amount numeric(18,2) DEFAULT 0 NOT NULL,
    period integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE savingsgoals IS 'Stores savings goals with target amounts and periods';
COMMENT ON COLUMN savingsgoals.period IS '0=Daily, 1=Weekly, 2=Monthly, 3=Yearly';
COMMENT ON COLUMN savingsgoals.current_amount IS 'Calculated as Income - Expenses for the date range';

CREATE INDEX IF NOT EXISTS idx_savingsgoals_start_date ON savingsgoals(start_date);
CREATE INDEX IF NOT EXISTS idx_savingsgoals_end_date ON savingsgoals(end_date);
CREATE INDEX IF NOT EXISTS idx_savingsgoals_is_active ON savingsgoals(is_active);


-- 7. Insert default Expense categories
-- =====================================================
INSERT INTO categories (name, icon, color, "isDefault", type, created_at)
VALUES
    ('Food & Dining', '🍔', '#FF6B6B', true, 0, CURRENT_TIMESTAMP),
    ('Transportation', '🚗', '#4ECDC4', true, 0, CURRENT_TIMESTAMP),
    ('Shopping', '🛍️', '#95E1D3', true, 0, CURRENT_TIMESTAMP),
    ('Entertainment', '🎮', '#F38181', true, 0, CURRENT_TIMESTAMP),
    ('Bills & Utilities', '💡', '#AA96DA', true, 0, CURRENT_TIMESTAMP),
    ('Healthcare', '🏥', '#FCBAD3', true, 0, CURRENT_TIMESTAMP),
    ('Cats', '🐱', '#FFA07A', true, 0, CURRENT_TIMESTAMP),
    ('Other', '📌', '#A8E6CF', true, 0, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;


-- 8. Insert default Income categories
-- =====================================================
INSERT INTO categories (name, icon, color, "isDefault", type, created_at)
VALUES
    ('Salary', '💼', '#4CAF50', true, 1, CURRENT_TIMESTAMP),
    ('Freelance', '🖥️', '#2196F3', true, 1, CURRENT_TIMESTAMP),
    ('Business', '🏢', '#FF9800', true, 1, CURRENT_TIMESTAMP),
    ('Investment', '📈', '#9C27B0', true, 1, CURRENT_TIMESTAMP),
    ('Rental Income', '🏠', '#00BCD4', true, 1, CURRENT_TIMESTAMP),
    ('Gift', '🎁', '#E91E63', true, 1, CURRENT_TIMESTAMP),
    ('Other Income', '💰', '#8BC34A', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;


-- 9. Enable Row Level Security (RLS) - Optional
-- =====================================================
-- Uncomment these if you want to enable RLS for security
-- Make sure to adjust the policies based on your auth setup

-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE recurringexpenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savingsgoals ENABLE ROW LEVEL SECURITY;

-- Example policy for authenticated users (adjust as needed):
-- CREATE POLICY "Allow all operations for authenticated users" ON expenses
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON incomes
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- (Add similar policies for other tables)


-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the schema was created successfully:

-- Check all tables were created
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- Check categories (both expense and income)
-- SELECT id, name, type, "isDefault" FROM categories ORDER BY type, name;

-- Count records
-- SELECT
--     (SELECT COUNT(*) FROM categories) as categories_count,
--     (SELECT COUNT(*) FROM expenses) as expenses_count,
--     (SELECT COUNT(*) FROM incomes) as incomes_count,
--     (SELECT COUNT(*) FROM budgets) as budgets_count,
--     (SELECT COUNT(*) FROM savingsgoals) as savingsgoals_count;

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================
