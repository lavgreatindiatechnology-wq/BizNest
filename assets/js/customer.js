// =============================================
// BIZNEST - FINAL CUSTOMER SYSTEM
// Order + Booking + Customer History
// =============================================

const $ = (id) => document.getElementById(id);


// =============================================
// URL PARAMETERS
// =============================================

const params = new URLSearchParams(window.location.search);

const slug = params.get("slug");

const requestType = params.get("type") || "";

const item = params.get("item") || "";


// =============================================
// BACK URL
// =============================================

const backUrl = slug
    ? "site.html?slug=" + encodeURIComponent(slug)
    : "index.html";

if ($("back")) {
    $("back").href = backUrl;
}


// =============================================
// MESSAGE FUNCTION
// =============================================

function showMessage(id, text) {

    const element = $(id);

    if (element) {
        element.textContent = text;
    }
}


// =============================================
// GET LOGGED-IN USER
// =============================================

async function getCurrentUser() {

    try {

        const { data, error } = await sb.auth.getUser();

        if (error) {
            console.log("USER ERROR:", error);
            return null;
        }

        return data.user;

    } catch (error) {

        console.error(error);

        return null;
    }
}


// =============================================
// GET BUSINESS
// =============================================

async function getBusiness() {

    if (!slug) {

        throw new Error(
            "Business link missing."
        );
    }


    const { data, error } = await sb
        .from("businesses")
        .select("id,name")
        .eq("slug", slug)
        .maybeSingle();


    if (error) {

        console.error("BUSINESS ERROR:", error);

        throw new Error(error.message);
    }


    if (!data) {

        throw new Error(
            "Business not found."
        );
    }


    return data;
}


// =============================================
// LOAD CUSTOMER PAGE
// =============================================

async function loadCustomerPage() {

    const user = await getCurrentUser();


    // -----------------------------------------
    // NOT LOGGED IN
    // -----------------------------------------

    if (!user) {

        if ($("authSection")) {
            $("authSection").classList.remove("hidden");
        }

        if ($("requestSection")) {
            $("requestSection").classList.add("hidden");
        }

        return;
    }


    // -----------------------------------------
    // LOGGED IN
    // -----------------------------------------

    if ($("authSection")) {
        $("authSection").classList.add("hidden");
    }

    if ($("requestSection")) {
        $("requestSection").classList.remove("hidden");
    }


    // CUSTOMER NAME

    const customerName =
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Customer";


    if ($("welcomeCustomer")) {

        $("welcomeCustomer").textContent =
            "👋 Welcome, " + customerName;
    }


    if ($("cname")) {

        // केवल खाली होने पर नाम डालें

        if (!$("cname").value) {

            $("cname").value =
                customerName;
        }
    }


    // -----------------------------------------
    // ORDER PAGE
    // -----------------------------------------

    if (requestType === "order") {

        if ($("title")) {

            $("title").textContent =
                "🛒 Confirm Your Order";
        }


        if ($("requestInfo")) {

            $("requestInfo").innerHTML =
                "<b>🛒 Product:</b> " +
                escapeHtml(item);
        }


        if ($("send")) {

            $("send").textContent =
                "🛒 Confirm Order";
        }
    }


    // -----------------------------------------
    // BOOKING PAGE
    // -----------------------------------------

    else if (requestType === "booking") {

        if ($("title")) {

            $("title").textContent =
                "📅 Confirm Appointment";
        }


        if ($("requestInfo")) {

            $("requestInfo").innerHTML =
                "<b>📅 Service:</b> " +
                escapeHtml(item);
        }


        if ($("send")) {

            $("send").textContent =
                "📅 Confirm Booking";
        }
    }


    // -----------------------------------------
    // CUSTOMER HISTORY
    // -----------------------------------------

    await loadCustomerHistory();
}


// =============================================
// ESCAPE HTML
// =============================================

