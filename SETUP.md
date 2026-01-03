# Expense Tracker - Setup Instructions

## Prerequisites

- .NET 9.0 SDK
- Node.js 20.19.0 or 22.12.0+
- npm or yarn

## Backend Setup

1. Install Entity Framework Core tools (if not already installed):
```bash
dotnet tool install --global dotnet-ef
```

2. Navigate to the server directory:
```bash
cd ExpenseTracker.Server
```

3. Restore NuGet packages:
```bash
dotnet restore
```

4. Create the database migration:
```bash
dotnet ef migrations add InitialCreate
```

5. Apply the migration to create the database:
```bash
dotnet ef database update
```

Note: The database will be created as `expensetracker.db` (SQLite) in the server directory.

## Frontend Setup

1. Navigate to the client directory:
```bash
cd expensetracker.client
```

2. Install npm packages:
```bash
npm install
```

## Running the Application

### Option 1: Run from Visual Studio
- Open `ExpenseTracker.sln` in Visual Studio
- Set `ExpenseTracker.Server` as the startup project
- Press F5 to run

### Option 2: Run from Command Line

1. Start the backend (from `ExpenseTracker.Server` directory):
```bash
dotnet run
```

2. In a separate terminal, start the frontend (from `expensetracker.client` directory):
```bash
npm run dev
```

The application will be available at:
- Frontend: `https://localhost:61062`
- Backend API: `https://localhost:7242` (or check the console output)

## Database Migration Commands

If you need to create a new migration:
```bash
cd ExpenseTracker.Server
dotnet ef migrations add MigrationName
dotnet ef database update
```

## Default Categories

The application comes with 10 default categories pre-seeded:
- 🍽️ Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 💡 Bills & Utilities
- 🎬 Entertainment
- 💪 Health & Fitness
- 📚 Education
- ✈️ Travel
- 💅 Personal Care
- 📦 Other

## Troubleshooting

### Database Issues
- If the database doesn't exist, run `dotnet ef database update`
- To reset the database, delete `expensetracker.db` and run `dotnet ef database update` again

### Port Conflicts
- If port 61062 is in use, update `vite.config.ts` with a different port
- If the backend port conflicts, update `Properties/launchSettings.json`

### CORS Issues
- Ensure the frontend URL matches the CORS configuration in `Program.cs`

## Next Steps

1. Open the application in your browser
2. Start adding expenses using the floating action button (+)
3. View your dashboard to see spending summaries
4. Manage categories as needed

