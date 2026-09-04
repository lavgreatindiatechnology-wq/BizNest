const $ = x => document.getElementById(x);

let USER = null;
let BUSINESS = null;

const esc = v => {
    const d = document.createElement("div");
    d.textContent = v ?? "";
    return d.innerHTML;
};


// ==========================================
// DASHBOARD MENU
// ==========================================

document.querySelectorAll(".menu button[data-panel]").forEach(b => {

    b.onclick = () => {

        document
            .querySelectorAll(".menu button[data-panel]")
            .forEach(x => x.classList.remove("active"));

        b.classList.add("active");


        document
            .querySelectorAll(".dash-panel")
            .forEach(x => x.classList.remove("active"));

        $(b.dataset.panel).classList.add("active");


        $("pageTitle").textContent =
            b.textContent.replace(/^[^ ]+ /, "");

    };

});


// ==========================================
// INIT
// ==========================================

async function init() {

    const {
        data: { user }
    } = await sb.auth.getUser();


    if (!user) {

        location = "login.html";
        return;

    }


    USER = user;


    $("ownerInfo").innerHTML =
        "<b>" +
        esc(user.user_metadata?.name || "Business Owner") +
        "</b><br>" +
        esc(user.email);


    await loadBusiness();

    await loadAll();

}


// ==========================================
// LOAD BUSINESS
// ==========================================

async function loadBusiness() {

    const { data, error } =
        await sb
            .from("businesses")
            .select("*")
            .eq("owner_id", USER.id)
            .maybeSingle();


    if (error) {

        console.error(error);

    }


    BUSINESS = data || null;


    if (BUSINESS) {

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


        $("publicBox")
            .classList.remove("hidden");


        const publicUrl =
            "site.html?slug=" +
            encodeURIComponent(BUSINESS.slug);


        $("publicLink").href =
            publicUrl;

    }

}


// ==========================================
// LOAD EVERYTHING
// ==========================================

async function loadAll() {

    await loadProducts();

    await loadServices();

    await loadRequests();


    $("statBusiness").textContent =
        BUSINESS ? 1 : 0;

}


// ==========================================
// SAVE BUSINESS
// ==========================================

$("saveBusiness").onclick = async () => {

    const name =
        $("bName").value.trim();


    const slug =
        $("bSlug")
            .value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-");


    if (!name || !slug) {

        return $("businessMsg").textContent =
            "⚠️ Business name and public URL name are required";

    }


    const row = {

        owner_id: USER.id,

        name,

        slug,

        phone:
            $("bPhone").value.trim(),

        logo_url:
            $("bLogo").value.trim(),

        tagline:
            $("bTagline").value.trim(),

        address:
            $("bAddress").value.trim()

    };


    let q;


    if (BUSINESS) {

        q = sb
            .from("businesses")
            .update(row)
            .eq("id", BUSINESS.id);

    } else {

        q = sb
            .from("businesses")
            .insert(row);

    }


    const { error } =
        await q;


    if (error) {

        return $("businessMsg").textContent =
            "❌ " + error.message;

    }


    $("businessMsg").textContent =
        "✅ Business profile saved successfully";


    await loadBusiness();

    await loadAll();

};


// ==========================================
// ADD PRODUCT
// ==========================================

$("addProduct").onclick = async () => {

    if (!BUSINESS) {

        return $("productMsg").textContent =
            "⚠️ Save your business profile first";

    }


    const name =
        $("pName").value.trim();


    if (!name) {

        return $("productMsg").textContent =
            "⚠️ Enter product name";

    }


    const { error } =
        await sb
            .from("products")
            .insert({

                business_id:
                    BUSINESS.id,

                name,

                price:
                    Number($("pPrice").value) || 0,

                description:
                    $("pDesc").value.trim(),

                image_url:
                    $("pImage").value.trim(),

                active: true

            });


    $("productMsg").textContent =
        error
            ? "❌ " + error.message
            : "✅ Product added";


    if (!error) {

        [
            "pName",
            "pPrice",
            "pDesc",
            "pImage"
        ].forEach(id => {

            $(id).value = "";

        });


        loadProducts();

    }

};


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    if (!BUSINESS) {

        $("productList").innerHTML =
            '<div class="empty">Save your business first</div>';

        $("statProducts").textContent = "0";

        return;

    }


    const { data, error } =
        await sb
            .from("products")
            .select("*")
            .eq("business_id", BUSINESS.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        return;

    }


    $("statProducts").textContent =
        (data || []).length;


    $("productList").innerHTML =
        (data || [])
            .map(p => `

                <div class="item-card">

                    ${
                        p.image_url
                            ? `
                                <img
                                    class="product-img"
                                    src="${esc(p.image_url)}"
                                    alt="${esc(p.name)}"
                                >
                              `
                            : `
                                <div class="product-img">
                                    📦
                                </div>
                              `
                    }

                    <h3>
                        ${esc(p.name)}
                    </h3>

                    <p class="muted">
                        ${esc(p.description || "")}
                    </p>

                    <b>
                        ₹${esc(p.price)}
                    </b>


                    <div class="item-actions">

                        <button
                            class="btn btn-red btn-sm"
                            onclick="delProduct('${p.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `)
            .join("")

        ||

        '<div class="empty">No products yet</div>';

}


