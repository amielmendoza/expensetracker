-- =====================================================
-- Income Tracking Feature - Database Migration Script
-- Execute this script in Supabase SQL Editor
-- =====================================================

-- 1. Add Type column to Categories table
-- =====================================================
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS type integer DEFAULT 0 NOT NULL;

COMMENT ON COLUMN categories.type IS '0=Expense, 1=Income, 2=Both';


-- 2. Create Incomes table
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

-- Create indexes for Incomes
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_incomes_category_id ON incomes(category_id);
CREATE INDEX IF NOT EXISTS idx_incomes_created_at ON incomes(created_at);


-- 3. Create SavingsGoals table
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

-- Create indexes for SavingsGoals
CREATE INDEX IF NOT EXISTS idx_savingsgoals_start_date ON savingsgoals(start_date);
CREATE INDEX IF NOT EXISTS idx_savingsgoals_end_date ON savingsgoals(end_date);
CREATE INDEX IF NOT EXISTS idx_savingsgoals_is_active ON savingsgoals(is_active);


-- 4. Insert default Income categories
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


-- 5. Enable Row Level Security (RLS) - Optional but recommended
-- =====================================================
-- Uncomment these if you want to enable RLS for the new tables
-- Make sure to adjust the policies based on your auth setup

-- ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savingsgoals ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust based on your auth setup):
-- CREATE POLICY "Allow all operations for authenticated users" ON incomes
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON savingsgoals
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);


-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the migration was successful:

-- Check if type column was added to categories
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'categories' AND column_name = 'type';

-- Check if incomes table was created
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'incomes';

-- Check if savingsgoals table was created
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'savingsgoals';

-- Check if default income categories were inserted
-- SELECT id, name, type FROM categories WHERE type = 1;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
