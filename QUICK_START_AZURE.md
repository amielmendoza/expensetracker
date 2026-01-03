# Quick Start: Deploy to Azure with Your Supabase Project

This is a quick reference guide using your specific Supabase project details.

## Your Project Details

- **Supabase Project URL**: https://gmvrkjwugeozurbjdpzy.supabase.co
- **Project Reference**: `gmvrkjwugeozurbjdpzy`
- **Database Host**: `db.gmvrkjwugeozurbjdpzy.supabase.co`

## Step 1: Get Your Database Password

⚠️ **Important**: You need your **database password** (not the API key) for the connection string.

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Find your **Connection string** section
5. Copy the connection string or note your database password

## Step 2: Create Azure App Service

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Web App** (App Service)
3. Choose:
   - **Runtime stack**: .NET 9
   - **Operating System**: Linux (recommended) or Windows
   - **Region**: Choose closest to your users

## Step 3: Configure Azure App Settings

In Azure Portal → Your App Service → **Configuration** → **Application settings**, add:

### Required Settings

| Name | Value |
|------|-------|
| `ConnectionStrings__DefaultConnection` | `postgresql://postgres:YOUR_DATABASE_PASSWORD@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require` |
| `Database__Provider` | `postgresql` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

**Replace `YOUR_DATABASE_PASSWORD` with your actual password from Step 1.**

### Connection String Template

Use this template and replace `[YOUR-PASSWORD]`:

```
postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require
```

## Step 4: Deploy

### Option A: Visual Studio / VS Code
1. Right-click project → **Publish**
2. Select **Azure App Service**
3. Choose your App Service
4. Click **Publish**

### Option B: Azure CLI
```bash
az webapp deploy \
  --resource-group YourResourceGroup \
  --name your-app-name \
  --src-path ./publish \
  --type zip
```

## Step 5: Verify

1. Go to your App Service URL (e.g., `https://your-app.azurewebsites.net`)
2. Check **Log stream** in Azure Portal for:
   - "Database migrations applied successfully" or
   - "Database created successfully"
3. Test API: `https://your-app.azurewebsites.net/api/categories`

## Troubleshooting

### Can't Connect to Database
- ✅ Verify password is correct (not the API key)
- ✅ Check connection string format matches exactly
- ✅ Ensure `SSL Mode=Require` is included
- ✅ Verify `Trust Server Certificate=true` is included

### Application Won't Start
- ✅ Check **Log stream** in Azure Portal
- ✅ Verify all three App Settings are configured
- ✅ Ensure App Service is restarted after adding settings

## Need More Help?

- **Detailed Setup**: See [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)
- **Supabase Setup**: See [ExpenseTracker.Server/SUPABASE_SETUP.md](ExpenseTracker.Server/SUPABASE_SETUP.md)
- **Project Config**: See [ExpenseTracker.Server/PROJECT_CONFIG.md](ExpenseTracker.Server/PROJECT_CONFIG.md)

## Security Reminder

🔒 **Never commit your database password to source control!**
- Always use Azure App Settings for production
- Use environment variables or user-secrets for local development
- The API key (`sb_publishable_agMmBxMyzONcbLpPvBGTEA_38TYEzCC`) is for client-side use only

