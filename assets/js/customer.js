const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
const slug=new URLSearchParams(location.search).get("slug");
const returnURL=slug?("site.html?slug="+encodeURIComponent(slug)):"index.html";
document.getElementById("backLink").href=returnURL;
document.getElementById("continueBtn").onclick=()=>location.href=returnURL;
async function refresh(){
 const {data:{session}}=await sb.auth.getSession();
 document.getElementById("authBox").classList.toggle("hidden",!!session);
 document.getElementById("loggedBox").classList.toggle("hidden",!session);
}
document.getElementById("loginBtn").onclick=async()=>{
 const msg=document.getElementById("msg");msg.textContent="Logging in...";
 const {error}=await sb.auth.signInWithPassword({email:email.value.trim(),password:password.value});
 if(error){msg.textContent="Error: "+error.message;return}
 location.href=returnURL;
};
document.getElementById("registerBtn").onclick=async()=>{
 const msg=document.getElementById("msg");msg.textContent="Creating account...";
 const {error}=await sb.auth.signUp({email:email.value.trim(),password:password.value});
 msg.textContent=error?"Error: "+error.message:"Account created. Now login.";
};
document.getElementById("logoutBtn").onclick=async()=>{await sb.auth.signOut();refresh();};
refresh();