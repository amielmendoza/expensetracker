-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE "Categories" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  parent_category_id UUID REFERENCES "Categories"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE "Expenses" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(200) NOT NULL,
  category_id UUID NOT NULL REFERENCES "Categories"(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  payment_method INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets Table
CREATE TABLE "Budgets" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES "Categories"(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  period INTEGER NOT NULL DEFAULT 2,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RecurringExpenses Table
CREATE TABLE "RecurringExpenses" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category_id UUID NOT NULL REFERENCES "Categories"(id) ON DELETE RESTRICT,
  frequency INTEGER NOT NULL DEFAULT 2,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_expenses_date ON "Expenses"(date);
CREATE INDEX idx_expenses_category_id ON "Expenses"(category_id);
CREATE INDEX idx_expenses_created_at ON "Expenses"(created_at);
CREATE INDEX idx_budgets_category_id ON "Budgets"(category_id);
CREATE INDEX idx_budgets_dates ON "Budgets"(start_date, end_date);
CREATE INDEX idx_recurring_expenses_category_id ON "RecurringExpenses"(category_id);
CREATE INDEX idx_recurring_expenses_next_due_date ON "RecurringExpenses"(next_due_date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for Expenses table
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON "Expenses"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO "Categories" (name, icon, color, is_default) VALUES
  ('Food & Dining', '🍔', '#FF6B6B', true),
  ('Transportation', '🚗', '#4ECDC4', true),
  ('Shopping', '🛍️', '#45B7D1', true),
  ('Bills & Utilities', '💡', '#FFA07A', true),
  ('Entertainment', '🎬', '#98D8C8', true),
  ('Health & Fitness', '💪', '#6C5CE7', true),
  ('Education', '📚', '#FDCB6E', true),
  ('Travel', '✈️', '#74B9FF', true),
  ('Personal Care', '💅', '#FD79A8', true),
  ('Other', '📌', '#95A5A6', true);

-- Enable Row Level Security
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringExpenses" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
CREATE POLICY "Allow all operations on Categories" ON "Categories" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on Expenses" ON "Expenses" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on Budgets" ON "Budgets" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on RecurringExpenses" ON "RecurringExpenses" FOR ALL USING (true) WITH CHECK (true);
