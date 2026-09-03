const $ = (id) => document.getElementById(id);


// =========================================
// GET URL DATA
// =========================================

const params =
    new URLSearchParams(window.location.search);

const slug =
    params.get("slug");

const type =
    params.get("type") || "general";

const item =
    params.get("item") || "General Request";


// =========================================
// BACK URL
// =========================================

const backUrl = slug
    ? "site.html?slug=" +
      encodeURIComponent(slug)
    : "index.html";

$("back").href = backUrl;


// =========================================
// GET CUSTOMER NAME
// =========================================

function getCustomerName(user) {

    return (
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "Customer"
    );
}


// =========================================
// LOAD PAGE
// =========================================

async function loadPage() {

    try {

        const {
            data: { user }
        } = await sb.auth.getUser();


        // NOT LOGGED IN

        if (!user) {

            $("authSection")
                .classList
                .remove("hidden");

            $("requestSection")
                .classList
                .add("hidden");

            return;
        }


        // LOGGED IN

        $("authSection")
            .classList
            .add("hidden");

        $("requestSection")
            .classList
            .remove("hidden");


        const name =
            getCustomerName(user);


        $("welcomeCustomer").textContent =
            "👋 Welcome, " + name;


        $("cname").value = name;


        // PRODUCT ORDER

        if (type === "order") {

            $("title").textContent =
                "Place Your Order";


            $("requestInfo").innerHTML =
                "🛒 <b>Product Order:</b> " +
                item;


            $("send").textContent =
                "🛒 Confirm Order";
        }


        // SERVICE BOOKING

        else if (type === "booking") {

            $("title").textContent =
                "Book Appointment";


            $("requestInfo").innerHTML =
                "📅 <b>Service Booking:</b> " +
                item;


            $("send").textContent =
                "📅 Confirm Booking";
        }


        // GENERAL

        else {

            $("requestInfo").textContent =
                "Send your request.";

            $("send").textContent =
                "Send Request";
        }


        await loadHistory();

    }

    catch (error) {

        console.error(error);
    }
}


// =========================================
// CUSTOMER LOGIN
// =========================================

$("login").addEventListener(
    "click",
    async function () {

        try {

            const email =
                $("email").value.trim();

            const password =
                $("password").value;


            if (!email || !password) {

                $("msg").textContent =
                    "❌ Email और Password डालें।";

                return;
            }


            $("msg").textContent =
                "Login हो रहा है...";


            const { error } =
                await sb.auth
                    .signInWithPassword({

                        email: email,

                        password: password
                    });


            if (error) {

                throw error;
            }


            $("msg").textContent =
                "✅ Login सफल!";


            await loadPage();

        }

        catch (error) {

            console.error(error);

            $("msg").textContent =
                "❌ " + error.message;
        }

    }
);


// =========================================
// CUSTOMER REGISTER
// =========================================

$("signup").addEventListener(
    "click",
    async function () {

        try {

            const name =
                $("customerName").value.trim();

            const email =
                $("email").value.trim();

            const password =
                $("password").value;


            if (!name) {

                throw new Error(
                    "अपना नाम डालें।"
                );
            }


            if (!email) {

                throw new Error(
                    "अपना Email डालें।"
                );
            }


            if (password.length < 6) {

                throw new Error(
                    "Password कम से कम 6 characters का होना चाहिए।"
                );
            }


            $("msg").textContent =
                "Account बनाया जा रहा है...";


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

                throw error;
            }


            if (data.session) {

                $("msg").textContent =
                    "✅ Account बन गया!";

                await loadPage();

            }

            else {

                $("msg").textContent =
                    "✅ Account बन गया। अब Email confirm करके Login करें।";
            }

        }

        catch (error) {

            console.error(error);

            $("msg").textContent =
                "❌ " + error.message;
        }

    }
);


// =========================================
// GET BUSINESS
// =========================================

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


// =========================================
// SEND ORDER / BOOKING
// =========================================

$("send").addEventListener(
    "click",
    async function () {

        try {

            $("done").textContent =
                "⏳ Processing...";


            const {
                data: { user }
            } = await sb.auth.getUser();


            if (!user) {

                throw new Error(
                    "पहले Customer Login करें।"
                );
            }


            const name =
                $("cname").value.trim();

            const phone =
                $("cphone").value.trim();

            const note =
                $("note").value.trim();


            if (!name) {

                throw new Error(
                    "अपना नाम डालें।"
                );
            }


            if (!phone) {

                throw new Error(
                    "अपना Phone Number डालें।"
                );
            }


            const business =
                await getBusiness();


            // =====================================
            // CREATE REQUEST
            // =====================================

            const {
                data,
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
                        note,

                    status:
                        "pending"

                })
                .select();


            if (error) {

                throw error;
            }


            if (!data || data.length === 0) {

                throw new Error(
                    "Order/Booking save नहीं हुआ।"
                );
            }


            // SUCCESS

            if (type === "order") {

                $("done").textContent =
                    "🎉 आपका Order Successfully हो गया!";

            }

            else if (type === "booking") {

                $("done").textContent =
                    "🎉 आपकी Appointment Successfully Book हो गई!";

            }

            else {

                $("done").textContent =
                    "🎉 Request Successfully भेज दिया गया!";
            }


            // DISABLE DUPLICATE CLICK

            $("send").disabled = true;


            // RELOAD HISTORY

            await loadHistory();

        }

        catch (error) {

            console.error(error);

            $("done").textContent =
                "❌ ERROR: " +
                error.message;
        }

    }
);


// =========================================
// LOAD CUSTOMER HISTORY
// =========================================

async function loadHistory() {

    try {

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

            throw error;
        }


        if (!data || data.length === 0) {

            $("historyList").innerHTML =
                "<p>अभी कोई Order या Booking नहीं है।</p>";

            return;
        }


        $("historyList").innerHTML =
            data.map(request => {

                let requestType =
                    "📩 Request";


                if (request.type === "order") {

                    requestType =
                        "🛒 Product Order";
                }


                if (request.type === "booking") {

                    requestType =
                        "📅 Service Booking";
                }


                const status =
                    request.status || "pending";


                return `

                    <div class="card history-card">

                        <div>

                            <b>
                                ${requestType}
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

                            ${status
                                .replaceAll("_", " ")
                            }

                        </span>

                    </div>

                `;

            }).join("");

    }

    catch (error) {

        console.error(error);

        $("historyList").innerHTML =
            "❌ " + error.message;
    }
}


// =========================================
// LOGOUT
// =========================================

$("logout").addEventListener(
    "click",
    async function () {

        await sb.auth.signOut();

        window.location.href =
            backUrl;
    }
);


// =========================================
// START
// =========================================

loadPage();