function escapeHtml(text) {

    if (!text) return "";

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// =============================================
// CUSTOMER LOGIN
// =============================================

if ($("login")) {

    $("login").addEventListener(
        "click",
        async function () {

            const email =
                $("email")
                    ? $("email").value.trim()
                    : "";

            const password =
                $("password")
                    ? $("password").value
                    : "";


            if (!email) {

                showMessage(
                    "msg",
                    "❌ अपना Email डालें।"
                );

                return;
            }


            if (!password) {

                showMessage(
                    "msg",
                    "❌ अपना Password डालें।"
                );

                return;
            }


            showMessage(
                "msg",
                "⏳ Login हो रहा है..."
            );


            const { data, error } =
                await sb.auth.signInWithPassword({

                    email: email,

                    password: password
                });


            if (error) {

                console.error("LOGIN ERROR:", error);

                showMessage(
                    "msg",
                    "❌ " + error.message
                );

                return;
            }


            console.log(
                "LOGIN SUCCESS:",
                data
            );


            showMessage(
                "msg",
                "✅ Login Successful!"
            );


            // IMPORTANT:
            // URL नहीं बदलेगा
            // इसलिए Product / Service याद रहेगा

            await loadCustomerPage();

        }
    );
}


// =============================================
// CUSTOMER REGISTER
// =============================================

if ($("signup")) {

    $("signup").addEventListener(
        "click",
        async function () {

            const name =
                $("customerName")
                    ? $("customerName").value.trim()
                    : "";

            const email =
                $("email")
                    ? $("email").value.trim()
                    : "";

            const password =
                $("password")
                    ? $("password").value
                    : "";


            if (!name) {

                showMessage(
                    "msg",
                    "❌ अपना नाम डालें।"
                );

                return;
            }


            if (!email) {

                showMessage(
                    "msg",
                    "❌ अपना Email डालें।"
                );

                return;
            }


            if (!password) {

                showMessage(
                    "msg",
                    "❌ Password डालें।"
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "msg",
                    "❌ Password कम से कम 6 characters का होना चाहिए।"
                );

                return;
            }


            showMessage(
                "msg",
                "⏳ Account बनाया जा रहा है..."
            );


            const { data, error } =
                await sb.auth.signUp({

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

                console.error(
                    "SIGNUP ERROR:",
                    error
                );


                showMessage(
                    "msg",
                    "❌ " + error.message
                );

                return;
            }


            // अगर session तुरंत मिल गया

            if (data.session) {

                showMessage(
                    "msg",
                    "✅ Account Successfully बनाया गया!"
                );


                await loadCustomerPage();

            }

            else {

                showMessage(
                    "msg",
                    "✅ Account बन गया। अब Login करें।"
                );
            }

        }
    );
}


// =============================================
// CREATE ORDER / BOOKING
// =============================================

async function createRequest() {

    try {

        // -------------------------------------
        // VALIDATE URL
        // -------------------------------------

        if (
            requestType !== "order" &&
            requestType !== "booking"
        ) {

            throw new Error(
                "Please use Order Now or Book Appointment button."
            );
        }


        if (!item) {

            throw new Error(
                "Product or Service information missing."
            );
        }


        // -------------------------------------
        // GET CUSTOMER
        // -------------------------------------

        const user =
            await getCurrentUser();


        if (!user) {

            throw new Error(
                "Please login as Customer first."
            );
        }


        // -------------------------------------
        // GET FORM DATA
        // -------------------------------------

        const customerName =
            $("cname")
                ? $("cname").value.trim()
                : "";

        const customerPhone =
            $("cphone")
                ? $("cphone").value.trim()
                : "";

        const note =
            $("note")
                ? $("note").value.trim()
                : "";


        // -------------------------------------
        // VALIDATE
        // -------------------------------------

        if (!customerName) {

            throw new Error(
                "अपना नाम डालें।"
            );
        }


        if (!customerPhone) {

            throw new Error(
                "अपना Phone Number डालें।"
            );
        }


        // -------------------------------------
        // GET BUSINESS
        // -------------------------------------

        const business =
            await getBusiness();


        console.log("BUSINESS:", business);
        console.log("CUSTOMER:", user.id);


        // -------------------------------------
        // DISABLE BUTTON
        // -------------------------------------

        if ($("send")) {

            $("send").disabled = true;

            $("send").textContent =
                "⏳ Processing...";
        }


        // -------------------------------------
        // INSERT INTO REQUESTS
        // -------------------------------------

        const requestData = {

            business_id:
                business.id,

            customer_id:
                user.id,

            type:
                requestType,

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
        };


        console.log(
            "SENDING ORDER:",
            requestData
        );


        const { data, error } =
            await sb
                .from("requests")
                .insert(requestData)
                .select();


        // -------------------------------------
        // ERROR
        // -------------------------------------

        if (error) {

            console.error(
                "ORDER INSERT ERROR:",
                error
            );

            throw new Error(
                error.message
            );
        }


        console.log(
            "ORDER SUCCESS:",
            data
        );


        // -------------------------------------
        // SUCCESS MESSAGE
        // -------------------------------------

        if (requestType === "order") {

            showMessage(
                "done",
                "🎉 आपका Order Successfully हो गया!"
            );

        } else {

            showMessage(
                "done",
                "🎉 आपकी Appointment Successfully Book हो गई!"
            );
        }


        // -------------------------------------
        // HISTORY RELOAD
        // -------------------------------------

        await loadCustomerHistory();


        // -------------------------------------
        // BUTTON TEXT
        // -------------------------------------

        if ($("send")) {

            $("send").disabled = true;

            $("send").textContent =
                requestType === "order"
                    ? "✅ Order Placed"
                    : "✅ Booking Confirmed";
        }

    }

    catch (error) {

        console.error(
            "CREATE REQUEST ERROR:",
            error
        );


        showMessage(
            "done",
            "❌ ERROR: " + error.message
        );


        // Button वापस enable

        if ($("send")) {

            $("send").disabled = false;

            $("send").textContent =
                requestType === "order"
                    ? "🛒 Confirm Order"
                    : "📅 Confirm Booking";
        }
    }
}


// =============================================
// CONFIRM BUTTON
// =============================================

if ($("send")) {

    $("send").addEventListener(
        "click",
        async function () {

            showMessage(
                "done",
                "⏳ Processing..."
            );


            await createRequest();

        }
    );
}


// =============================================
// CUSTOMER HISTORY
// =============================================

async function loadCustomerHistory() {

    try {

        const user =
            await getCurrentUser();


        if (!user) return;


        if (!$("historyList")) return;


        const { data, error } =
            await sb
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

            console.error(
                "HISTORY ERROR:",
                error
            );


            $("historyList").innerHTML =
                "<p>❌ " +
                escapeHtml(error.message) +
                "</p>";

            return;
        }


        // -------------------------------------
        // NO HISTORY
        // -------------------------------------

        if (!data || data.length === 0) {

            $("historyList").innerHTML =
                "<p>No orders or bookings yet.</p>";

            return;
        }


        // -------------------------------------
        // SHOW HISTORY
        // -------------------------------------

        $("historyList").innerHTML =
            data.map(request => {

                let icon =
                    "📩";

                let typeName =
                    "Request";


                if (
                    request.type === "order"
                ) {

                    icon = "🛒";

                    typeName =
                        "Product Order";
                }


                if (
                    request.type === "booking"
                ) {

                    icon = "📅";

                    typeName =
                        "Service Booking";
                }


                const status =
                    request.status ||
                    "pending";


                return `

                    <div class="card history-card">

                        <h3>
                            ${icon}
                            ${typeName}
                        </h3>

                        <p>
                            <b>
                                ${escapeHtml(
                                    request.item_name || ""
                                )}
                            </b>
                        </p>

                        <p>
                            📞
                            ${escapeHtml(
                                request.customer_phone || ""
                            )}
                        </p>

                        <p>
                            <b>Status:</b>
                            ${escapeHtml(status)}
                        </p>

                    </div>

                `;

            }).join("");

    }

    catch (error) {

        console.error(
            "LOAD HISTORY ERROR:",
            error
        );
    }
}


// =============================================
// LOGOUT
// =============================================

if ($("logout")) {

    $("logout").addEventListener(
        "click",
        async function () {

            try {

                await sb.auth.signOut();

                window.location.href =
                    backUrl;

            }

            catch (error) {

                console.error(error);
            }

        }
    );
}


// =============================================
// AUTH STATE CHANGE
// =============================================

// केवल page reload नहीं करेंगे,
// ताकि बार-बार logout/login issue न हो

sb.auth.onAuthStateChange(
    async (event) => {

        console.log(
            "AUTH EVENT:",
            event
        );

        if (
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION"
        ) {

            await loadCustomerPage();
        }

    }
);


// =============================================
// START
// =============================================

loadCustomerPage();
