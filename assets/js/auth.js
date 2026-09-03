const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
const msg=document.getElementById("msg");
if(document.getElementById("loginBtn")) document.getElementById("loginBtn").onclick=async()=>{
 msg.textContent="Logging in...";
 const {error}=await sb.auth.signInWithPassword({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value});
 if(error){msg.textContent="Error: "+error.message;return}
 location.href="dashboard.html";
};
if(document.getElementById("registerBtn")) document.getElementById("registerBtn").onclick=async()=>{
 msg.textContent="Creating account...";
 const {error}=await sb.auth.signUp({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value,options:{data:{name:(document.getElementById("name")||{}).value||""}}});
 msg.textContent=error?"Error: "+error.message:"Account created successfully. Check your email if confirmation is enabled.";
};