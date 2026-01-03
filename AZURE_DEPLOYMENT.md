# Azure Deployment Guide for ExpenseTracker

This guide will help you deploy the ExpenseTracker application to Azure App Service with Supabase as the database.

## Prerequisites

1. **Azure Account** with an active subscription
2. **Supabase Account** with a project created
3. **Azure CLI** installed (optional, but recommended)
4. **.NET 9.0 SDK** installed locally
5. **Git** for version control

## Step 1: Set Up Supabase Database

> **Note**: For detailed Supabase setup instructions, see [SUPABASE_SETUP.md](ExpenseTracker.Server/SUPABASE_SETUP.md)

### 1.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Create a new project
3. Wait for the project to be provisioned

### 1.2 Get Your Connection String

Follow the [official Supabase C# documentation](https://supabase.com/docs/reference/csharp/start) for best practices.

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. You can use either format:

   **Option A: URI Format (Your Project Format)**
   - Your connection string format:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - For production, add SSL parameters: `?sslmode=require`
   - Final format for Azure:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres?sslmode=require
     ```

   **Option B: Standard Connection String Format (Recommended)**
   - Use the format recommended by [Supabase's C# documentation](https://supabase.com/docs/reference/csharp/start):
     ```
     Host=db.[PROJECT-REF].supabase.co;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - Replace `[PROJECT-REF]` with your Supabase project reference ID

   **Note**: The standard format is recommended as it provides explicit SSL configuration. For more details, see [SUPABASE_SETUP.md](ExpenseTracker.Server/SUPABASE_SETUP.md).

### 1.3 Create Database Migrations (Optional but Recommended)

If you want to use migrations instead of `EnsureCreated`, run these commands locally:

```bash
cd ExpenseTracker.Server
dotnet ef migrations add InitialCreate --context ExpenseTrackerDbContext
```

This will create a `Migrations` folder with the initial database schema.

## Step 2: Create Azure App Service

### 2.1 Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Web App** and select it
4. Click **Create**
5. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or select existing
   - **Name**: `expensetracker-[your-unique-name]`
   - **Publish**: Code
   - **Runtime stack**: .NET 9
   - **Operating System**: Linux (recommended) or Windows
   - **Region**: Select a region close to your users
   - **App Service Plan**: Create new or select existing
6. Click **Review + create**, then **Create**

### 2.2 Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name ExpenseTrackerRG --location eastus

# Create App Service plan
az appservice plan create \
  --name ExpenseTrackerPlan \
  --resource-group ExpenseTrackerRG \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name expensetracker-[your-unique-name] \
  --resource-group ExpenseTrackerRG \
  --plan ExpenseTrackerPlan \
  --runtime "DOTNET|9.0"
```

## Step 3: Configure Application Settings

> **Quick Setup**: If you have your project details, see [PROJECT_CONFIG.md](ExpenseTracker.Server/PROJECT_CONFIG.md) for your specific configuration.

### 3.1 Set Connection String

1. In Azure Portal, go to your App Service
2. Navigate to **Configuration** → **Application settings**
3. Click **+ New application setting**
4. Add the following settings:

   **Name**: `ConnectionStrings__DefaultConnection`  
   **Value**: Your Supabase connection string (from Step 1.2)
   
   **Example for project `gmvrkjwugeozurbjdpzy`:**
   ```
   Host=db.gmvrkjwugeozurbjdpzy.supabase.co;Database=postgres;Username=postgres;Password=[YOUR-DATABASE-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;
   ```
   
   ⚠️ **Important**: Replace `[YOUR-DATABASE-PASSWORD]` with your actual database password from Supabase Dashboard → Settings → Database

   **Name**: `Database__Provider`  
   **Value**: `postgresql`

   **Name**: `ASPNETCORE_ENVIRONMENT`  
   **Value**: `Production`

### 3.2 Configure CORS (if needed)

If your frontend is hosted separately:

1. In **Application settings**, add:

   **Name**: `Cors__AllowedOrigins__0`  
   **Value**: `https://your-frontend-domain.com`

   **Name**: `Cors__AllowedOrigins__1`  
   **Value**: `https://www.your-frontend-domain.com`

   (Add more entries if you have multiple frontend domains)

### 3.3 Configure Logging (Optional)

For better debugging in production:

1. Add application setting:

   **Name**: `Logging__LogLevel__Default`  
   **Value**: `Information`

   **Name**: `Logging__LogLevel__Microsoft.AspNetCore`  
   **Value**: `Warning`

2. Click **Save** to apply all changes

## Step 4: Deploy the Application

### 4.1 Using Visual Studio / Visual Studio Code

1. Right-click on `ExpenseTracker.Server` project
2. Select **Publish**
3. Choose **Azure** → **Azure App Service (Linux)** or **Azure App Service (Windows)**
4. Select your App Service
5. Click **Publish**

### 4.2 Using Azure CLI

```bash
# Build the project
cd ExpenseTracker.Server
dotnet publish -c Release -o ./publish

# Deploy using Azure CLI
az webapp deploy \
  --resource-group ExpenseTrackerRG \
  --name expensetracker-[your-unique-name] \
  --src-path ./publish \
  --type zip
```

### 4.3 Using GitHub Actions (Recommended for CI/CD)

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '9.0.x'
    
    - name: Build
      run: dotnet build --configuration Release
    
    - name: Publish
      run: dotnet publish ExpenseTracker.Server/ExpenseTracker.Server.csproj --configuration Release --output ./publish
    
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'expensetracker-[your-unique-name]'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./publish
```

## Step 5: Verify Deployment

1. Go to your App Service in Azure Portal
2. Click **Browse** to open your application
3. Check the logs:
   - Go to **Log stream** to see real-time logs
   - Go to **App Service logs** to download log files
4. Verify the database connection:
   - Check logs for "Database migrations applied successfully" or "Database created successfully"
   - Try accessing the API endpoints (e.g., `/api/categories`)

## Step 6: Database Migrations in Production

The application automatically applies migrations on startup when running in Production mode. However, if you need to run migrations manually:

### Option 1: Using Azure Cloud Shell

```bash
# Connect to your App Service
az webapp ssh --name expensetracker-[your-unique-name] --resource-group ExpenseTrackerRG

# Run migrations
cd /home/site/wwwroot
dotnet ef database update --context ExpenseTrackerDbContext
```

### Option 2: Using Kudu Console

1. Go to `https://[your-app-name].scm.azurewebsites.net`
2. Open **Debug console** → **CMD** or **PowerShell**
3. Navigate to `site/wwwroot`
4. Run: `dotnet ef database update --context ExpenseTrackerDbContext`

## Troubleshooting

### Database Connection Issues

- Verify the connection string is correct in Azure App Settings
- Ensure SSL mode is set to `require` in the connection string
- Check Supabase project settings to ensure database is accessible
- Verify firewall rules in Supabase (if applicable)

### CORS Issues

- Ensure CORS settings are configured correctly in Azure App Settings
- Check that frontend URL matches exactly (including protocol and port)
- Review browser console for specific CORS error messages

### Application Not Starting

- Check **Log stream** in Azure Portal for error messages
- Verify all required application settings are configured
- Ensure .NET 9.0 runtime is selected in App Service configuration
- Check **Diagnose and solve problems** in Azure Portal

### Migration Issues

- Ensure `Database__Provider` is set to `postgresql` in App Settings
- Check that connection string has proper SSL configuration
- Review migration logs in Application Insights or Log stream

## Environment Variables Reference

| Setting Name | Description | Example Value |
|-------------|-------------|---------------|
| `ConnectionStrings__DefaultConnection` | Supabase PostgreSQL connection string | `postgresql://postgres:password@host:5432/postgres?sslmode=require` |
| `Database__Provider` | Database provider type | `postgresql` |
| `ASPNETCORE_ENVIRONMENT` | Environment name | `Production` |
| `Cors__AllowedOrigins__0` | First allowed CORS origin | `https://yourdomain.com` |
| `Logging__LogLevel__Default` | Default log level | `Information` |

## Security Best Practices

1. **Never commit connection strings** to source control
2. **Use Azure Key Vault** for sensitive configuration (optional but recommended)
3. **Enable HTTPS only** in App Service configuration
4. **Configure authentication** if needed (Azure AD, etc.)
5. **Regularly update dependencies** to patch security vulnerabilities
6. **Monitor application logs** for suspicious activity
7. **Use managed identity** for Azure resource access (if applicable)

## Cost Optimization

- Start with **Basic (B1)** tier for development/testing
- Use **Standard (S1)** tier for production workloads
- Enable **Auto-scale** based on metrics if traffic varies
- Consider **App Service Plan sharing** for multiple apps
- Monitor usage in **Cost Management** section

## Next Steps

- Set up **Application Insights** for monitoring and diagnostics
- Configure **Custom domains** and SSL certificates
- Set up **Backup** and **Disaster Recovery** plans
- Implement **CI/CD pipeline** for automated deployments
- Configure **Staging slots** for zero-downtime deployments

## Support

For issues specific to:
- **Azure**: [Azure Support](https://azure.microsoft.com/support/)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **.NET**: [.NET Documentation](https://learn.microsoft.com/dotnet/)

