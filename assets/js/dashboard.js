const $ = id => document.getElementById(id);

let USER = null;
let BUSINESS = null;


const esc = value => {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
};


// ========================================
// MENU
// ========================================

document.querySelectorAll(".menu button[data-panel]")
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(".menu button[data-panel]")
                .forEach(item => {
                    item.classList.remove("active");
                });


            button.classList.add("active");


            document
                .querySelectorAll(".dash-panel")
                .forEach(panel => {
                    panel.classList.remove("active");
                });


            $(button.dataset.panel)
                .classList.add("active");


            $("pageTitle").textContent =
                button.textContent
                    .replace(/^[^ ]+ /, "")
                    .trim();

        };

    });


// ========================================
// INIT
// ========================================

async function init() {

    const {
        data: { user }
    } = await sb.auth.getUser();


    if (!user) {

        location.href = "login.html";
        return;

    }


    USER = user;


    $("ownerInfo").innerHTML = `
        <b>${esc(
            user.user_metadata?.name ||
            "Business Owner"
        )}</b>
        <br>
        ${esc(user.email)}
    `;


    await loadBusiness();

    await loadAll();

}


// ========================================
// LOAD BUSINESS
// ========================================

async function loadBusiness() {

    const { data, error } = await sb
        .from("businesses")
        .select("*")
        .eq("owner_id", USER.id)
        .maybeSingle();


    if (error) {

        console.error(error);

    }


    BUSINESS = data || null;


    if (!BUSINESS) {

        $("publicBox").classList.add("hidden");

        return;

    }


    $("bName").value =
        BUSINESS.name || "";

    $("bSlug").value =
        BUSINESS.slug || "";

    $("bPhone").value =
        BUSINESS.phone || "";

    $("bLogo").value =
        BUSINESS.logo_url || "";

    $("bTagline").value =
        BUSINESS.tagline || "";

    $("bAddress").value =
        BUSINESS.address || "";


    // PUBLIC URL

    const publicURL =
        window.location.origin +
        "/site.html?slug=" +
        encodeURIComponent(BUSINESS.slug);


    $("publicBox")
        .classList.remove("hidden");


    $("publicUrl").value =
        publicURL;


    $("publicLink").href =
        publicURL;

}


// ========================================
// COPY PUBLIC URL
// ========================================

$("copyPublicUrl").onclick = async () => {

    if (!BUSINESS) {

        $("copyMsg").textContent =
            "⚠️ Please save your business profile first.";

        return;

    }


    const url = $("publicUrl").value;


    try {

        await navigator.clipboard.writeText(url);

        $("copyMsg").textContent =
            "✅ Public URL copied successfully!";

    } catch (error) {

        $("publicUrl").select();

        document.execCommand("copy");

        $("copyMsg").textContent =
            "✅ Public URL copied successfully!";

    }


    setTimeout(() => {

        $("copyMsg").textContent = "";

    }, 3000);

};


// ========================================
// LOAD ALL
// ========================================

async function loadAll() {

    await loadProducts();

    await loadServices();

    await loadRequests();


    $("statBusiness").textContent =
        BUSINESS ? 1 : 0;

}


// ========================================
// SAVE BUSINESS
// ========================================

$("saveBusiness").onclick = async () => {

    const name =
        $("bName").value.trim();


    const slug =
        $("bSlug")
            .value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");


    if (!name || !slug) {

        $("businessMsg").textContent =
            "⚠️ Business name and Public URL name are required.";

        return;

    }


    const row = {

        owner_id: USER.id,

        name: name,

        slug: slug,

        phone:
            $("bPhone").value.trim(),

        logo_url:
            $("bLogo").value.trim(),

        tagline:
            $("bTagline").value.trim(),

        address:
            $("bAddress").value.trim()

    };


    let result;


    if (BUSINESS) {

        result = await sb
            .from("businesses")
            .update(row)
            .eq("id", BUSINESS.id);

    } else {

        result = await sb
            .from("businesses")
            .insert(row);

    }


    if (result.error) {

        $("businessMsg").textContent =
            "❌ " + result.error.message;

        return;

    }


    $("businessMsg").textContent =
        "✅ Business profile saved successfully!";


    await loadBusiness();

    await loadAll();

};


