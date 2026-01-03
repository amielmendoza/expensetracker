# Supabase Setup Guide for Expense Tracker

This guide will help you set up your Expense Tracker application with Supabase.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js installed on your machine

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter your project details:
   - Project name: `expense-tracker` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Select the region closest to your users
4. Click "Create new project" and wait for it to be provisioned

## Step 2: Set Up Database Tables

Once your project is created, go to the SQL Editor and run the following SQL to create the necessary tables:

```sql
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
```

## Step 3: Configure Row Level Security (RLS)

For now, we'll enable RLS but allow all operations (you can customize this later for user-specific data):

```sql
-- Enable Row Level Security
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringExpenses" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (customize later for user-specific access)
CREATE POLICY "Allow all operations on Categories" ON "Categories" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on Expenses" ON "Expenses" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on Budgets" ON "Budgets" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on RecurringExpenses" ON "RecurringExpenses" FOR ALL USING (true) WITH CHECK (true);
```

## Step 4: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the "Settings" icon (gear icon)
2. Click on "API" in the settings menu
3. Copy the following values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon/public key**: This is your `VITE_SUPABASE_ANON_KEY`

## Step 5: Configure Your Application

1. Navigate to the `expensetracker.client` directory
2. Open the `.env` file
3. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Install Dependencies and Run

```bash
cd expensetracker.client
npm install
npm run dev
```

Your application should now be connected to Supabase!

## Database Schema Overview

### Tables

1. **Categories**
   - Stores expense categories with icons and colors
   - Supports parent-child relationships for subcategories
   - Includes default categories

2. **Expenses**
   - Main table for tracking expenses
   - Links to categories via foreign key
   - Supports tags, notes, and payment methods
   - Automatically updates `updated_at` timestamp

3. **Budgets**
   - Tracks budget allocations per category or overall
   - Supports different time periods (daily, weekly, monthly, yearly)
   - Can be activated/deactivated

4. **RecurringExpenses**
   - Manages recurring expense templates
   - Tracks frequency and next due date
   - Can be activated/deactivated

## Payment Method Enum Values

- `0` = Cash
- `1` = Card
- `2` = Digital Wallet
- `3` = Bank Transfer

## Budget Period Enum Values

- `0` = Daily
- `1` = Weekly
- `2` = Monthly
- `3` = Yearly

## Recurring Frequency Enum Values

- `0` = Daily
- `1` = Weekly
- `2` = Monthly
- `3` = Yearly

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure you've created the `.env` file in the `expensetracker.client` directory
- Verify that the environment variables are correctly named (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- Restart your development server after changing environment variables

### Error: "Failed to fetch..."
- Check that your Supabase project is running
- Verify your internet connection
- Check the browser console for detailed error messages
- Ensure Row Level Security policies are set up correctly

### No data showing
- Verify that the default categories were inserted successfully
- Check the Supabase Table Editor to see if data exists
- Look at the browser console for any errors

## Next Steps

- Customize RLS policies for user authentication
- Add user authentication with Supabase Auth
- Set up real-time subscriptions for live updates
- Configure storage for receipt uploads

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
