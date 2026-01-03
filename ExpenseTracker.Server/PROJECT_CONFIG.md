# Project-Specific Configuration

This file contains your project-specific Supabase configuration details.

## Your Supabase Project Details

- **Project URL**: https://gmvrkjwugeozurbjdpzy.supabase.co
- **Project Reference ID**: `gmvrkjwugeozurbjdpzy`
- **Database Host**: `db.gmvrkjwugeozurbjdpzy.supabase.co`
- **API Key (Publishable)**: `sb_publishable_agMmBxMyzONcbLpPvBGTEA_38TYEzCC`

## Important: Database Connection String

⚠️ **You need your database password** (not the API key) for the connection string.

The API key you provided is for client-side Supabase SDK usage. For Entity Framework Core database connections, you need the PostgreSQL connection string which includes your database password.

### How to Get Your Database Connection String

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection string** section
5. You'll see your connection string. It will look like:

**URI Format (Your Connection String):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres
```

**With SSL (Recommended for Production):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require
```

**Standard Format (Alternative):**
```
Host=db.gmvrkjwugeozurbjdpzy.supabase.co;Database=postgres;Username=postgres;Password=[YOUR-DATABASE-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;
```

Replace `[YOUR-DATABASE-PASSWORD]` with your actual database password (the one you set when creating the Supabase project).

## Azure App Service Configuration

When deploying to Azure, configure these settings in **Azure Portal → Your App Service → Configuration → Application settings**:

| Setting Name | Value |
|-------------|-------|
| `ConnectionStrings__DefaultConnection` | `postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require` |
| `Database__Provider` | `postgresql` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

**Replace `[YOUR-PASSWORD]` with your actual database password.**

⚠️ **Security Note**: Never commit your database password to source control. Always use Azure App Settings or environment variables.

## Local Development (Optional)

If you want to test with Supabase locally, update `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require"
  },
  "Database": {
    "Provider": "postgresql"
  }
}
```

**Replace `[YOUR-PASSWORD]` with your actual database password.**

**Note**: For local development, you can continue using SQL Server. Supabase connection is primarily for production/Azure deployment.

## API Key Usage (Optional)

The publishable API key (`sb_publishable_agMmBxMyzONcbLpPvBGTEA_38TYEzCC`) can be used if you want to integrate Supabase client SDK features in your Vue.js frontend. However, for the current setup using Entity Framework Core, you don't need it.

If you want to use Supabase client features in the future:
- Add it to your Vue.js environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Install Supabase JavaScript client: `npm install @supabase/supabase-js`

## Quick Reference

- **Database Host**: `db.gmvrkjwugeozurbjdpzy.supabase.co`
- **Database Name**: `postgres`
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: [Your database password - get it from Supabase Dashboard]

