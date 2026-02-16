import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Check if using placeholder values
if (supabaseUrl.includes('your-project-url') || supabaseUrl.includes('your-project-ref')) {
  throw new Error(
    'Please update your .env file with actual Supabase credentials.\n\n' +
    'Steps:\n' +
    '1. Create a project at https://supabase.com/dashboard\n' +
    '2. Copy your Project URL and anon key from Settings > API\n' +
    '3. Update the .env file in expensetracker.client folder\n' +
    '4. Restart the development server\n\n' +
    'See SUPABASE_SETUP.md for detailed instructions.'
  );
}

if (supabaseAnonKey.includes('your-anon-key')) {
  throw new Error(
    'Please update your .env file with your actual Supabase anon key.\n' +
    'Get it from: https://supabase.com/dashboard > Your Project > Settings > API'
  );
}

// Create Supabase client without database types for now
// You can add type parameter later: createClient<Database>(supabaseUrl, supabaseAnonKey)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
  }
});
