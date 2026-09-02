
const KEY='bizboost_v3';
const empty={users:[],businesses:[],products:[],services:[],gallery:[],domains:[],customers:[],orders:[],requests:[]};
function db(){try{return {...empty,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return {...empty}}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
function sid(){return Date.now()+Math.floor(Math.random()*999)}
function ses(){try{return JSON.parse(localStorage.getItem('biz_session')||'null')}catch(e){return null}}
function logout(){localStorage.removeItem('biz_session');location='../login.html'}
function file(f,cb){if(!f)return cb('');let r=new FileReader;r.onload=()=>cb(r.result);r.readAsDataURL(f)}
function biz(){let u=ses();return db().businesses.find(x=>u&&x.ownerId==u.id)}
function menu(){document.querySelector('.side')?.classList.toggle('open')}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function customer(){try{return JSON.parse(localStorage.getItem('biz_customer_session')||'null')}catch(e){return null}}
function setCustomer(c){localStorage.setItem('biz_customer_session',JSON.stringify(c))}
function customerLogout(){localStorage.removeItem('biz_customer_session');location.href='business.html'+location.search}
