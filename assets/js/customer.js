const $ = (id) => document.getElementById(id);

const params = new URLSearchParams(location.search);

const slug = params.get("slug");
const type = params.get("type") || "general";
const item = params.get("item") || "General Request";

const backUrl = slug
    ? "site.html?slug=" + encodeURIComponent(slug)
    : "index.html";

$("back").href = backUrl;


// ==========================================
// GET CUSTOMER NAME
// ==========================================

function getCustomerName(user) {

    return (
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "Customer"
    );
}


// ==========================================
// LOAD CUSTOMER PROFILE
// ==========================================

async function loadCustomer() {

    const {
        data: { user }
    } = await sb.auth.getUser();


    if (!user) {

        $("authSection").classList.remove("hidden");
        $("requestSection").classList.add("hidden");

        return;
    }


    $("authSection").classList.add("hidden");
    $("requestSection").classList.remove("hidden");


    const customerName = getCustomerName(user);


    $("welcomeCustomer").textContent =
        "👋 Welcome, " + customerName;


    $("cname").value = customerName;


    // ==========================================
    // PRODUCT / SERVICE NAME
    // ==========================================

    if (type === "order") {

        $("requestInfo").innerHTML =
            "🛒 <b>Product:</b> " + item;

    } else if (type === "booking") {

        $("requestInfo").innerHTML =
            "📅 <b>Service:</b> " + item;

    } else {

        $("requestInfo").innerHTML =
            "Please enter your request.";
    }


    await loadHistory();
}


// ==========================================
// CUSTOMER LOGIN
// ==========================================

$("login").addEventListener(
    "click",
    async function () {

        const email =
            $("email").value.trim();

        const password =
            $("password").value;


        if (!email || !password) {

            $("msg").textContent =
                "❌ Email and password required.";

            return;
        }


        const {
            error
        } = await sb.auth.signInWithPassword({

            email: email,

            password: password
        });


        if (error) {

            $("msg").textContent =
                "❌ " + error.message;

            return;
        }


        $("msg").textContent =
            "✅ Login successful!";


        await loadCustomer();

        // अगर Product या Booking है
        // तो सीधे request भेजने की कोशिश करें

        if (
            type === "order" ||
            type === "booking"
        ) {

            setTimeout(() => {

                autoOrderOrBooking();

            }, 500);

        }

    }
);


// ==========================================
// CUSTOMER REGISTER
// ==========================================

$("signup").addEventListener(
    "click",
    async function () {

        const name =
            $("customerName").value.trim();

        const email =
            $("email").value.trim();

        const password =
            $("password").value;


        if (!name) {

            $("msg").textContent =
                "❌ Enter your name.";

            return;
        }


        if (!email) {

            $("msg").textContent =
                "❌ Enter your email.";

            return;
        }


        if (password.length < 6) {

            $("msg").textContent =
                "❌ Password must be at least 6 characters.";

            return;
        }


        const {
            data,
            error
        } = await sb.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {

                    name: name,

                    role: "customer"
                }
            }
        });


        if (error) {

            $("msg").textContent =
                "❌ " + error.message;

            return;
        }


        if (data.session) {

            $("msg").textContent =
                "✅ Account created successfully!";


            await loadCustomer();


            if (
                type === "order" ||
                type === "booking"
            ) {

                setTimeout(() => {

                    autoOrderOrBooking();

                }, 500);

            }

        } else {

            $("msg").textContent =
                "✅ Account created. Please login.";

        }

    }
);


// ==========================================
// GET BUSINESS
// ==========================================

async function getBusiness() {

    const {
        data,
        error
    } = await sb
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();


    if (error) {

        throw error;
    }


    if (!data) {

        throw new Error(
            "Business not found."
        );
    }


    return data;
}


// ==========================================
// CREATE ORDER / BOOKING
// ==========================================

