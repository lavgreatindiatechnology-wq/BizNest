const $ = (id) => document.getElementById(id);


// ==========================================
// URL DATA
// ==========================================

const params = new URLSearchParams(window.location.search);

const slug = params.get("slug");

const type = params.get("type") || "general";

const item = params.get("item") || "General Request";


// ==========================================
// BACK URL
// ==========================================

const backUrl = slug
    ? "site.html?slug=" + encodeURIComponent(slug)
    : "index.html";


$("back").href = backUrl;


// ==========================================
// GET CUSTOMER NAME
// ==========================================

function customerName(user) {

    return (
        user.user_metadata?.name ||
        user.email.split("@")[0] ||
        "Customer"
    );
}


// ==========================================
// LOAD PAGE
// ==========================================

async function loadPage() {

    const {
        data: { user }
    } = await sb.auth.getUser();


    // CUSTOMER NOT LOGIN

    if (!user) {

        $("authSection").classList.remove("hidden");

        $("requestSection").classList.add("hidden");

        return;
    }


    // CUSTOMER LOGGED IN

    $("authSection").classList.add("hidden");

    $("requestSection").classList.remove("hidden");


    const name = customerName(user);


    $("welcomeCustomer").textContent =
        "👋 Welcome, " + name;


    $("cname").value = name;


    // PRODUCT

    if (type === "order") {

        $("requestInfo").innerHTML =
            "<h3>🛒 Product Order</h3>" +
            "<p><b>" + item + "</b></p>";


        $("confirmRequest").textContent =
            "🛒 Confirm Order";

    }


    // SERVICE

    else if (type === "booking") {

        $("requestInfo").innerHTML =
            "<h3>📅 Book Appointment</h3>" +
            "<p><b>" + item + "</b></p>";


        $("confirmRequest").textContent =
            "📅 Confirm Booking";

    }


    else {

        $("confirmRequest").textContent =
            "Send Request";

    }


    await loadHistory();
}


// ==========================================
// CUSTOMER LOGIN
// ==========================================

$("login").addEventListener(
    "click",
    async () => {

        const email =
            $("email").value.trim();

        const password =
            $("password").value;


        if (!email || !password) {

            $("msg").textContent =
                "❌ Email और Password डालें।";

            return;
        }


        const { error } =
            await sb.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            $("msg").textContent =
                "❌ " + error.message;

            return;
        }


        $("msg").textContent =
            "✅ Login Successful";


        await loadPage();

    }
);


// ==========================================
// CUSTOMER REGISTER
// ==========================================

$("signup").addEventListener(
    "click",
    async () => {

        const name =
            $("customerName").value.trim();

        const email =
            $("email").value.trim();

        const password =
            $("password").value;


        if (!name) {

            $("msg").textContent =
                "❌ अपना नाम डालें।";

            return;
        }


        if (!email) {

            $("msg").textContent =
                "❌ Email डालें।";

            return;
        }


        if (password.length < 6) {

            $("msg").textContent =
                "❌ Password कम से कम 6 characters का होना चाहिए।";

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


        // SESSION AVAILABLE

        if (data.session) {

            await loadPage();

        }

        else {

            $("msg").textContent =
                "✅ Account बन गया। अब Login करें।";

        }

    }
);


// ==========================================
// GET BUSINESS
// ==========================================

async function getBusiness() {

    if (!slug) {

        throw new Error(
            "Business URL missing."
        );
    }


    const {
        data,
        error
    } = await sb
        .from("businesses")
        .select("id,name")
        .eq("slug", slug)
        .maybeSingle();


    if (error) {

        throw error;
    }


    if (!data) {

        throw new Error(
            "Business नहीं मिला।"
        );
    }


    return data;
}


// ==========================================
// CONFIRM ORDER / BOOKING
// ==========================================

$("confirmRequest").addEventListener(
    "click",
    async () => {

        try {

            $("done").textContent =
                "Processing...";


            // USER

            const {
                data: { user }
            } = await sb.auth.getUser();


            if (!user) {

                throw new Error(
                    "पहले Login करें।"
                );
            }


            // NAME

            const name =
                $("cname").value.trim();


            if (!name) {

                throw new Error(
                    "अपना नाम डालें।"
                );
            }


            // PHONE

            const phone =
                $("cphone").value.trim();


            if (!phone) {

                throw new Error(
                    "अपना Phone Number डालें।"
                );
            }


            // BUSINESS

            const business =
                await getBusiness();


            // INSERT REQUEST

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
                        name,

                    customer_phone:
                        phone,

                    note:
                        $("note").value.trim(),

                    status:
                        "pending"

                });


            if (error) {

                throw error;
            }


            // SUCCESS MESSAGE

            if (type === "order") {

                $("done").textContent =
                    "🎉 आपका Order सफलतापूर्वक भेज दिया गया!";

            }

            else if (type === "booking") {

                $("done").textContent =
                    "🎉 आपकी Appointment Booking सफलतापूर्वक हो गई!";

            }

            else {

                $("done").textContent =
                    "🎉 Request सफलतापूर्वक भेज दिया गया!";

            }


            // CLEAR OPTIONAL NOTE

            $("note").value = "";


            // RELOAD HISTORY

            await loadHistory();


        }

        catch (error) {

            console.error(error);


            $("done").textContent =
                "❌ ERROR: " + error.message;

        }

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
        .eq("customer_id", user.id)
        .order(
            "created_at",
            { ascending: false }
        );


    if (error) {

        $("historyList").innerHTML =
            "❌ " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        $("historyList").innerHTML =
            "<p>अभी कोई Order या Booking नहीं है।</p>";

        return;
    }


    $("historyList").innerHTML =
        data.map(request => {

            const icon =
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

                        <b>${icon}</b>

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
    async () => {

        await sb.auth.signOut();

        window.location.href =
            backUrl;

    }
);


// ==========================================
// AUTH CHANGE
// ==========================================

sb.auth.onAuthStateChange(
    () => {

        loadPage();

    }
);


// ==========================================
// START
// ==========================================

loadPage();