// ========================================
// ADD PRODUCT
// ========================================

$("addProduct").onclick = async () => {

    if (!BUSINESS) {

        $("productMsg").textContent =
            "⚠️ Save your business profile first.";

        return;

    }


    const name =
        $("pName").value.trim();


    if (!name) {

        $("productMsg").textContent =
            "⚠️ Enter product name.";

        return;

    }


    const { error } = await sb
        .from("products")
        .insert({

            business_id: BUSINESS.id,

            name: name,

            price:
                Number($("pPrice").value) || 0,

            description:
                $("pDesc").value.trim(),

            image_url:
                $("pImage").value.trim(),

            active: true

        });


    if (error) {

        $("productMsg").textContent =
            "❌ " + error.message;

        return;

    }


    $("productMsg").textContent =
        "✅ Product added successfully!";


    [
        "pName",
        "pPrice",
        "pDesc",
        "pImage"
    ].forEach(id => {
        $(id).value = "";
    });


    await loadProducts();

};


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    if (!BUSINESS) {

        $("productList").innerHTML =
            '<div class="empty">Save your business first</div>';

        $("statProducts").textContent = "0";

        return;

    }


    const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("business_id", BUSINESS.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        $("productList").innerHTML =
            `<div class="empty">
                ${esc(error.message)}
            </div>`;

        return;

    }


    $("statProducts").textContent =
        (data || []).length;


    $("productList").innerHTML =
        (data || [])
            .map(product => `

                <div class="item-card">

                    ${
                        product.image_url
                            ? `
                                <img
                                    class="product-img"
                                    src="${esc(product.image_url)}"
                                    alt="${esc(product.name)}"
                                >
                              `
                            : `
                                <div class="product-img"></div>
                              `
                    }

                    <h3>
                        ${esc(product.name)}
                    </h3>

                    <p class="muted">
                        ${esc(product.description || "")}
                    </p>

                    <b>
                        ₹${esc(product.price)}
                    </b>

                    <div class="item-actions">

                        <button
                            class="btn btn-red btn-sm"
                            onclick="delProduct('${product.id}')"
                        >
                            🗑 Delete
                        </button>

                    </div>

                </div>

            `)
            .join("")


        ||

        '<div class="empty">No products yet</div>';

}


// ========================================
// DELETE PRODUCT
// ========================================

window.delProduct = async id => {

    if (!confirm("Delete this product?")) {
        return;
    }


    const { error } = await sb
        .from("products")
        .delete()
        .eq("id", id);


    if (error) {

        alert(error.message);
        return;

    }


    await loadProducts();

};


// ========================================
// ADD SERVICE
// ========================================

$("addService").onclick = async () => {

    if (!BUSINESS) {

        $("serviceMsg").textContent =
            "⚠️ Save your business profile first.";

        return;

    }


    const name =
        $("sName").value.trim();


    if (!name) {

        $("serviceMsg").textContent =
            "⚠️ Enter service name.";

        return;

    }


    const { error } = await sb
        .from("services")
        .insert({

            business_id: BUSINESS.id,

            name: name,

            price:
                Number($("sPrice").value) || 0,

            description:
                $("sDesc").value.trim(),

            active: true

        });


    if (error) {

        $("serviceMsg").textContent =
            "❌ " + error.message;

        return;

    }


    $("serviceMsg").textContent =
        "✅ Service added successfully!";


    [
        "sName",
        "sPrice",
        "sDesc"
    ].forEach(id => {
        $(id).value = "";
    });


    await loadServices();

};


// ========================================
// LOAD SERVICES
// ========================================

