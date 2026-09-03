const sb = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

let user;
let business;

const $ = id => document.getElementById(id);


function showTab(id) {

    ['business','products','services','requests']
        .forEach(x => {

            $(x).classList.toggle(
                'hidden',
                x !== id
            );

        });

    if (id === 'products') loadProducts();

    if (id === 'services') loadServices();

    if (id === 'requests') loadRequests();
}


function esc(s='') {

    return String(s).replace(/[&<>"']/g, c => ({

        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'

    }[c]));

}


/* IMAGE UPLOAD */

async function uploadImage(file, folder) {

    if (!file) return null;

    const ext = file.name.split('.').pop();

    const fileName =
        `${folder}/${user.id}/${Date.now()}.${ext}`;

    const { error } =
        await sb.storage
            .from('business-images')
            .upload(fileName, file, {
                upsert: false
            });

    if (error) throw error;


    const { data } =
        sb.storage
            .from('business-images')
            .getPublicUrl(fileName);

    return data.publicUrl;
}


/* INIT */

async function init() {

    const { data: authData } =
        await sb.auth.getUser();

    if (!authData.user) {

        location.href = 'login.html';

        return;
    }

    user = authData.user;


    $('welcome').textContent =
        'Welcome, ' +
        (
            user.user_metadata?.name ||
            user.email
        );


    const r =
        await sb
            .from('businesses')
            .select('*')
            .eq('owner_id', user.id)
            .maybeSingle();


    business = r.data;


    if (business) {

        fillBusiness();

    } else {

        $('publicStatus').textContent =
            'Create your business first.';
    }


    await loadProducts();

    await loadServices();

    await loadRequests();
}


/* FILL BUSINESS */

function fillBusiness() {

    $('bname').value =
        business.name || '';

    $('slug').value =
        business.slug || '';

    $('tagline').value =
        business.tagline || '';

    $('phone').value =
        business.phone || '';

    $('bemail').value =
        business.email || '';

    $('address').value =
        business.address || '';


    if (business.logo_url) {

        $('logoPreview').src =
            business.logo_url;

        $('logoPreviewBox')
            .classList
            .remove('hidden');

    }


    const url =
        location.origin +
        location.pathname.replace(
            'dashboard.html',
            ''
        ) +
        'site.html?slug=' +
        encodeURIComponent(business.slug);


    $('publicUrl').value = url;


    $('shareBox')
        .classList
        .remove('hidden');


    $('publicStatus').textContent =
        '✅ Your public business website is ready.';
}


/* SAVE BUSINESS */

async function saveBusiness() {

    try {

        const name =
            $('bname').value.trim();


        const slug =
            $('slug').value
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '-');


        if (!name || !slug) {

            $('bmsg').textContent =
                'Business name and URL name are required.';

            return;
        }


        $('bmsg').textContent =
            'Saving business...';


        let logoUrl =
            business?.logo_url || null;


        const logoFile =
            $('logoFile').files[0];


        if (logoFile) {

            $('bmsg').textContent =
                'Uploading logo...';

            logoUrl =
                await uploadImage(
                    logoFile,
                    'logos'
                );
        }


        const payload = {

            owner_id: user.id,

            name,

            slug,

            tagline:
                $('tagline').value.trim(),

            phone:
                $('phone').value.trim(),

            email:
                $('bemail').value.trim(),

            address:
                $('address').value.trim(),

            logo_url:
                logoUrl
        };


        let r;


        if (business) {

            r =
                await sb
                    .from('businesses')
                    .update(payload)
                    .eq('id', business.id)
                    .select()
                    .single();

        } else {

            r =
                await sb
                    .from('businesses')
                    .insert(payload)
                    .select()
                    .single();
        }


        if (r.error)
            throw r.error;


        business = r.data;


        $('bmsg').textContent =
            '✅ Business saved successfully!';


        fillBusiness();

    } catch (e) {

        $('bmsg').textContent =
            '❌ ' + e.message;
    }
}


$('saveBusiness').onclick =
    saveBusiness;


/* LOGO PREVIEW */

$('logoFile').addEventListener(
    'change',
    () => {

        const file =
            $('logoFile').files[0];

        if (!file) return;

        $('logoPreview').src =
            URL.createObjectURL(file);

        $('logoPreviewBox')
            .classList
            .remove('hidden');

    }
);


/* COPY URL */

$('copyUrl').onclick =
    async () => {

        await navigator.clipboard.writeText(
            $('publicUrl').value
        );

        $('copyUrl').textContent =
            '✅ Copied!';

        setTimeout(() => {

            $('copyUrl').textContent =
                '📋 Copy URL';

        }, 1500);

    };


/* OPEN PUBLIC SITE */

$('openSite').onclick = () => {

    if (!business) {

        alert(
            'Please create your business first.'
        );

        return;
    }


    window.open(
        'site.html?slug=' +
        encodeURIComponent(business.slug),
        '_blank'
    );
};


/* PRODUCT IMAGE PREVIEW */

$('pimage').addEventListener(
    'change',
    () => {

        const file =
            $('pimage').files[0];

        if (!file) return;

        $('productPreview').src =
            URL.createObjectURL(file);

        $('productPreview')
            .classList
            .remove('hidden');

    }
);


/* LOAD PRODUCTS */