async function createRequest(auto = false) {

    try {

        const {
            data: { user }
        } = await sb.auth.getUser();


        if (!user) {

            throw new Error(
                "Please login first."
            );
        }


        const business =
            await getBusiness();


        const customerName =
            $("cname").value.trim();


        const customerPhone =
            $("cphone").value.trim();


        const note =
            $("note").value.trim();


        // ======================================
        // FIRST TIME PHONE REQUIRED
        // ======================================

        if (!customerName) {

            $("done").textContent =
                "❌ Please enter your name.";

            return false;
        }


        if (!customerPhone) {

            $("done").textContent =
                "📞 Please enter your phone number, then click Confirm.";

            return false;
        }


        // ======================================
        // CHECK DUPLICATE PENDING ORDER
        // ======================================

        const {
            data: existing
        } = await sb
            .from("requests")
            .select("id")
            .eq("business_id", business.id)
            .eq("customer_id", user.id)
            .eq("item_name", item)
            .eq("type", type)
            .eq("status", "pending")
            .maybeSingle();


        if (existing) {

            $("done").textContent =
                "⚠️ This order/booking is already pending.";

            return true;
        }


        // ======================================
        // INSERT REQUEST
        // ======================================

        const {
            error
        } = await sb
            .from("requests")
            .insert({

                business_id:
                    business.id,

                customer_id:
                    user.id,

                type:
                    type,

                item_name:
                    item,

                customer_name:
                    customerName,

                customer_phone:
                    customerPhone,

                note:
                    note,

                status:
                    "pending"
            });


        if (error) {

            throw error;
        }


        if (type === "order") {

            $("done").textContent =
                "🎉 Product order placed successfully!";

        } else if (type === "booking") {

            $("done").textContent =
                "🎉 Appointment booked successfully!";

        } else {

            $("done").textContent =
                "🎉 Request sent successfully!";
        }


        await loadHistory();


        return true;

    } catch (error) {

        console.error(error);

        $("done").textContent =
            "❌ " + error.message;

        return false;
    }
}


// ==========================================
// AUTO ORDER / BOOKING
// ==========================================

async function autoOrderOrBooking() {

    // केवल Product और Service के लिए

    if (
        type !== "order" &&
        type !== "booking"
    ) {

        return;
    }


    const phone =
        $("cphone").value.trim();


    // Phone नहीं है तो form दिखेगा

    if (!phone) {

        if (type === "order") {

            $("done").textContent =
                "📞 अपना Phone Number डालें और Confirm Order दबाएँ.";

        } else {

            $("done").textContent =
                "📞 अपना Phone Number डालें और Confirm Booking दबाएँ.";
        }


        showConfirmButton();

        return;
    }


    // Phone पहले से है तो direct create

    await createRequest(true);
}


// ==========================================
// SHOW CONFIRM BUTTON
// ==========================================

function showConfirmButton() {

    let button =
        $("confirmRequest");


    if (button) return;


    button =
        document.createElement("button");


    button.id =
        "confirmRequest";


    button.className =
        "btn orange";


    if (type === "order") {

        button.textContent =
            "🛒 Confirm Order";

    } else {

        button.textContent =
            "📅 Confirm Booking";
    }


    button.addEventListener(
        "click",
        async function () {

            await createRequest(false);

        }
    );


    $("send")
        .parentNode
        .appendChild(button);
}


// ==========================================
// MANUAL SEND BUTTON
// ==========================================

$("send").addEventListener(
    "click",
    async function () {

        await createRequest(false);

    }
);


// ==========================================
// CUSTOMER HISTORY
// ==========================================

async function loadHistory() {

    const {
        data: { user }
    } = await sb.auth.getUser();


    if (!user) return;


    const {
        data,
        error
    } = await sb
        .from("requests")
        .select("*")
        .eq(
            "customer_id",
            user.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        $("historyList").innerHTML =
            "❌ " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        $("historyList").innerHTML =
            "<p>No orders or bookings yet.</p>";

        return;
    }


    $("historyList").innerHTML =
        data.map(request => {

            const requestIcon =
                request.type === "order"
                    ? "🛒 Product Order"
                    : request.type === "booking"
                        ? "📅 Service Booking"
                        : "📩 Request";


            const status =
                request.status || "pending";


            return `

                <div class="card history-card">

                    <div>

                        <b>
                            ${requestIcon}
                        </b>

                        <br>

                        <strong>
                            ${request.item_name || ""}
                        </strong>

                        <br>

                        <small>
                            📞 ${request.customer_phone || ""}
                        </small>

                    </div>


                    <span
                        class="status ${status}"
                    >

                        ${status.replaceAll("_", " ")}

                    </span>

                </div>

            `;

        }).join("");
}


// ==========================================
// LOGOUT
// ==========================================

$("logout").addEventListener(
    "click",
    async function () {

        await sb.auth.signOut();

        location.href = backUrl;

    }
);


// ==========================================
// START
// ==========================================

sb.auth.onAuthStateChange(() => {

    loadCustomer();

});


loadCustomer();
