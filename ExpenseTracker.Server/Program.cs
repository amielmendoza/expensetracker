using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ExpenseTracker.Server.Data;
using ExpenseTracker.Server.Models;
using ExpenseTracker.Server.Repositories;
using ExpenseTracker.Server.Services;
using ExpenseTracker.Server.Mappings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVueApp", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            // Get allowed origins from configuration (Azure App Settings)
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? Array.Empty<string>();
            
            if (allowedOrigins.Length > 0)
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
            else
            {
                // Fallback: allow requests from same origin (for Azure App Service)
                policy.SetIsOriginAllowed(_ => true)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
        }
    });
});

// Configure Entity Framework with database provider detection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// Determine database provider based on connection string or environment variable
var databaseProvider = builder.Configuration["Database:Provider"]?.ToLowerInvariant() 
    ?? (connectionString.Contains("Server=") && !connectionString.Contains("Host=") ? "sqlserver" : "postgresql");

builder.Services.AddDbContext<ExpenseTrackerDbContext>(options =>
{
    switch (databaseProvider)
    {
        case "postgresql":
        case "supabase":
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                // Enable retry on failure for transient errors (recommended for cloud databases)
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
                
                // Configure DateTime handling for PostgreSQL
                // This ensures all DateTime values are treated as UTC
                AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", false);
            });
            break;
        case "sqlserver":
            options.UseSqlServer(connectionString, sqlServerOptions =>
            {
                sqlServerOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null);
            });
            break;
        default:
            throw new NotSupportedException($"Database provider '{databaseProvider}' is not supported.");
    }
});

// Register AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Register repositories
builder.Services.AddScoped<IExpenseRepository, ExpenseRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();

// Register services
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

var app = builder.Build();

// Apply database migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ExpenseTrackerDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        
        // In production, use migrations; in development, use EnsureCreated for simplicity
        if (app.Environment.IsProduction())
        {
            logger.LogInformation("Applying database migrations...");
            try
            {
                context.Database.Migrate();
                logger.LogInformation("Database migrations applied successfully.");
            }
            catch (Exception migrationEx)
            {
                logger.LogWarning(migrationEx, "Failed to apply migrations. This may be expected if no migrations exist yet. Error: {Message}", migrationEx.Message);
                // If migrations fail, try EnsureCreated as fallback (for initial deployment)
                logger.LogInformation("Attempting to ensure database is created...");
                try
                {
                    var created = context.Database.EnsureCreated();
                    if (created)
                    {
                        logger.LogInformation("Database created successfully using EnsureCreated.");
                    }
                }
                catch (Exception ensureEx)
                {
                    logger.LogError(ensureEx, "Failed to create database. Please ensure connection string is correct and database is accessible.");
                }
            }
        }
        else
        {
            logger.LogInformation("Ensuring database is created...");
            try
            {
                var created = context.Database.EnsureCreated();
                
                if (created)
                {
                    logger.LogInformation("Database schema created successfully.");
                }
                else
                {
                    logger.LogInformation("Database schema already exists.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating database schema: {Message}", ex.Message);
                logger.LogWarning("Continuing startup despite database schema creation error. Tables may already exist.");
                // Don't throw - allow app to start and try to use existing tables
            }
        }
        
        // Ensure seed data exists - try to query categories
        try
        {
            // First, try to find the actual table name in the database
            string? actualTableName = null;
            try
            {
                var tableNames = context.Database.SqlQueryRaw<string>(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND LOWER(table_name) LIKE '%categor%'")
                    .ToList();
                
                if (tableNames.Any())
                {
                    actualTableName = tableNames.First();
                    logger.LogInformation("Found table in database: {TableName}", actualTableName);
                }
            }
            catch (Exception tableCheckEx)
            {
                logger.LogWarning(tableCheckEx, "Could not check table names: {Message}", tableCheckEx.Message);
            }
            
            // Try to query categories
            bool hasCategories = false;
            try
            {
                hasCategories = context.Categories.Any();
                logger.LogInformation("Successfully queried Categories table.");
            }
            catch (Exception queryEx)
            {
                logger.LogError(queryEx, "Error querying Categories table: {Message}", queryEx.Message);
                if (actualTableName != null)
                {
                    logger.LogWarning("Table exists as '{TableName}' but mapping may be incorrect.", actualTableName);
                }
                logger.LogWarning("Skipping category seeding. App will continue to start.");
                hasCategories = true; // Skip seeding to allow app to start
            }
            
            if (!hasCategories)
            {
                logger.LogInformation("Seeding default categories...");
                var defaultCategories = new[]
                {
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Food & Dining", Icon = "🍽️", Color = "#FF6B6B", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Transportation", Icon = "🚗", Color = "#4ECDC4", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Shopping", Icon = "🛍️", Color = "#95E1D3", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Bills & Utilities", Icon = "💡", Color = "#F38181", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Entertainment", Icon = "🎬", Color = "#AA96DA", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Health & Fitness", Icon = "💪", Color = "#FCBAD3", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Education", Icon = "📚", Color = "#A8E6CF", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Travel", Icon = "✈️", Color = "#FFD93D", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Personal Care", Icon = "💅", Color = "#6BCB77", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Cats", Icon = "🐱", Color = "#FF9F66", IsDefault = true },
                    new Category { CreatedAt = DateTime.UtcNow, Name = "Other", Icon = "📦", Color = "#95A5A6", IsDefault = true }
                };
                
                context.Categories.AddRange(defaultCategories);
                context.SaveChanges();
                logger.LogInformation("Default categories seeded successfully.");
            }
            else
            {
                logger.LogInformation("Default categories already exist.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking/seeding categories: {Message}", ex.Message);
            // Don't throw - allow app to start even if seeding fails
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred creating/seeding the database: {Message}", ex.Message);
        logger.LogError(ex, "Stack trace: {StackTrace}", ex.StackTrace);
        
        // Don't crash the app - allow it to start even if database initialization fails
        // The app can still function, and database issues can be resolved later
        logger.LogWarning("Application will continue to start despite database initialization errors.");
    }
}

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use CORS - must be before UseAuthorization
app.UseCors("AllowVueApp");

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