async function loadProducts() {

    if (!business) {

        $('productList').innerHTML =
            '<div class="empty">Save business first.</div>';

        return;
    }


    const { data, error } =
        await sb
            .from('products')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', {
                ascending: false
            });


    if (error) {

        $('productList').textContent =
            error.message;

        return;
    }


    $('productList').innerHTML =
        (data || []).map(x => `

        <div class="card item">

        ${
            x.image_url

            ? `<img class="product-image"
                 src="${esc(x.image_url)}">`

            : ''
        }

        <h3>${esc(x.name)}</h3>

        <p class="small">
        ${esc(x.description || '')}
        </p>

        <div class="price">
        ₹${Number(
            x.price || 0
        ).toLocaleString('en-IN')}
        </div>

        <button
        class="btn danger"
        onclick="delProduct('${x.id}')">

        Delete

        </button>

        </div>

        `).join('')

        ||

        '<div class="empty">No products added yet.</div>';
}


/* ADD PRODUCT */

async function addProduct() {

    try {

        if (!business) {

            $('pmsg').textContent =
                'Save business first.';

            return;
        }


        const name =
            $('pname').value.trim();


        if (!name) {

            $('pmsg').textContent =
                'Enter product name.';

            return;
        }


        $('pmsg').textContent =
            'Uploading product...';


        let imageUrl = null;


        const imageFile =
            $('pimage').files[0];


        if (imageFile) {

            imageUrl =
                await uploadImage(
                    imageFile,
                    'products'
                );
        }


        const { error } =
            await sb
                .from('products')
                .insert({

                    business_id:
                        business.id,

                    name,

                    description:
                        $('pdesc').value.trim(),

                    price:
                        Number(
                            $('pprice').value || 0
                        ),

                    image_url:
                        imageUrl,

                    active: true
                });


        if (error)
            throw error;


        $('pmsg').textContent =
            '✅ Product added successfully!';


        $('pname').value = '';

        $('pdesc').value = '';

        $('pprice').value = '';

        $('pimage').value = '';


        $('productPreview')
            .classList
            .add('hidden');


        await loadProducts();

    } catch (e) {

        $('pmsg').textContent =
            '❌ ' + e.message;
    }
}


$('addProduct').onclick =
    addProduct;


/* DELETE PRODUCT */

window.delProduct =
    async id => {

        if (!confirm(
            'Delete this product?'
        )) return;


        await sb
            .from('products')
            .delete()
            .eq('id', id);


        loadProducts();
    };


/* SERVICES */

async function loadServices() {

    if (!business) {

        $('serviceList').innerHTML =
            '<div class="empty">Save business first.</div>';

        return;
    }


    const { data, error } =
        await sb
            .from('services')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', {
                ascending: false
            });


    if (error) {

        $('serviceList').textContent =
            error.message;

        return;
    }


    $('serviceList').innerHTML =
        (data || []).map(x => `

        <div class="card item">

        <h3>🛠️ ${esc(x.name)}</h3>

        <p class="small">
        ${esc(x.description || '')}
        </p>

        <div class="price">
        ₹${Number(
            x.price || 0
        ).toLocaleString('en-IN')}
        </div>

        <button
        class="btn danger"
        onclick="delService('${x.id}')">

        Delete

        </button>

        </div>

        `).join('')

        ||

        '<div class="empty">No services added yet.</div>';
}


async function addService() {

    if (!business) {

        $('smsg').textContent =
            'Save business first.';

        return;
    }


    const name =
        $('sname').value.trim();


    if (!name) {

        $('smsg').textContent =
            'Enter service name.';

        return;
    }


    const { error } =
        await sb
            .from('services')
            .insert({

                business_id: business.id,

                name,

                description:
                    $('sdesc').value.trim(),

                price:
                    Number(
                        $('sprice').value || 0
                    ),

                active: true
            });


    if (error) {

        $('smsg').textContent =
            error.message;

        return;
    }


    $('smsg').textContent =
        '✅ Service added successfully!';


    $('sname').value = '';

    $('sdesc').value = '';

    $('sprice').value = '';


    loadServices();
}


$('addService').onclick =
    addService;


window.delService =
    async id => {

        await sb
            .from('services')
            .delete()
            .eq('id', id);

        loadServices();
    };


/* REQUESTS */

async function loadRequests() {

    if (!business) {

        $('requestList').innerHTML =
            '<div class="empty">Save business first.</div>';

        return;
    }


    const { data, error } =
        await sb
            .from('requests')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', {
                ascending: false
            });


    if (error) {

        $('requestList').textContent =
            error.message;

        return;
    }


    $('requestList').innerHTML =
        (data || []).map(x => `

        <div class="card">

        <h3>
        ${esc(x.type || 'Request')}
        :
        ${esc(x.item_name || 'General')}
        </h3>

        <p>

        <b>
        ${esc(x.customer_name || 'Customer')}
        </b>

        • ${esc(x.customer_phone || '')}

        </p>

        <p class="small">
        ${esc(x.note || '')}
        </p>

        </div>

        `).join('')

        ||

        '<div class="empty">No orders or bookings yet.</div>';
}


/* LOGOUT */

$('logout').onclick =
    async () => {

        await sb.auth.signOut();

        location.href = 'index.html';
    };


init();
