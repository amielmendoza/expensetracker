# Local Development Setup with Supabase

This guide will help you configure your localhost development environment to connect to your Supabase database.

## Step 1: Get Your Database Password

⚠️ **You need your database password** (not the API key) to connect.

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`gmvrkjwugeozurbjdpzy`)
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection string** section
5. You'll see your connection string with the password, or you can find/reset your database password here

## Step 2: Update appsettings.Development.json

1. Open `ExpenseTracker.Server/appsettings.Development.json`
2. Find the connection string:
   ```json
   "DefaultConnection": "postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require"
   ```
3. Replace `[YOUR-PASSWORD]` with your actual database password

### Example (DO NOT USE - Replace with your actual password):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://postgres:your-actual-password-here@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require"
  },
  "Database": {
    "Provider": "postgresql"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  }
}
```

## Step 3: Verify Configuration

The `appsettings.Development.json` file should now have:
- ✅ Connection string pointing to your Supabase database
- ✅ `Database.Provider` set to `postgresql`
- ✅ SSL mode set to `require` for secure connection

## Step 4: Test the Connection

1. **Run the application:**
   ```bash
   cd ExpenseTracker.Server
   dotnet run
   ```

2. **Check the console output** for:
   - "Ensuring database is created..." or "Applying database migrations..."
   - "Database created successfully" or "Database migrations applied successfully"
   - "Seeding default categories..." (if categories don't exist)

3. **Test the API:**
   - Open your browser to `https://localhost:7242/api/categories`
   - You should see the default categories returned as JSON

4. **Check for errors:**
   - If you see connection errors, verify:
     - Password is correct
     - Connection string format is correct
     - Your internet connection is active (Supabase is cloud-hosted)
     - SSL mode is set to `require`

## Troubleshooting

### Connection Timeout
- ✅ Verify your internet connection
- ✅ Check that Supabase project is active
- ✅ Ensure firewall isn't blocking PostgreSQL port 5432

### Authentication Failed
- ✅ Double-check your database password
- ✅ Verify username is `postgres` (default Supabase user)
- ✅ Make sure password doesn't have special characters that need URL encoding

### SSL/TLS Errors
- ✅ Ensure `?sslmode=require` is at the end of connection string
- ✅ Check that connection string format is correct
- ✅ Verify you're using the correct host: `db.gmvrkjwugeozurbjdpzy.supabase.co`

### Database Not Found
- ✅ Verify database name is `postgres` (default Supabase database)
- ✅ Check that your Supabase project is active

## Security Best Practices

🔒 **Important Security Notes:**

1. **Never commit your password** to source control
   - The `appsettings.Development.json` file should be in `.gitignore` if it contains real passwords
   - Consider using [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) for local development

2. **Use User Secrets for Local Development (Recommended)**

   Instead of putting the password in `appsettings.Development.json`, use .NET User Secrets:

   ```bash
   cd ExpenseTracker.Server
   dotnet user-secrets init
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "postgresql://postgres:YOUR-PASSWORD@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require"
   dotnet user-secrets set "Database:Provider" "postgresql"
   ```

   Then remove the connection string from `appsettings.Development.json` and it will be read from user secrets automatically.

3. **Environment Variables Alternative**

   You can also use environment variables:
   ```bash
   # Windows PowerShell
   $env:ConnectionStrings__DefaultConnection="postgresql://postgres:YOUR-PASSWORD@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require"
   $env:Database__Provider="postgresql"
   
   # Windows CMD
   set ConnectionStrings__DefaultConnection=postgresql://postgres:YOUR-PASSWORD@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require
   set Database__Provider=postgresql
   
   # Linux/Mac
   export ConnectionStrings__DefaultConnection="postgresql://postgres:YOUR-PASSWORD@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require"
   export Database__Provider="postgresql"
   ```

## Switching Back to SQL Server (Optional)

If you want to switch back to SQL Server for local development:

1. Update `appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=ExpenseTracker;Integrated Security=true;TrustServerCertificate=true;"
     },
     "Database": {
       "Provider": "sqlserver"
     }
   }
   ```

2. Make sure SQL Server is running locally

## Next Steps

Once your local environment is connected to Supabase:
- ✅ You can develop and test against the same database as production
- ✅ Data changes will be reflected in your Supabase project
- ✅ You can use Supabase Dashboard to view/manage your data
- ✅ When ready, deploy to Azure with the same connection string

## Additional Resources

- [Supabase Dashboard](https://app.supabase.com/project/gmvrkjwugeozurbjdpzy)
- [Supabase C# Documentation](https://supabase.com/docs/reference/csharp/start)
- [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)


