// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ydzkahuxtmgamdztzgwy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkemthaHV4dG1nYW1kenR6Z3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMzI0NDEsImV4cCI6MjA1MTgwODQ0MX0.vem4NzuVmr2TbQp-Owdd07P_POvH2W1CC_nWqhmpIMk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);