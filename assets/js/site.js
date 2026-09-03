const sb = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const slug =
    new URLSearchParams(
        location.search
    ).get('slug');


const $ =
    id => document.getElementById(id);


function esc(s='') {

    return String(s).replace(/[&<>"']/g, c => ({

        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'

    }[c]));
}


function customer(type, item) {

    location.href =
        'customer.html?slug=' +
        encodeURIComponent(slug) +
        '&type=' +
        encodeURIComponent(type) +
        '&item=' +
        encodeURIComponent(item);
}


async function init() {

    if (!slug) {

        $('loading').innerHTML = `
        <h2>Business website not found</h2>
        <p>Create a business first.</p>
        `;

        return;
    }


    const r =
        await sb
            .from('businesses')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();


    if (r.error || !r.data) {

        $('loading').innerHTML =
            '<h2>Business website not found</h2>';

        return;
    }


    const b = r.data;


    document.title = b.name;


    $('brand').textContent = b.name;

    $('name').textContent = b.name;

    $('tag').textContent =
        b.tagline || '';


    $('contact').textContent =
        [b.phone, b.email]
            .filter(Boolean)
            .join(' • ');


    $('addr').textContent =
        b.address ||
        'Address not provided';


    /* LOGO */

    if (b.logo_url) {

        $('businessLogo').src =
            b.logo_url;

        $('heroLogo').src =
            b.logo_url;


        $('businessLogo')
            .classList
            .remove('hidden');


        $('heroLogo')
            .classList
            .remove('hidden');
    }


    $('customerLogin').onclick =
        () =>
            customer(
                'general',
                'General Request'
            );


    const [p, s] =
        await Promise.all([

            sb
                .from('products')
                .select('*')
                .eq('business_id', b.id)
                .eq('active', true),

            sb
                .from('services')
                .select('*')
                .eq('business_id', b.id)
                .eq('active', true)

        ]);


    /* PRODUCTS */

    $('plist').innerHTML =
        (p.data || []).map(x => `

        <div class="card item">

        ${
            x.image_url

            ? `
            <img
            class="product-image"
            src="${esc(x.image_url)}"
            alt="${esc(x.name)}"
            >
            `

            : ''
        }


        <h3>
        ${esc(x.name)}
        </h3>


        <p class="small">
        ${esc(x.description || '')}
        </p>


        <div class="price">

        ₹${Number(
            x.price || 0
        ).toLocaleString('en-IN')}

        </div>


        <button
        class="btn orange"
        onclick="customer(
            'order',
            ${JSON.stringify(x.name)}
        )">

        🛒 Order Now

        </button>

        </div>

        `).join('')

        ||

        '<div class="empty">No products available.</div>';


    /* SERVICES */

    $('slist').innerHTML =
        (s.data || []).map(x => `

        <div class="card item">

        <h3>
        🛠️ ${esc(x.name)}
        </h3>


        <p class="small">
        ${esc(x.description || '')}
        </p>


        <div class="price">

        ₹${Number(
            x.price || 0
        ).toLocaleString('en-IN')}

        </div>


        <button
        class="btn orange"
        onclick="customer(
            'booking',
            ${JSON.stringify(x.name)}
        )">

        📅 Book Appointment

        </button>

        </div>

        `).join('')

        ||

        '<div class="empty">No services available.</div>';


    $('loading')
        .classList
        .add('hidden');


    $('app')
        .classList
        .remove('hidden');
}


window.customer = customer;


init();
