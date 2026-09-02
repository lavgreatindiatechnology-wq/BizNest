
const getData=()=>JSON.parse(localStorage.getItem('biznest_data')||'{"users":[]}');
const saveData=d=>localStorage.setItem('biznest_data',JSON.stringify(d));
document.querySelector('#registerForm')?.addEventListener('submit',e=>{e.preventDefault();let d=getData();d.users.push({name:name.value,business:business.value,email:email.value,password:password.value});saveData(d);location='dashboard/dashboard.html'});
document.querySelector('#loginForm')?.addEventListener('submit',e=>{e.preventDefault();let u=getData().users.find(x=>x.email===email.value&&x.password===password.value);if(!u)return alert('Invalid login');location='dashboard/dashboard.html'});
