const sb=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
const slug=new URLSearchParams(location.search).get("slug");
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function loadSite(){
 if(!slug){document.getElementById("loading").innerHTML='<div class="card"><h2>Business website not found</h2><p>Create or open a business using its slug link.</p></div>';return;}
 const {data:b,error}=await sb.from("businesses").select("*").eq("slug",slug).maybeSingle();
 if(error||!b){document.getElementById("loading").innerHTML='<div class="card"><h2>Business website not found</h2><p>Please check your business URL.</p></div>';return;}
 const customerURL="customer.html?slug="+encodeURIComponent(slug);
 brand.textContent=b.name||"Business";businessName.textContent=b.name||"Business";footerName.textContent=b.name||"Business";
 tagline.textContent=b.tagline||"";contactLine.textContent=[b.phone,b.email].filter(Boolean).join(" • ");address.textContent=b.address||"";
 customerLink.href=customerURL;
 const p=await sb.from("products").select("*").eq("business_id",b.id).eq("active",true);
 productsList.innerHTML=(p.data||[]).map(x=>`<div class="card"><img class="product-img" src="${safe(x.image_url||'https://placehold.co/500x300?text=Product')}" alt=""><h3>${safe(x.name)}</h3><p class="muted">${safe(x.description||"")}</p><p class="price">₹${safe(x.price||0)}</p><a class="btn orange" href="${customerURL}">Order Now</a></div>`).join("")||'<p class="muted">No products added yet.</p>';
 const s=await sb.from("services").select("*").eq("business_id",b.id).eq("active",true);
 servicesList.innerHTML=(s.data||[]).map(x=>`<div class="card service-card"><div class="service-icon">🛠️</div><h3>${safe(x.name)}</h3><p class="muted">${safe(x.description||"")}</p><p class="price">₹${safe(x.price||0)}</p><a class="btn orange" href="${customerURL}">Book Appointment</a></div>`).join("")||'<p class="muted">No services added yet.</p>';
 loading.classList.add("hidden");content.classList.remove("hidden");
}loadSite();