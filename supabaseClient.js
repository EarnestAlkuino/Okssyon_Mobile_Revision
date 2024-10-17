import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and public API key
const SUPABASE_URL = 'https://lssdyqcpbcrnhmlgrble.supabase.co';
const SUPABASE_PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzc2R5cWNwYmNybmhtbGdyYmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3MTQyNDEsImV4cCI6MjA0NDI5MDI0MX0.QugPAZMtjf9N_WgoSRkQh3_F6OeD0UTCg1qH-JHm2V0';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export default supabase;
