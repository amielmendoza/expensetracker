#!/bin/bash
# Bash script to create Entity Framework migrations
# Usage: ./scripts/create-migration.sh InitialCreate

if [ -z "$1" ]; then
    echo "Usage: $0 <MigrationName>"
    echo "Example: $0 InitialCreate"
    exit 1
fi

MIGRATION_NAME=$1
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "Creating Entity Framework migration: $MIGRATION_NAME"

cd "$PROJECT_DIR"

# Check if dotnet ef is installed
if ! dotnet tool list -g | grep -q "dotnet-ef"; then
    echo "Installing dotnet-ef tool..."
    dotnet tool install --global dotnet-ef
fi

# Create migration
echo "Creating migration..."
dotnet ef migrations add "$MIGRATION_NAME" --context ExpenseTrackerDbContext

if [ $? -eq 0 ]; then
    echo "Migration created successfully!"
    echo "To apply the migration, run: dotnet ef database update --context ExpenseTrackerDbContext"
else
    echo "Migration creation failed. Check the error messages above."
    exit 1
fi




