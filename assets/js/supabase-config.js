const SUPABASE_URL="https://ywwojkvarygebbfwiymq.supabase.co";
const SUPABASE_KEY="sb_publishable_uUqW1tX4WdY1we6yj5PnuQ_KpYe_M17";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"biznest-session"}
});