// ==========================================
// DELETE PRODUCT
// ==========================================

window.delProduct = async id => {

    if (!confirm("Delete this product?")) return;


    const { error } =
        await sb
            .from("products")
            .delete()
            .eq("id", id);


    if (error) {

        alert(error.message);

    }


    loadProducts();

};


// ==========================================
// ADD SERVICE
// ==========================================

$("addService").onclick = async () => {

    if (!BUSINESS) {

        return $("serviceMsg").textContent =
            "⚠️ Save your business profile first";

    }


    const name =
        $("sName").value.trim();


    if (!name) {

        return $("serviceMsg").textContent =
            "⚠️ Enter service name";

    }


    const { error } =
        await sb
            .from("services")
            .insert({

                business_id:
                    BUSINESS.id,

                name,

                price:
                    Number($("sPrice").value) || 0,

                description:
                    $("sDesc").value.trim(),

                active: true

            });


    $("serviceMsg").textContent =
        error
            ? "❌ " + error.message
            : "✅ Service added";


    if (!error) {

        [
            "sName",
            "sPrice",
            "sDesc"
        ].forEach(id => {

            $(id).value = "";

        });


        loadServices();

    }

};


// ==========================================
// LOAD SERVICES
// ==========================================

async function loadServices() {

    if (!BUSINESS) {

        $("serviceList").innerHTML =
            '<div class="empty">Save your business first</div>';

        $("statServices").textContent = "0";

        return;

    }


    const { data, error } =
        await sb
            .from("services")
            .select("*")
            .eq("business_id", BUSINESS.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(error);

        return;

    }


    $("statServices").textContent =
        (data || []).length;


    $("serviceList").innerHTML =
        (data || [])
            .map(s => `

                <div class="item-card">

                    <div class="feature-icon">
                        📅
                    </div>

                    <h3>
                        ${esc(s.name)}
                    </h3>

                    <p class="muted">
                        ${esc(s.description || "")}
                    </p>

                    <b>
                        ₹${esc(s.price)}
                    </b>


                    <div class="item-actions">

                        <button
                            class="btn btn-red btn-sm"
                            onclick="delService('${s.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `)
            .join("")

        ||

        '<div class="empty">No services yet</div>';

}


// ==========================================
// DELETE SERVICE
// ==========================================

window.delService = async id => {

    if (!confirm("Delete this service?")) return;


    const { error } =
        await sb
            .from("services")
            .delete()
            .eq("id", id);


    if (error) {

        alert(error.message);

    }


    loadServices();

};


// ==========================================
// LOAD CUSTOMER ORDERS & BOOKINGS
// ==========================================

