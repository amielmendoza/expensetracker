-- Run this in Supabase SQL Editor to check your table name
-- Go to: https://app.supabase.com/project/gmvrkjwugeozurbjdpzy/editor/sql

-- Check all tables with "categor" in the name
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND LOWER(table_name) LIKE '%categor%'
ORDER BY table_name;

-- Check the exact table name (case-sensitive)
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Categories', 'categories', '"Categories"');

-- If you see the table, note the exact name and we'll update the code accordingly


