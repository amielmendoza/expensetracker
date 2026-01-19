# Creating the Database Schema

The error "relation 'Categories' does not exist" means the database tables haven't been created yet.

## Quick Fix: Create and Apply Migration

Run these commands to create the database schema:

```bash
cd ExpenseTracker.Server

# Install EF Core tools if not already installed
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate --context ExpenseTrackerDbContext

# Apply the migration to create tables
dotnet ef database update --context ExpenseTrackerDbContext
```

This will:
1. Create a `Migrations` folder with the database schema
2. Apply the migration to your Supabase database
3. Create all the tables (Categories, Expenses, Budgets, RecurringExpenses)

## Alternative: Use EnsureCreated (Current Method)

The application should automatically create tables using `EnsureCreated()`, but if it's not working:

1. Check the application logs for any errors during database creation
2. Verify the connection string is correct
3. Ensure you have proper permissions on the Supabase database

## Verify Tables Were Created

After running migrations or EnsureCreated, you can verify in Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com/project/gmvrkjwugeozurbjdpzy)
2. Navigate to **Table Editor**
3. You should see:
   - `Categories`
   - `Expenses`
   - `Budgets`
   - `RecurringExpenses`

## Troubleshooting

If `EnsureCreated()` isn't working:
- Use migrations instead (recommended for production)
- Check database permissions
- Verify connection string is correct
- Check application logs for detailed error messages




