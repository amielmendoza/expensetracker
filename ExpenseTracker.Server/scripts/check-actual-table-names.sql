-- IMPORTANT: Run this in Supabase SQL Editor to find your EXACT table names
-- Go to: https://app.supabase.com/project/gmvrkjwugeozurbjdpzy/editor/sql

-- This query shows the EXACT table names as PostgreSQL stores them
SELECT 
    schemaname,
    tablename,
    -- This shows if the table name is quoted (case-sensitive) or not
    CASE 
        WHEN tablename = LOWER(tablename) THEN 'Lowercase (unquoted)'
        ELSE 'Mixed case (likely quoted)'
    END as naming_type
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Alternative query using information_schema
SELECT 
    table_schema,
    table_name,
    -- Check if table name matches lowercase version
    CASE 
        WHEN table_name = LOWER(table_name) THEN 'Lowercase (unquoted)'
        ELSE 'Mixed case (likely quoted)'
    END as naming_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- To test if a table exists with a specific name, try:
-- SELECT * FROM "Expenses" LIMIT 1;  -- If this works, table is "Expenses" (quoted)
-- SELECT * FROM expenses LIMIT 1;    -- If this works, table is expenses (lowercase)




