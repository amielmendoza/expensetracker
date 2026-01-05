# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ExpenseTracker is a full-stack expense tracking application built with:
- **Backend**: ASP.NET Core 9.0 Web API
- **Frontend**: Vue 3 + TypeScript (Vite)
- **Database**: PostgreSQL (Supabase) or SQLite (local dev)
- **Architecture**: Repository pattern with service layer, Entity Framework Core, AutoMapper

## Build and Run Commands

### Development

**Run both backend and frontend together (recommended):**
```bash
cd ExpenseTracker.Server
dotnet run
```
The SpaProxy configuration automatically starts the Vite dev server at https://localhost:61062.

**Run backend only:**
```bash
cd ExpenseTracker.Server
dotnet run
```
Backend runs at https://localhost:7242 (or http://localhost:5013).

**Run frontend only:**
```bash
cd expensetracker.client
npm run dev
```
Frontend runs at https://localhost:61062.

### Building

**Build entire solution:**
```bash
dotnet build
```

**Build for production:**
```bash
cd expensetracker.client
npm run build
```
Output goes to `ExpenseTracker.Server/wwwroot`.

**Type checking (frontend):**
```bash
cd expensetracker.client
npm run type-check
```

**Linting (frontend):**
```bash
cd expensetracker.client
npm run lint
```

### Database

**Create migration:**
```bash
cd ExpenseTracker.Server
dotnet ef migrations add MigrationName
```

**Apply migrations:**
```bash
cd ExpenseTracker.Server
dotnet ef database update
```

**Reset local database:**
Delete `expensetracker.db` and run `dotnet ef database update`.

## Architecture

### Backend Structure

```
ExpenseTracker.Server/
├── Controllers/          # API endpoints (CategoriesController, ExpensesController, DashboardController)
├── Services/            # Business logic layer (IExpenseService, ICategoryService, IDashboardService)
├── Repositories/        # Data access layer (IExpenseRepository, ICategoryRepository)
├── Models/             # Domain entities (Expense, Category, Budget, RecurringExpense)
├── DTOs/               # Data transfer objects for API contracts
├── Mappings/           # AutoMapper profiles (MappingProfile.cs)
├── Data/               # DbContext (ExpenseTrackerDbContext)
└── Program.cs          # App configuration and startup
```

**Key architectural patterns:**
- **Repository Pattern**: Repositories handle all database access
- **Service Layer**: Services contain business logic and validation
- **DTOs**: All API endpoints use DTOs, not domain models directly
- **AutoMapper**: All mapping between entities and DTOs handled by AutoMapper
- **Dependency Injection**: All services and repositories registered in Program.cs

### Frontend Structure

```
expensetracker.client/src/
├── views/              # Page components (Dashboard, Expenses, Categories)
├── components/         # Reusable UI components
├── stores/            # Pinia stores (expenseStore, categoryStore, dashboardStore, etc.)
├── services/api/      # API service layer (expenseService, categoryService, etc.)
├── router/            # Vue Router configuration
├── types/             # TypeScript type definitions
├── utils/             # Utility functions (dateUtils, etc.)
└── lib/               # Third-party library configurations (supabase.ts)
```

**Key patterns:**
- **Pinia stores**: Centralized state management for all data
- **API services**: All backend communication isolated in service files
- **Type safety**: Full TypeScript coverage with defined interfaces
- **Supabase client**: Direct database access via Supabase client (alternative to backend API)

### Data Flow

**Backend API flow:**
Controller → Service (validation/business logic) → Repository (data access) → DbContext → Database

**Frontend flow:**
Vue Component → Pinia Store → API Service → Backend API or Supabase Client

**Important:** The frontend has two data access modes:
1. Via backend API (`/api/expenses`, `/api/categories`)
2. Direct Supabase access (using `@/lib/supabase` client)

Check which mode is active by examining the service files in `src/services/api/`.

## Database Configuration

### Multi-Provider Support

The application supports both PostgreSQL and SQL Server via environment-based configuration:

**Database provider detection (Program.cs:55-56):**
- Reads `Database__Provider` config setting
- Falls back to connection string analysis (PostgreSQL if contains "Host=", SQL Server if contains "Server=")
- Supported values: `"postgresql"`, `"supabase"`, `"sqlserver"`

### Entity Framework Configuration

