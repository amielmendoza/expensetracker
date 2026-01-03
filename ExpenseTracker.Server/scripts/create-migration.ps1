# PowerShell script to create Entity Framework migrations
# Usage: .\scripts\create-migration.ps1 -MigrationName "InitialCreate"

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationName
)

Write-Host "Creating Entity Framework migration: $MigrationName" -ForegroundColor Green

# Navigate to server project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Join-Path $scriptPath ".."

Push-Location $projectPath

try {
    # Check if dotnet ef is installed
    $efInstalled = dotnet tool list -g | Select-String "dotnet-ef"
    if (-not $efInstalled) {
        Write-Host "Installing dotnet-ef tool..." -ForegroundColor Yellow
        dotnet tool install --global dotnet-ef
    }

    # Create migration
    Write-Host "Creating migration..." -ForegroundColor Cyan
    dotnet ef migrations add $MigrationName --context ExpenseTrackerDbContext

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration created successfully!" -ForegroundColor Green
        Write-Host "To apply the migration, run: dotnet ef database update --context ExpenseTrackerDbContext" -ForegroundColor Yellow
    } else {
        Write-Host "Migration creation failed. Check the error messages above." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Error creating migration: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}


