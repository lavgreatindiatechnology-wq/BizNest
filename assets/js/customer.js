const $ = x => document.getElementById(x);

const q = new URLSearchParams(location.search);

const slug = q.get("slug");
const type = q.get("type");
const item = q.get("item");

$("back").href =
    "site.html?slug=" +
    encodeURIComponent(slug || "");


let USER = null;
let BUSINESS = null;
let PRODUCT = null;


// ==========================================
// GET USER
// ==========================================

async function getUser() {

    const {
        data: { user }
    } = await sb.auth.getUser();

    return user;

}


// ==========================================
// LOAD PRODUCT DETAILS
// ==========================================

async function loadProductDetails() {

    if (type === "booking") return;

    if (!slug || !item) return;


    const { data: business, error } =
        await sb
            .from("businesses")
            .select("id,name")
            .eq("slug", slug)
            .maybeSingle();


    if (error || !business) return;


    BUSINESS = business;


    const productName =
        decodeURIComponent(item);


    const { data: product } =
        await sb
            .from("products")
            .select("*")
            .eq("business_id", business.id)
            .eq("name", productName)
            .maybeSingle();


    PRODUCT = product || null;


    if (PRODUCT) {

        if ($("productDetails")) {

            $("productDetails").innerHTML = `

                <div class="product-order-details">

                    ${
                        PRODUCT.image_url
                            ? `
                                <img
                                    src="${PRODUCT.image_url}"
                                    style="
                                        width:100%;
                                        max-height:220px;
                                        object-fit:cover;
                                        border-radius:12px;
                                        margin-bottom:15px;
                                    "
                                >
                              `
                            : ""
                    }

                    <h3>📦 ${PRODUCT.name}</h3>

                    <p>
                        ${PRODUCT.description || ""}
                    </p>

                    <h2>
                        ₹${PRODUCT.price}
                    </h2>

                </div>

            `;

        }


        if ($("quantity")) {

            $("quantity").value = 1;

        }


        updateTotal();

    }

}


// ==========================================
// UPDATE TOTAL
// ==========================================

function updateTotal() {

    if (!PRODUCT) return;

    const quantity =
        Math.max(
            1,
            Number($("quantity").value) || 1
        );


    const total =
        Number(PRODUCT.price) *
        quantity;


    if ($("totalAmount")) {

        $("totalAmount").textContent =
            "₹" + total;

    }

}


// ==========================================
// SHOW CUSTOMER
// ==========================================

async function show() {

    USER = await getUser();


    if (!USER) return;


    $("authBox")
        .classList.add("hidden");


    $("customerBox")
        .classList.remove("hidden");


    $("logoutBtn")
        .classList.remove("hidden");


    const name =
        USER.user_metadata?.name ||
        USER.email.split("@")[0];


    $("welcome").textContent =
        "Welcome, " + name;


    $("cName").value = name;


    if (type === "booking") {

        $("actionTitle").textContent =
            "📅 Book Appointment";


        $("selectedItem").textContent =
            item
                ? "Selected Service: " +
                  decodeURIComponent(item)
                : "Select a service";


        if ($("orderDetailsBox")) {

            $("orderDetailsBox")
                .classList.add("hidden");

        }


        if ($("addressBox")) {

            $("addressBox")
                .classList.add("hidden");

        }

    } else {

        $("actionTitle").textContent =
            "🛒 Place Product Order";


        $("selectedItem").textContent =
            item
                ? "Selected Product: " +
                  decodeURIComponent(item)
                : "Select a product";


        if ($("orderDetailsBox")) {

            $("orderDetailsBox")
                .classList.remove("hidden");

        }


        if ($("addressBox")) {

            $("addressBox")
                .classList.remove("hidden");

        }


        await loadProductDetails();

    }


    await history();

}


// ==========================================
// MESSAGE
// ==========================================

const say = (id, text) => {

    $(id).textContent = text;

};


// ==========================================
// LOGIN
// ==========================================

$("loginBtn").onclick = async () => {

    const {
        error
    } = await sb.auth.signInWithPassword({

        email:
            $("email").value.trim(),

        password:
            $("password").value

    });


    if (error) {

        say(
            "msg",
            "❌ " + error.message
        );

    } else {

        show();

    }

};


// ==========================================
// REGISTER
// ==========================================

$("registerBtn").onclick = async () => {

    const name =
        $("regName").value.trim();

    const email =
        $("email").value.trim();

    const password =
        $("password").value;


    if (!name) {

        return say(
            "msg",
            "⚠️ Enter your name"
        );

    }


    const {
        data,
        error
    } = await sb.auth.signUp({

        email,
        password,

        options: {

            data: {

                name,

                role: "customer"

            }

        }

    });


    if (error) {

        return say(
            "msg",
            "❌ " + error.message
        );

    }


    if (data.session) {

        show();

    } else {

        say(
            "msg",
            "✅ Account created. Please confirm email, then login."
        );

    }

};


