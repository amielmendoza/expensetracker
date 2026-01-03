# Azure Configuration Quick Reference

This file provides a quick reference for configuring your ExpenseTracker application in Azure App Service.

## Required Application Settings

Configure these in Azure Portal → Your App Service → Configuration → Application settings:

### Database Configuration

| Setting Name | Value | Description |
|-------------|-------|-------------|
| `ConnectionStrings__DefaultConnection` | `postgresql://postgres:[PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require` | Your Supabase PostgreSQL connection string (replace [PASSWORD] with your database password) |
| `Database__Provider` | `postgresql` | Database provider type (must be `postgresql` for Supabase) |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Environment name |

### CORS Configuration (Optional - only if frontend is on different domain)

| Setting Name | Value | Description |
|-------------|-------|-------------|
| `Cors__AllowedOrigins__0` | `https://your-frontend-domain.com` | First allowed origin |
| `Cors__AllowedOrigins__1` | `https://www.your-frontend-domain.com` | Second allowed origin (if needed) |

Add more entries (`__2`, `__3`, etc.) for additional origins.

### Logging Configuration (Optional)

| Setting Name | Value | Description |
|-------------|-------|-------------|
| `Logging__LogLevel__Default` | `Information` | Default log level |
| `Logging__LogLevel__Microsoft.AspNetCore` | `Warning` | ASP.NET Core log level |
| `Logging__LogLevel__Microsoft.EntityFrameworkCore` | `Warning` | EF Core log level |

## Connection String Format

### Supabase Connection String Templates

You can use either format, but the standard format is recommended for production:

**Option 1: Standard Format (Recommended)**
```
Host=db.[PROJECT-REF].supabase.co;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;
```

**Option 2: URI Format (Your Project)**
```
postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require
```

Replace:
- `[YOUR-PASSWORD]` with your Supabase database password
- `[PROJECT-REF]` with your Supabase project reference ID

### Getting Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Choose your preferred format:
   - **URI**: Select "URI" format and add `?sslmode=require` if not present
   - **Standard**: Use the format shown above with explicit SSL settings

### Important SSL Settings

For Supabase connections, ensure:
- `SSL Mode=Require` or `sslmode=require` is set
- `Trust Server Certificate=true` is included (for standard format)
- These settings are required for secure connections to Supabase

## Important Notes

1. **Double Underscores**: Azure App Settings use double underscores (`__`) to represent nested configuration sections. For example:
   - `ConnectionStrings__DefaultConnection` maps to `ConnectionStrings:DefaultConnection` in appsettings.json
   - `Cors__AllowedOrigins__0` maps to `Cors:AllowedOrigins[0]` in appsettings.json

2. **No Spaces**: Setting names cannot contain spaces. Use underscores instead.

3. **Case Sensitivity**: Setting names are case-sensitive. Use the exact casing shown above.

4. **Restart Required**: After adding or modifying application settings, restart your App Service for changes to take effect.

5. **Secrets**: Never commit connection strings or passwords to source control. Always use Azure App Settings or Azure Key Vault.

## Verification

After configuring settings, verify they're working:

1. Check **Log stream** in Azure Portal for startup logs
2. Look for "Database migrations applied successfully" or "Database created successfully"
3. Test API endpoints (e.g., `https://your-app.azurewebsites.net/api/categories`)
4. Check for any connection errors in the logs

## Troubleshooting

### Connection String Issues

- Ensure SSL mode is set: `?sslmode=require`
- Verify password is URL-encoded if it contains special characters
- Check Supabase project is active and database is accessible
- Verify firewall rules in Supabase (if applicable)

### CORS Issues

- Ensure frontend URL matches exactly (including `https://` and no trailing slash)
- Check that `AllowCredentials()` is set if using cookies/auth
- Verify CORS middleware is configured before `UseAuthorization()`

### Environment Variable Not Working

- Verify setting name uses double underscores (`__`) for nested sections
- Check for typos in setting names
- Ensure App Service has been restarted after adding settings
- Check that `ASPNETCORE_ENVIRONMENT` is set to `Production`

