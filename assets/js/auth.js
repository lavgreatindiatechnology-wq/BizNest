const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY),msg=document.getElementById("msg");
go.onclick=async()=>{msg.textContent="Please wait...";let e,p;
if(location.pathname.endsWith("register.html")){let r=await sb.auth.signUp({email:email.value.trim(),password:password.value,options:{data:{name:name.value.trim()}}});e=r.error;if(!e){msg.textContent="Account created. Now login.";return}}
else {let r=await sb.auth.signInWithPassword({email:email.value.trim(),password:password.value});e=r.error;if(!e){location.href="dashboard.html";return}}
msg.textContent=e?e.message:"Done";};