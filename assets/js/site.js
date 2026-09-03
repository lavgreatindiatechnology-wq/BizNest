const params = new URLSearchParams(window.location.search);

const slug = params.get("slug");

if (!slug) {
    document.getElementById("loading").innerHTML =
        "<h2>❌ Business URL missing</h2>";
    throw new Error("Business slug missing");
}

const $ = (id) => document.getElementById(id);

let business = null;


// =========================================
// LOAD BUSINESS WEBSITE
// =========================================

async function loadSite() {

    try {

        const { data, error } = await sb
            .from("businesses")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            throw new Error("Business not found");
        }

        business = data;

        document.title = business.name + " | BizNest";

        $("brand").textContent = business.name;

        $("name").textContent = business.name;

        $("tag").textContent =
            business.tagline || "";

        $("contact").textContent =
            business.phone
                ? "📞 " + business.phone
                : "";

        $("addr").textContent =
            business.address
                ? "📍 " + business.address
                : "";


        // LOGO

        if (business.logo_url) {

            $("heroLogo").src =
                business.logo_url;

            $("heroLogo")
                .classList
                .remove("hidden");
        }


        // CUSTOMER LOGIN BUTTON

        $("customerLogin").onclick = function () {

            window.location.href =
                "customer.html?slug=" +
                encodeURIComponent(slug);
        };


        await loadProducts();

        await loadServices();


        $("loading").classList.add("hidden");

        $("app").classList.remove("hidden");

    }

    catch (error) {

        console.error(error);

        $("loading").innerHTML =
            "<h2>❌ " +
            error.message +
            "</h2>";
    }
}


// =========================================
// LOAD PRODUCTS
// =========================================

async function loadProducts() {

    const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("business_id", business.id)
        .eq("active", true)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        $("plist").innerHTML =
            "❌ " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        $("plist").innerHTML =
            "<p>No products available.</p>";

        return;
    }


    $("plist").innerHTML =
        data.map(product => `

            <div class="card">

                ${
                    product.image_url
                        ? `
                        <img
                            src="${product.image_url}"
                            class="product-image"
                            alt="${product.name}"
                        >
                        `
                        : ""
                }

                <h3>${product.name}</h3>

                <p>
                    ${product.description || ""}
                </p>

                <div class="price">
                    ₹${product.price || 0}
                </div>

                <button
                    class="btn orange"
                    onclick="orderProduct('${product.name.replace(/'/g, "\\'")}')"
                >
                    🛒 Order Now
                </button>

            </div>

        `).join("");
}


// =========================================
// LOAD SERVICES
// =========================================

async function loadServices() {

    const { data, error } = await sb
        .from("services")
        .select("*")
        .eq("business_id", business.id)
        .eq("active", true)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        $("slist").innerHTML =
            "❌ " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        $("slist").innerHTML =
            "<p>No services available.</p>";

        return;
    }


    $("slist").innerHTML =
        data.map(service => `

            <div class="card">

                <h3>${service.name}</h3>

                <p>
                    ${service.description || ""}
                </p>

                <div class="price">
                    ₹${service.price || 0}
                </div>

                <button
                    class="btn orange"
                    onclick="bookService('${service.name.replace(/'/g, "\\'")}')"
                >
                    📅 Book Appointment
                </button>

            </div>

        `).join("");
}


// =========================================
// ORDER PRODUCT
// =========================================

window.orderProduct = function (productName) {

    window.location.href =
        "customer.html?slug=" +
        encodeURIComponent(slug) +
        "&type=order&item=" +
        encodeURIComponent(productName);
};


// =========================================
// BOOK SERVICE
// =========================================

window.bookService = function (serviceName) {

    window.location.href =
        "customer.html?slug=" +
        encodeURIComponent(slug) +
        "&type=booking&item=" +
        encodeURIComponent(serviceName);
};


// =========================================
// START
// =========================================

loadSite();
