# Supabase Database Setup Guide

This guide follows the official [Supabase C# documentation](https://supabase.com/docs/reference/csharp/start) to help you configure your ExpenseTracker application with Supabase.

> **Project-Specific Config**: See [PROJECT_CONFIG.md](PROJECT_CONFIG.md) for your specific Supabase project details.

## Prerequisites

- A Supabase account and project
- Your Supabase project database password
- Your Supabase project reference ID: `gmvrkjwugeozurbjdpzy`

## Step 1: Get Your Supabase Connection Details

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Find your connection details:
   - **Host**: `db.gmvrkjwugeozurbjdpzy.supabase.co` (for your project)
   - **Database**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: Your database password (set during project creation)
   
   ⚠️ **Note**: The API key you have (`sb_publishable_agMmBxMyzONcbLpPvBGTEA_38TYEzCC`) is for client-side use. You need the **database password** for the connection string, which is different and found in the Database settings.

## Step 2: Configure Connection String

### Recommended Format (Standard Connection String)

Following Supabase's recommendations, use this format for better SSL configuration:

```
Host=db.gmvrkjwugeozurbjdpzy.supabase.co;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;
```

**For your project**, replace `[YOUR-PASSWORD]` with your actual database password from Supabase Dashboard.

**Important Settings:**
- `SSL Mode=Require` - Ensures encrypted connection
- `Trust Server Certificate=true` - Required for Supabase's SSL certificate

### Alternative Format (URI)

You can also use the URI format:

```
postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require
```

**For your project**, replace `[YOUR-PASSWORD]` with your actual database password.

## Step 3: Configure for Local Development

Update `appsettings.Development.json` (optional - only if you want to test with Supabase locally):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.[PROJECT-REF].supabase.co;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;"
  },
  "Database": {
    "Provider": "postgresql"
  }
}
```

**Note**: For local development, you can continue using SQL Server or SQLite. The Supabase connection is primarily for production/Azure deployment.

## Step 4: Configure for Azure Deployment

In Azure Portal → Your App Service → Configuration → Application settings:

| Setting Name | Value |
|-------------|-------|
| `ConnectionStrings__DefaultConnection` | `Host=db.[PROJECT-REF].supabase.co;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;` |
| `Database__Provider` | `postgresql` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

## Step 5: Test the Connection

### Option 1: Test via Application Startup

1. Deploy your application
2. Check the logs in Azure Portal → Log stream
3. Look for: "Database migrations applied successfully" or "Database created successfully"

### Option 2: Test Locally (if configured)

1. Run the application locally with Supabase connection string
2. Check console output for database initialization messages
3. Verify API endpoints work (e.g., `/api/categories`)

## Step 6: Create Database Migrations (Recommended)

For production deployments, it's recommended to use migrations:

```bash
cd ExpenseTracker.Server

# Install EF Core tools (if not already installed)
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate --context ExpenseTrackerDbContext

# Review the migration files in the Migrations folder
```

The application will automatically apply migrations on startup in production mode.

## Troubleshooting

### Connection Timeout Issues

- Verify your Supabase project is active
- Check that your IP address is not blocked (check Supabase project settings)
- Ensure firewall rules allow connections from Azure

### SSL/TLS Errors

- Verify `SSL Mode=Require` is set in connection string
- Ensure `Trust Server Certificate=true` is included
- Check that you're using the correct host (should be `db.[PROJECT-REF].supabase.co`)

### Authentication Errors

- Double-check your database password
- Verify the username is `postgres` (default Supabase user)
- Ensure password doesn't contain special characters that need URL encoding (for URI format)

### Migration Errors

- Ensure `Database__Provider` is set to `postgresql` in Azure App Settings
- Check that connection string is correctly formatted
- Verify migrations were created with PostgreSQL provider selected
- Review application logs for specific error messages

## Security Best Practices

1. **Never commit connection strings** to source control
2. **Use Azure Key Vault** for storing sensitive connection strings (optional but recommended)
3. **Rotate database passwords** regularly
4. **Use connection pooling** (automatically handled by Npgsql)
5. **Enable SSL/TLS** (required for Supabase)
6. **Monitor connection logs** for suspicious activity

## Connection Pooling

The application uses Npgsql's built-in connection pooling, which:
- Automatically manages connection reuse
- Reduces connection overhead
- Handles connection failures gracefully
- Configures appropriate pool sizes based on usage

## Additional Resources

- [Supabase C# Documentation](https://supabase.com/docs/reference/csharp/start)
- [Npgsql Documentation](https://www.npgsql.org/doc/)
- [Entity Framework Core with PostgreSQL](https://learn.microsoft.com/en-us/ef/core/providers/npgsql/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)

## Support

For issues specific to:
- **Supabase**: [Supabase Support](https://supabase.com/support)
- **Npgsql/PostgreSQL**: [Npgsql GitHub](https://github.com/npgsql/npgsql)
- **Entity Framework Core**: [EF Core Documentation](https://learn.microsoft.com/en-us/ef/core/)

