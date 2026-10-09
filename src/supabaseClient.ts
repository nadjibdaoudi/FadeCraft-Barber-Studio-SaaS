import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylflehrcgoxplvgyfscd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZmxlaHJjZ294cGx2Z3lmc2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDM4NjgsImV4cCI6MjEwNDk3OTg2OH0.HGJn6HSQvdLKK4ieMU8Q56HWpcKb5xZ2AuONsppoagg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
