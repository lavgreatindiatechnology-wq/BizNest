
const get=()=>JSON.parse(localStorage.getItem('biznest_data')||'{"users":[],"products":[],"leads":[]}');
const put=x=>localStorage.setItem('biznest_data',JSON.stringify(x));
document.querySelector('#registerForm')?.addEventListener('submit',e=>{e.preventDefault();let d=get();let u={name:name.value,business:business.value,email:email.value,password:password.value,blocked:false};d.users.push(u);put(d);localStorage.setItem('biznest_session',JSON.stringify(u));location='dashboard/dashboard.html'});
document.querySelector('#loginForm')?.addEventListener('submit',e=>{e.preventDefault();let u=get().users.find(x=>x.email===email.value&&x.password===password.value);if(!u)return msg.textContent='Invalid email or password';if(u.blocked)return msg.textContent='Account blocked';localStorage.setItem('biznest_session',JSON.stringify(u));location='dashboard/dashboard.html'});
document.querySelector('#adminLogin')?.addEventListener('submit',e=>{e.preventDefault();if(email.value==='admin@biznest.com'&&password.value==='admin123')location='admin/admin-dashboard.html';else msg.textContent='Demo Admin: admin@biznest.com / admin123'});
