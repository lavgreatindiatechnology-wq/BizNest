const SUPABASE_URL='https://ywwojkvarygebbfwiymq.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_uUqW1tX4WdY1we6yj5PnuQ_KpYe_M17';
const db=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
const H12=12*60*60*1000;
async function user(){return (await db.auth.getUser()).data.user}
function remember(){localStorage.setItem('bb12',Date.now())}
async function check12(){let t=+localStorage.getItem('bb12')||0;if(t&&Date.now()-t>H12){await db.auth.signOut();localStorage.removeItem('bb12');return false}return true}
async function logout(){await db.auth.signOut();localStorage.removeItem('bb12');location.href='index.html'}
function slug(s){return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Math.random().toString(36).slice(2,6)}
