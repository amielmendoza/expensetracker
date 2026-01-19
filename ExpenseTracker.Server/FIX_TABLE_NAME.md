# Fix Table Name Issue

The error shows that the table `"Categories"` doesn't exist. We need to match the exact table name in your Supabase database.

## Quick Fix: Check Your Table Name

1. Go to [Supabase SQL Editor](https://app.supabase.com/project/gmvrkjwugeozurbjdpzy/editor/sql)
2. Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND LOWER(table_name) LIKE '%categor%';
```

3. Note the **exact** table name (case-sensitive)

## Then Update the Code

Based on the result, update `ExpenseTracker.Server/Data/ExpenseTrackerDbContext.cs`:

### If table name is `categories` (lowercase):
```csharp
entity.ToTable("categories");
```

### If table name is `Categories` (capital C, unquoted):
```csharp
entity.ToTable("Categories");
```

### If table name is `"Categories"` (quoted, case-sensitive):
```csharp
entity.ToTable("\"Categories\"");
```

## Alternative: Rename Table in Supabase

If you want to use lowercase (recommended), you can rename the table in Supabase:

```sql
ALTER TABLE "Categories" RENAME TO categories;
```

Then use: `entity.ToTable("categories");`

## Or Create Table with Correct Name

If the table doesn't exist, create it using migrations or the Supabase table editor with the name `categories` (lowercase).




