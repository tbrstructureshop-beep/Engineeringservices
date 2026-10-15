// File: config/user/supabaseClient.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Project URL (tanpa /rest/v1/ di ujungnya)
export const SUPABASE_URL = 'https://crrjnokgrwcomatsilmr.supabase.co';

// Anon Public Key
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycmpub2tncndjb21hdHNpbG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMzAzNDIsImV4cCI6MjEwNzYwNjM0Mn0._6NWCe4CwZlPt6kbXRD3sIeGaXE-r47q6REFLGTagrs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
