const $ = (id) => document.getElementById(id);

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

let business = null;


// =============================================
// LOAD BUSINESS
// =============================================

async function loadSite() {

    try {

        if (!slug) {
            throw new Error("Business link missing");
        }


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


        // Basic details

        if ($("brand")) $("brand").textContent = business.name;
        if ($("name")) $("name").textContent = business.name;

        if ($("tag")) {
            $("tag").textContent =
                business.tagline || "";
        }

        if ($("contact")) {
            $("contact").textContent =
                business.phone
                    ? "📞 " + business.phone
                    : "";
        }

        if ($("addr")) {
            $("addr").textContent =
                business.address
                    ? "📍 " + business.address
                    : "";
        }


        // Logo

        if (
            business.logo_url &&
            $("heroLogo")
        ) {

            $("heroLogo").src =
                business.logo_url;

            $("heroLogo")
                .classList
                .remove("hidden");
        }


        // Customer Login

        if ($("customerLogin")) {

            $("customerLogin").onclick =
                function () {

                    window.location.href =
                        "customer.html?slug=" +
                        encodeURIComponent(slug);
                };
        }


        await loadProducts();
        await loadServices();


        if ($("loading")) {
            $("loading").classList.add("hidden");
        }

        if ($("app")) {
            $("app").classList.remove("hidden");
        }

    }

    catch (error) {

        console.error(error);

        if ($("loading")) {

            $("loading").innerHTML =
                "<h2>❌ " +
                error.message +
                "</h2>";
        }
    }
}


// =============================================
// LOAD PRODUCTS
// =============================================

async function loadProducts() {

    if (!$("plist")) return;

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
        "";


    data.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "card";


        if (product.image_url) {

            const image =
                document.createElement("img");

            image.src =
                product.image_url;

            image.className =
                "product-image";

            card.appendChild(image);
        }


        const title =
            document.createElement("h3");

        title.textContent =
            product.name;


        const description =
            document.createElement("p");

        description.textContent =
            product.description || "";


        const price =
            document.createElement("div");

        price.className =
            "price";

        price.textContent =
            "₹" + (product.price || 0);


        const button =
            document.createElement("button");

        button.className =
            "btn orange";

        button.textContent =
            "🛒 Order Now";


        button.addEventListener(
            "click",
            function () {

                goToCustomer(
                    "order",
                    product.name
                );
            }
        );


        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(price);
        card.appendChild(button);

        $("plist").appendChild(card);
    });
}


// =============================================
// LOAD SERVICES
// =============================================

async function loadServices() {

    if (!$("slist")) return;

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
        "";


    data.forEach(service => {

        const card =
            document.createElement("div");

        card.className =
            "card";


        const title =
            document.createElement("h3");

        title.textContent =
            service.name;


        const description =
            document.createElement("p");

        description.textContent =
            service.description || "";


        const price =
            document.createElement("div");

        price.className =
            "price";

        price.textContent =
            "₹" + (service.price || 0);


        const button =
            document.createElement("button");

        button.className =
            "btn orange";

        button.textContent =
            "📅 Book Appointment";


        button.addEventListener(
            "click",
            function () {

                goToCustomer(
                    "booking",
                    service.name
                );
            }
        );


        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(price);
        card.appendChild(button);

        $("slist").appendChild(card);
    });
}


// =============================================
// GO TO CUSTOMER
// =============================================

function goToCustomer(type, item) {

    const url =
        "customer.html?slug=" +
        encodeURIComponent(slug) +
        "&type=" +
        encodeURIComponent(type) +
        "&item=" +
        encodeURIComponent(item);


    window.location.href = url;
}


// =============================================
// START
// =============================================

loadSite();