async function loadServices() {

    if (!BUSINESS) {

        $("serviceList").innerHTML =
            '<div class="empty">Save your business first</div>';

        $("statServices").textContent = "0";

        return;

    }


    const { data, error } = await sb
        .from("services")
        .select("*")
        .eq("business_id", BUSINESS.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        $("serviceList").innerHTML =
            `<div class="empty">
                ${esc(error.message)}
            </div>`;

        return;

    }


    $("statServices").textContent =
        (data || []).length;


    $("serviceList").innerHTML =
        (data || [])
            .map(service => `

                <div class="item-card">

                    <div class="feature-icon">
                        📅
                    </div>

                    <h3>
                        ${esc(service.name)}
                    </h3>

                    <p class="muted">
                        ${esc(service.description || "")}
                    </p>

                    <b>
                        ₹${esc(service.price)}
                    </b>

                    <div class="item-actions">

                        <button
                            class="btn btn-red btn-sm"
                            onclick="delService('${service.id}')"
                        >
                            🗑 Delete
                        </button>

                    </div>

                </div>

            `)
            .join("")


        ||

        '<div class="empty">No services yet</div>';

}


// ========================================
// DELETE SERVICE
// ========================================

window.delService = async id => {

    if (!confirm("Delete this service?")) {
        return;
    }


    const { error } = await sb
        .from("services")
        .delete()
        .eq("id", id);


    if (error) {

        alert(error.message);
        return;

    }


    await loadServices();

};


// ========================================
// LOAD ORDERS & BOOKINGS
// ========================================

async function loadRequests() {

    if (!BUSINESS) {

        $("requestList").innerHTML =
            '<div class="empty">Save your business first</div>';

        $("statRequests").textContent = "0";

        return;

    }


    const { data, error } = await sb
        .from("requests")
        .select("*")
        .eq("business_id", BUSINESS.id)
        .order("created_at", {
            ascending: false
        });


    if (error) {

        $("requestList").innerHTML =
            `<div class="empty">
                ❌ ${esc(error.message)}
            </div>`;

        return;

    }


    $("statRequests").textContent =
        (data || []).length;


    $("requestList").innerHTML =
        (data || [])
            .map(request => `

                <div class="request-card">

                    <span class="status">
                        ${esc(request.status || "new")}
                    </span>


                    <h3>

                        ${
                            request.type === "booking"
                                ? "📅 Service Booking"
                                : "🛒 Product Order"
                        }

                    </h3>


                    <b>
                        ${esc(request.item_name)}
                    </b>


                    <p>

                        👤 ${esc(request.customer_name)}

                        <br>

                        📞 ${esc(
                            request.customer_phone || "-"
                        )}

                    </p>


                    <p class="muted">

                        ${esc(request.note || "")}

                    </p>


                    <div class="item-actions">

                        <button
                            class="btn btn-green btn-sm"
                            onclick="setStatus(
                                '${request.id}',
                                'accepted'
                            )"
                        >
                            ✓ Accept
                        </button>


                        <button
                            class="btn btn-red btn-sm"
                            onclick="setStatus(
                                '${request.id}',
                                'rejected'
                            )"
                        >
                            ✕ Reject
                        </button>


                        <button
                            class="btn btn-blue btn-sm"
                            onclick="setStatus(
                                '${request.id}',
                                'processing'
                            )"
                        >
                            📦 Processing
                        </button>


                        <button
                            class="btn btn-light btn-sm"
                            onclick="setStatus(
                                '${request.id}',
                                'out_for_delivery'
                            )"
                        >
                            🚚 Out for Delivery
                        </button>


                        <button
                            class="btn btn-dark btn-sm"
                            onclick="setStatus(
                                '${request.id}',
                                'delivered'
                            )"
                        >
                            📦 Delivered
                        </button>


                        <button
                            class="btn btn-green btn-sm"
                            onclick="setStatus(
                                '${request.id}',
                                'completed'
                            )"
                        >
                            ✓ Completed
                        </button>

                    </div>

                </div>

            `)
            .join("")


        ||

        '<div class="empty">No orders or bookings yet</div>';

}


// ========================================
// UPDATE REQUEST STATUS
// ========================================

window.setStatus = async (id, status) => {

    const { error } = await sb
        .from("requests")
        .update({
            status: status
        })
        .eq("id", id);


    if (error) {

        alert(
            "❌ " + error.message
        );

        return;

    }


    await loadRequests();

};


// ========================================
// LOGOUT
// ========================================

$("logoutBtn").onclick = async () => {

    await sb.auth.signOut();

    location.href = "index.html";

};


// ========================================
// START APP
// ========================================

init();
