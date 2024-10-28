import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fenpdgndmujcslkjmpgv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbnBkZ25kbXVqY3Nsa2ptcGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyNDE4ODksImV4cCI6MjA0MTgxNzg4OX0.FCCfQf801YniPP4KGvu_Ktu1J8GHqzhXCMt4Sj4yV-M';

export const supabase = createClient(supabaseUrl, supabaseKey);