// ==========================================
// QUANTITY CHANGE
// ==========================================

if ($("quantity")) {

    $("quantity").oninput =
        updateTotal;

}


// ==========================================
// SUBMIT ORDER / BOOKING
// ==========================================

$("submitRequest").onclick = async () => {

    try {

        if (!USER) {

            throw Error(
                "Please login first"
            );

        }


        if (!slug || !item) {

            throw Error(
                "Please select a product or service first"
            );

        }


        const customer_name =
            $("cName").value.trim();

        const customer_phone =
            $("cPhone").value.trim();


        if (
            !customer_name ||
            !customer_phone
        ) {

            throw Error(
                "Please enter your name and phone number"
            );

        }


        // LOAD BUSINESS

        const {
            data: B,
            error: businessError
        } = await sb
            .from("businesses")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();


        if (businessError || !B) {

            throw Error(
                businessError?.message ||
                "Business not found"
            );

        }


        BUSINESS = B;


        // ==================================
        // PRODUCT ORDER
        // ==================================

        let requestData = {

            business_id:
                BUSINESS.id,

            customer_id:
                USER.id,

            type:
                type === "booking"
                    ? "booking"
                    : "order",

            item_name:
                decodeURIComponent(item),

            customer_name,

            customer_phone,

            note:
                $("note").value.trim(),

            status:
                "pending"

        };


        if (type !== "booking") {

            const address =
                $("cAddress").value.trim();

            const city =
                $("cCity").value.trim();

            const state =
                $("cState").value.trim();

            const pincode =
                $("cPincode").value.trim();


            if (
                !address ||
                !city ||
                !state ||
                !pincode
            ) {

                throw Error(
                    "Please enter complete delivery address"
                );

            }


            const quantity =
                Math.max(
                    1,
                    Number($("quantity").value) || 1
                );


            if (!PRODUCT) {

                await loadProductDetails();

            }


            if (!PRODUCT) {

                throw Error(
                    "Product details not found"
                );

            }


            const total =
                Number(PRODUCT.price) *
                quantity;


            // IMPORTANT:
            // These columns must exist in Supabase

            requestData.delivery_address =
                address;

            requestData.city =
                city;

            requestData.state =
                state;

            requestData.pincode =
                pincode;

            requestData.quantity =
                quantity;

            requestData.product_price =
                Number(PRODUCT.price);

            requestData.total_amount =
                total;

            requestData.product_description =
                PRODUCT.description || "";

            requestData.product_image =
                PRODUCT.image_url || "";

        }


        $("submitRequest").disabled = true;


        say(
            "requestMsg",
            "Saving your request..."
        );


        const { error } =
            await sb
                .from("requests")
                .insert(requestData);


        if (error) {

            throw Error(error.message);

        }


        say(
            "requestMsg",
            "🎉 Request submitted successfully!"
        );


        $("note").value = "";


        await history();

    }

    catch (e) {

        say(
            "requestMsg",
            "❌ " + e.message
        );

    }

    finally {

        $("submitRequest").disabled = false;

    }

};


// ==========================================
// ORDER HISTORY
// ==========================================

async function history() {

    if (!USER) return;


    const {
        data,
        error
    } = await sb
        .from("requests")
        .select("*")
        .eq("customer_id", USER.id)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        $("history").innerHTML =
            `<div class="notice">
                ❌ ${error.message}
            </div>`;

        return;

    }


    $("history").innerHTML =
        (data || [])
            .map(r => `

                <div class="history-item">

                    <b>

                        ${
                            r.type === "booking"
                                ? "📅 Booking"
                                : "🛒 Order"
                        }

                        : ${r.item_name}

                    </b>

                    ${
                        r.type === "order"
                            ? `

                                <br>

                                💰 Total:
                                ₹${r.total_amount || 0}

                                <br>

                                🔢 Quantity:
                                ${r.quantity || 1}

                              `
                            : ""
                    }

                    <br>

                    <span class="status">
                        ${r.status}
                    </span>

                    <br>

                    <small class="muted">

                        ${new Date(
                            r.created_at
                        ).toLocaleString()}

                    </small>

                </div>

            `)
            .join("")

        ||

        '<div class="empty">No order history yet</div>';

}


// ==========================================
// LOGOUT
// ==========================================

$("logoutBtn").onclick = async () => {

    await sb.auth.signOut();


    location =
        "site.html?slug=" +
        encodeURIComponent(slug || "");

};


// ==========================================
// START
// ==========================================

show();
