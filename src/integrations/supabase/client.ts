import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oprsgjhzbhxktreaxgum.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnNnamh6Ymh4a3RyZWF4Z3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTA3MDAsImV4cCI6MjA2NTg4NjcwMH0.ers8t0Q5jElXCnhsZC2FjdbLx6UzLxM-soBf44G5LsE';

export const supabase = createClient<any>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
