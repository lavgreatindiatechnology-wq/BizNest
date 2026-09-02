
const DATA=()=>JSON.parse(localStorage.getItem('biznest_data')||'{"users":[],"products":[],"leads":[]}');
const SAVE=x=>localStorage.setItem('biznest_data',JSON.stringify(x));
function toggleMenu(){document.querySelector('.side')?.classList.toggle('open')}
function logout(){localStorage.removeItem('biznest_session');location.href='../login.html'}
function addProduct(){let d=DATA(),n=document.querySelector('#name').value,p=document.querySelector('#price').value;if(!n)return alert('Product name required');d.products.push({name:n,price:p,status:'Active'});SAVE(d);location.reload()}
function addLead(){let d=DATA(),n=document.querySelector('#name').value,e=document.querySelector('#email').value;if(!n)return;d.leads.push({name:n,email:e,status:'New'});SAVE(d);location.reload()}
function del(type,i){let d=DATA();d[type].splice(i,1);SAVE(d);location.reload()}
function block(i){let d=DATA();d.users[i].blocked=!d.users[i].blocked;SAVE(d);location.reload()}
document.addEventListener('DOMContentLoaded',()=>{let d=DATA();
 let pc=document.querySelector('#productCount');if(pc)pc.textContent=d.products.length;
 let pt=document.querySelector('#productsTable');if(pt)pt.innerHTML=d.products.map((x,i)=>`<tr><td>${x.name}</td><td>${x.price}</td><td><span class="badge">${x.status}</span></td><td><button class="btn" onclick="del('products',${i})">Delete</button></td></tr>`).join('')||'<tr><td colspan="4">No products yet</td></tr>';
 let lt=document.querySelector('#leadsTable');if(lt)lt.innerHTML=d.leads.map((x,i)=>`<tr><td>${x.name}</td><td>${x.email}</td><td>${x.status}</td><td><button class="btn" onclick="del('leads',${i})">Delete</button></td></tr>`).join('')||'<tr><td colspan="4">No leads yet</td></tr>';
 let ut=document.querySelector('#usersTable');if(ut)ut.innerHTML=d.users.map((u,i)=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.business}</td><td><span class="badge ${u.blocked?'blocked':''}">${u.blocked?'Blocked':'Active'}</span></td><td><button class="btn" onclick="block(${i})">${u.blocked?'Unblock':'Block'}</button> <button class="btn" onclick="del('users',${i})">Delete</button></td></tr>`).join('')||'<tr><td colspan="5">No users registered</td></tr>';
});
