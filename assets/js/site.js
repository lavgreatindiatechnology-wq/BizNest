const sb = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const slug =
    new URLSearchParams(location.search)
        .get("slug");

const $ = (id) =>
    document.getElementById(id);


/* -------------------------
   ESCAPE HTML
------------------------- */

function esc(value = "") {

    return String(value).replace(
        /[&<>"']/g,
        function(char) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];

        }
    );
}


/* -------------------------
   OPEN CUSTOMER PAGE
------------------------- */

function openCustomer(type, item) {

    location.href =
        "customer.html?slug=" +
        encodeURIComponent(slug) +
        "&type=" +
        encodeURIComponent(type) +
        "&item=" +
        encodeURIComponent(item);
}


/* -------------------------
   GLOBAL FUNCTIONS
------------------------- */

window.orderProduct =
    function(productName) {

        openCustomer(
            "order",
            productName
        );
    };


window.bookService =
    function(serviceName) {

        openCustomer(
            "booking",
            serviceName
        );
    };


/* -------------------------
   CUSTOMER LOGIN STATUS
------------------------- */

async function updateCustomerLogin() {

    const {
        data: { session }
    } = await sb.auth.getSession();


    const button =
        $("customerLogin");


    if (!button)
        return;


    if (session?.user) {

        const user =
            session.user;


        const name =
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Customer";


        /* SHOW CUSTOMER NAME */

        button.textContent =
            "👤 " + name;


        button.title =
            "Logged in as " + name;


        button.onclick =
            async () => {

                const logout =
                    confirm(
                        "Logged in as " +
                        name +
                        "\n\nDo you want to logout?"
                    );


                if (logout) {

                    await sb.auth.signOut();

                    location.reload();
                }
            };


    } else {

        button.textContent =
            "Customer Login";


        button.title =
            "Login or Create Customer Account";


        button.onclick =
            () => {

                openCustomer(
                    "general",
                    "General Request"
                );
            };
    }
}


/* -------------------------
   LOAD BUSINESS
------------------------- */

async function init() {

    if (!slug) {

        $("loading").innerHTML =
            "<h2>Business website not found</h2>";

        return;
    }


    /* CUSTOMER LOGIN */

    await updateCustomerLogin();


    /* BUSINESS DATA */

    const {
        data: business,
        error: businessError
    } = await sb
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();


    if (businessError || !business) {

        $("loading").innerHTML =
            "<h2>Business website not found</h2>";

        return;
    }


    /* PAGE DATA */

    document.title =
        business.name;


    $("brand").textContent =
        business.name;


    $("name").textContent =
        business.name;


    $("tag").textContent =
        business.tagline || "";


    $("contact").textContent =
        [
            business.phone,
            business.email
        ]
        .filter(Boolean)
        .join(" • ");


    $("addr").textContent =
        business.address ||
        "Address not provided";


    /* -------------------------
       LOGO
    ------------------------- */

    if (business.logo_url) {

        const topLogo =
            $("businessLogo");

        const heroLogo =
            $("heroLogo");


        if (topLogo) {

            topLogo.src =
                business.logo_url;

            topLogo.classList.remove(
                "hidden"
            );
        }


        if (heroLogo) {

            heroLogo.src =
                business.logo_url;

            heroLogo.classList.remove(
                "hidden"
            );
        }
    }


    /* -------------------------
       PRODUCTS
    ------------------------- */

    const {
        data: products,
        error: productError
    } = await sb
        .from("products")
        .select("*")
        .eq(
            "business_id",
            business.id
        )
        .eq(
            "active",
            true
        );


    if (productError) {

        console.error(productError);

        $("plist").innerHTML =
            "<div class='empty'>Unable to load products.</div>";

    } else {

        $("plist").innerHTML =
            products && products.length

                ? products.map(product => `

                <div class="card item">

                    ${
                        product.image_url

                        ? `
                        <img
                            class="product-image"
                            src="${esc(product.image_url)}"
                            alt="${esc(product.name)}"
                        >
                        `

                        : ""
                    }

                    <h3>
                        ${esc(product.name)}
                    </h3>

                    <p class="small">
                        ${esc(
                            product.description || ""
                        )}
                    </p>

                    <div class="price">
                        ₹${Number(
                            product.price || 0
                        ).toLocaleString("en-IN")}
                    </div>

                    <button
                        class="btn orange"
                        onclick='orderProduct(${JSON.stringify(product.name)})'
                    >
                        🛒 Order Now
                    </button>

                </div>

                `).join("")

                : "<div class='empty'>No products available.</div>";
    }


    /* -------------------------
       SERVICES
    ------------------------- */

    const {
        data: services,
        error: serviceError
    } = await sb
        .from("services")
        .select("*")
        .eq(
            "business_id",
            business.id
        )
        .eq(
            "active",
            true
        );


    if (serviceError) {

        console.error(serviceError);

        $("slist").innerHTML =
            "<div class='empty'>Unable to load services.</div>";

    } else {

        $("slist").innerHTML =
            services && services.length

                ? services.map(service => `

                <div class="card item">

                    <h3>
                        🛠️ ${esc(service.name)}
                    </h3>

                    <p class="small">
                        ${esc(
                            service.description || ""
                        )}
                    </p>

                    <div class="price">
                        ₹${Number(
                            service.price || 0
                        ).toLocaleString("en-IN")}
                    </div>

                    <button
                        class="btn orange"
                        onclick='bookService(${JSON.stringify(service.name)})'
                    >
                        📅 Book Appointment
                    </button>

                </div>

                `).join("")

                : "<div class='empty'>No services available.</div>";
    }


    /* SHOW WEBSITE */

    $("loading").classList.add(
        "hidden"
    );


    $("app").classList.remove(
        "hidden"
    );
}


/* -------------------------
   AUTH CHANGE
------------------------- */

sb.auth.onAuthStateChange(
    () => {

        updateCustomerLogin();

    }
);


/* START */

init();
