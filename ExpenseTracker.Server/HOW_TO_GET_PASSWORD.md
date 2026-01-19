# How to Get Your Supabase Database Password

## Option 1: View Your Password (If You Remember Setting It)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **gmvrkjwugeozurbjdpzy**
3. Navigate to **Settings** (gear icon in the left sidebar)
4. Click on **Database** in the settings menu
5. Scroll down to the **Connection string** section
6. Look for the connection string - it may show the password, or you'll need to reset it

## Option 2: Reset Your Database Password (If You Forgot It)

If you don't remember your password or can't see it:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **gmvrkjwugeozurbjdpzy**
3. Navigate to **Settings** → **Database**
4. Scroll down to find **Database Password** section
5. Click **Reset Database Password** or **Change Database Password**
6. Enter a new password (make sure to save it securely!)
7. Supabase will show you the new password - **copy it immediately** as it won't be shown again

## Option 3: Get Password from Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **gmvrkjwugeozurbjdpzy**
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **URI** format
6. The connection string will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.gmvrkjwugeozurbjdpzy.supabase.co:5432/postgres
   ```
7. The password is the part between `postgres:` and `@` (after the colon, before the @ symbol)

## Option 4: Check Project Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **gmvrkjwugeozurbjdpzy**
3. Navigate to **Settings** → **General**
4. Look for database credentials or connection info
5. Some projects show the password in the project overview

## Direct Link to Your Project Settings

**Database Settings:**
https://app.supabase.com/project/gmvrkjwugeozurbjdpzy/settings/database

**General Settings:**
https://app.supabase.com/project/gmvrkjwugeozurbjdpzy/settings/general

## Important Notes

⚠️ **Security Reminders:**
- The password is different from your Supabase account password
- The password is different from the API key you provided earlier
- If you reset the password, you'll need to update it in:
  - `appsettings.Development.json` (for localhost)
  - Azure App Settings (for production deployment)

## What the Password Looks Like

The database password is typically:
- A long random string (if auto-generated)
- Or a password you set when creating the project
- It's used specifically for PostgreSQL database connections
- Format: Usually alphanumeric, may contain special characters

## Still Can't Find It?

If you can't find the password anywhere:

1. **Reset it** - This is the safest option:
   - Go to Settings → Database
   - Click "Reset Database Password"
   - Copy the new password immediately
   - Update your configuration files

2. **Check your project creation email** - Supabase may have sent the initial password via email

3. **Contact Supabase Support** - If you're still stuck, they can help you reset it

## After Getting Your Password

Once you have your password, update:

1. **For Localhost:**
   - File: `ExpenseTracker.Server/appsettings.Development.json`
   - Replace `[YOUR-PASSWORD]` in the connection string

2. **For Azure (when deploying):**
   - Azure Portal → App Service → Configuration → Application settings
   - Update `ConnectionStrings__DefaultConnection` with the password