**Important DbContext details (Data/ExpenseTrackerDbContext.cs):**
- All table names are lowercase for PostgreSQL compatibility (line 27: `entity.ToTable("expenses")`)
- Category table has mixed casing for some columns using quoted identifiers (line 69: `HasColumnName("\"isDefault\"")`)
- DateTime handling configured for UTC in PostgreSQL (Program.cs:74)

### Migration Behavior

**Development vs Production (Program.cs:114-164):**
- **Development**: Uses `EnsureCreated()` for simplicity
- **Production**: Uses `Migrate()` with fallback to `EnsureCreated()`
- Default categories are seeded on first run (Program.cs:209-226)

## Configuration Files

### Backend Configuration

**appsettings.json / appsettings.Development.json / appsettings.Production.json:**
- Connection strings: `ConnectionStrings:DefaultConnection`
- Database provider: `Database:Provider` (postgresql/sqlserver)
- CORS origins: `Cors:AllowedOrigins` (array)

**Environment variables (for Azure):**
- `ConnectionStrings__DefaultConnection`: Database connection string
- `Database__Provider`: Database type
- `ASPNETCORE_ENVIRONMENT`: Development/Production

### Frontend Configuration

**Required .env file (expensetracker.client/.env):**
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app validates these on startup (src/lib/supabase.ts:7-29).

## Deployment

### Azure Deployment

The application is configured for Azure App Service deployment. Key files:
- `.deployment`: Deployment configuration
- `web.config`: IIS configuration
- Frontend build target (vite.config.ts:49): `../ExpenseTracker.Server/wwwroot`

**Azure configuration checklist:**
1. Set `ConnectionStrings__DefaultConnection` to Supabase connection string
2. Set `Database__Provider` to `"postgresql"`
3. Set `ASPNETCORE_ENVIRONMENT` to `"Production"`
4. Configure CORS if frontend is separate domain

See AZURE_DEPLOYMENT.md for detailed deployment instructions.

## Important Conventions

### API Endpoints

All API endpoints are under `/api` prefix and follow REST conventions:
- `GET /api/expenses` - Get all expenses (with optional filters)
- `GET /api/expenses/{id}` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

Similar patterns for `/api/categories` and `/api/dashboard`.

### DateTime Handling

**Critical:** All DateTime values must be handled as UTC:
- Backend converts to UTC before saving (Program.cs:74)
- Frontend services should send dates in ISO 8601 format
- Filter dates should be constructed as UTC (ExpenseService.cs:106-128)

### ID Types

- **Backend**: `Guid` for Expense IDs, `long` for Category IDs
- **Frontend**: String representations of IDs
- **Database**: UUIDs for Expenses, bigint auto-increment for Categories

### Error Handling

**Backend:**
- Services throw exceptions (ArgumentException, KeyNotFoundException)
- Controllers should handle exceptions and return appropriate HTTP status codes

**Frontend:**
- API services throw errors with descriptive messages
- Global error handler configured in main.ts:11-20
- Stores should catch and handle errors from services

## Adding New Features

### Adding a New Entity

1. Create model in `Models/`
2. Add DbSet to `ExpenseTrackerDbContext`
3. Configure entity in `OnModelCreating` with table name and relationships
4. Create repository interface and implementation in `Repositories/`
5. Create service interface and implementation in `Services/`
6. Create DTOs in `DTOs/`
7. Add AutoMapper mappings in `Mappings/MappingProfile.cs`
8. Create controller in `Controllers/`
9. Register repository and service in `Program.cs` DI container
10. Create migration: `dotnet ef migrations add AddNewEntity`

### Adding a Frontend Feature

1. Define TypeScript types in `src/types/`
2. Create API service in `src/services/api/`
3. Create Pinia store in `src/stores/`
4. Create components in `src/components/`
5. Create view in `src/views/` (if new page)
6. Add route in `src/router/index.ts` (if new page)

## Testing

Currently no test projects exist. To add tests:
- Create `ExpenseTracker.Tests` project for backend unit tests
- Create `ExpenseTracker.IntegrationTests` for API tests
- Frontend tests can be added with Vitest

## Development Tips

- The application uses SpaProxy in development - the .NET server proxies requests to the Vite dev server
- Frontend builds automatically on backend Release builds (csproj:41-44)
- CORS is permissive in Development, restricted in Production (Program.cs:16-48)
- Default categories include a "Cats" category (Program.cs:220)
- Database initialization errors are logged but don't crash the app (Program.cs:239-248)
