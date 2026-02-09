import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://uxtyynwfytgremakrxxp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PEKyqSDRCOz6wcjQ48Wzfw_av1vFRIe";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