async function loadRequests() {

    if (!BUSINESS) {

        $("requestList").innerHTML =
            '<div class="empty">Save your business first</div>';

        $("statRequests").textContent = "0";

        return;

    }


    const { data, error } =
        await sb
            .from("requests")
            .select("*")
            .eq("business_id", BUSINESS.id)
            .order("created_at", {
                ascending: false
            });


    $("statRequests").textContent =
        (data || []).length;


    if (error) {

        $("requestList").innerHTML =
            `<div class="empty">
                ❌ ${esc(error.message)}
            </div>`;

        return;

    }


    if (!data || data.length === 0) {

        $("requestList").innerHTML =
            '<div class="empty">No orders or bookings yet</div>';

        return;

    }


    $("requestList").innerHTML =
        data
            .map(r => {


                // ==================================
                // PRODUCT ORDER
                // ==================================

                if (r.type === "order") {

                    return `

                        <div class="request-card">

                            <span class="status">
                                ${esc(r.status)}
                            </span>


                            <h3>
                                🛒 Product Order
                            </h3>


                            ${
                                r.product_image
                                    ? `
                                        <img
                                            src="${esc(r.product_image)}"
                                            alt="${esc(r.item_name)}"
                                            style="
                                                width:100%;
                                                max-height:220px;
                                                object-fit:cover;
                                                border-radius:10px;
                                                margin:10px 0;
                                            "
                                        >
                                      `
                                    : ""
                            }


                            <h3>
                                📦 ${esc(r.item_name)}
                            </h3>


                            ${
                                r.product_description
                                    ? `
                                        <p class="muted">
                                            ${esc(r.product_description)}
                                        </p>
                                      `
                                    : ""
                            }


                            <hr>


                            <p>

                                💰 <b>Product Price:</b>
                                ₹${esc(r.product_price || 0)}

                                <br><br>

                                🔢 <b>Quantity:</b>
                                ${esc(r.quantity || 1)}

                                <br><br>

                                💵 <b>Total Amount:</b>
                                ₹${esc(r.total_amount || 0)}

                            </p>


                            <hr>


                            <h3>
                                👤 Customer Details
                            </h3>


                            <p>

                                👤 <b>Name:</b>
                                ${esc(r.customer_name)}

                                <br>

                                📞 <b>Phone:</b>
                                ${esc(r.customer_phone || "")}

                            </p>


                            <h3>
                                🏠 Delivery Address
                            </h3>


                            <p>

                                ${esc(r.delivery_address || "Address not provided")}

                                <br>

                                🏙️
                                ${esc(r.city || "")}

                                <br>

                                📍
                                ${esc(r.state || "")}

                                <br>

                                📮 Pincode:
                                ${esc(r.pincode || "")}

                            </p>


                            ${
                                r.note
                                    ? `
                                        <div class="notice">

                                            📝 <b>Customer Note:</b>

                                            <br>

                                            ${esc(r.note)}

                                        </div>
                                      `
                                    : ""
                            }


                            <div class="item-actions">

                                <button
                                    class="btn btn-green btn-sm"
                                    onclick="setStatus('${r.id}','accepted')"
                                >
                                    Accept
                                </button>


                                <button
                                    class="btn btn-red btn-sm"
                                    onclick="setStatus('${r.id}','rejected')"
                                >
                                    Reject
                                </button>


                                <button
                                    class="btn btn-blue btn-sm"
                                    onclick="setStatus('${r.id}','processing')"
                                >
                                    Processing
                                </button>


                                <button
                                    class="btn btn-light btn-sm"
                                    onclick="setStatus('${r.id}','out_for_delivery')"
                                >
                                    Out for Delivery
                                </button>


                                <button
                                    class="btn btn-dark btn-sm"
                                    onclick="setStatus('${r.id}','delivered')"
                                >
                                    Delivered
                                </button>

                            </div>


                        </div>

                    `;

                }


                // ==================================
                // SERVICE BOOKING
                // ==================================

                return `

                    <div class="request-card">

                        <span class="status">
                            ${esc(r.status)}
                        </span>


                        <h3>
                            📅 Service Booking
                        </h3>


                        <h3>
                            ${esc(r.item_name)}
                        </h3>


                        <p>

                            👤
                            ${esc(r.customer_name)}

                            <br>

                            📞
                            ${esc(r.customer_phone || "")}

                        </p>


                        ${
                            r.note
                                ? `
                                    <p class="muted">

                                        📝
                                        ${esc(r.note)}

                                    </p>
                                  `
                                : ""
                        }


                        <div class="item-actions">

                            <button
                                class="btn btn-green btn-sm"
                                onclick="setStatus('${r.id}','accepted')"
                            >
                                Accept
                            </button>


                            <button
                                class="btn btn-red btn-sm"
                                onclick="setStatus('${r.id}','rejected')"
                            >
                                Reject
                            </button>


                            <button
                                class="btn btn-blue btn-sm"
                                onclick="setStatus('${r.id}','processing')"
                            >
                                Processing
                            </button>


                            <button
                                class="btn btn-green btn-sm"
                                onclick="setStatus('${r.id}','completed')"
                            >
                                Completed
                            </button>

                        </div>


                    </div>

                `;

            })
            .join("");

}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

window.setStatus = async (id, status) => {

    const { error } =
        await sb
            .from("requests")
            .update({
                status
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


// ==========================================
// LOGOUT
// ==========================================

$("logoutBtn").onclick = async () => {

    await sb.auth.signOut();

    location = "index.html";

};


// ==========================================
// START APP
// ==========================================

init();
