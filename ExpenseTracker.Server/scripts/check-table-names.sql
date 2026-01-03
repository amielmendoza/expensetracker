-- Run this in Supabase SQL Editor to check your exact table names
-- Go to: https://app.supabase.com/project/gmvrkjwugeozurbjdpzy/editor/sql

-- Check all tables in the public schema
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- This will show you the EXACT table names as PostgreSQL sees them
-- Note: If table_name shows as "Categories" (with quotes in the result), 
--       it's a quoted identifier (case-sensitive)
-- If it shows as categories (lowercase, no quotes), it's unquoted (case-insensitive)

-- Common results:
-- - "Categories" = quoted, case-sensitive (use: entity.ToTable("\"Categories\""))
-- - categories = unquoted, lowercase (use: entity.ToTable("categories"))
-- - Categories = might be stored as lowercase depending on how it was created


