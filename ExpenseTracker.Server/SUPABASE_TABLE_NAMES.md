# Supabase Table Name Configuration

Your Supabase database has these tables:
- **Categories** (7 columns)
- **Expenses** (10 columns)
- **Budgets** (8 columns)
- **RecurringExpenses** (8 columns)

## Current Configuration

The code is currently set to use lowercase table names (PostgreSQL default):
- `categories`
- `expenses`
- `budgets`
- `recurringexpenses`

## If Tables Don't Match

If you get errors that tables don't exist, check the actual table names:

1. Go to [Supabase SQL Editor](https://app.supabase.com/project/gmvrkjwugeozurbjdpzy/editor/sql)
2. Run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

3. Update `ExpenseTracker.Server/Data/ExpenseTrackerDbContext.cs` based on results:

### If tables are lowercase (categories, expenses, etc.):
Current configuration should work.

### If tables are "Categories", "Expenses" (quoted, case-sensitive):
Update to:
```csharp
entity.ToTable("\"Categories\"");
entity.ToTable("\"Expenses\"");
entity.ToTable("\"Budgets\"");
entity.ToTable("\"RecurringExpenses\"");
```

### If tables are Categories, Expenses (unquoted, but capital):
Try:
```csharp
entity.ToTable("Categories");
entity.ToTable("Expenses");
entity.ToTable("Budgets");
entity.ToTable("RecurringExpenses");
```

## Quick Fix: Rename Tables to Lowercase

If you want to use lowercase (recommended), run in Supabase SQL Editor:

```sql
ALTER TABLE "Categories" RENAME TO categories;
ALTER TABLE "Expenses" RENAME TO expenses;
ALTER TABLE "Budgets" RENAME TO budgets;
ALTER TABLE "RecurringExpenses" RENAME TO recurringexpenses;
```

Then the current code configuration will work.


