import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const SUPABASE_URL = 'https://oprsgjhzbhxktreaxgum.supabase.co'
// || process.env.SUPABASE_URL || (import.meta as any).env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnNnamh6Ymh4a3RyZWF4Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTA3MDAsImV4cCI6MjA2NTg4NjcwMH0.ers8t0Q5jElXCnhsZC2FjdbLx6UzLxM-soBf44G5LsE'
// || process.env.SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env.SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error("Supabase environment variables are missing");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
