const $ = (id) => document.getElementById(id);


// =============================================
// URL PARAMETERS
// =============================================

const params =
    new URLSearchParams(window.location.search);

const slug =
    params.get("slug");

const requestType =
    params.get("type") || "";

const item =
    params.get("item") || "";


// =============================================
// BACK URL
// =============================================

const backUrl = slug
    ? "site.html?slug=" +
      encodeURIComponent(slug)
    : "index.html";


if ($("back")) {
    $("back").href = backUrl;
}


// =============================================
// SHOW MESSAGE
// =============================================

function message(id, text) {

    const el = $(id);

    if (el) {
        el.textContent = text;
    }
}


// =============================================
// GET CURRENT USER
// =============================================

async function getUser() {

    const {
        data: { user },
        error
    } = await sb.auth.getUser();

    if (error) return null;

    return user;
}


// =============================================
// LOAD CUSTOMER PAGE
// =============================================

async function loadPage() {

    const user =
        await getUser();


    if (!user) {

        $("authSection")
            ?.classList
            .remove("hidden");

        $("requestSection")
            ?.classList
            .add("hidden");

        return;
    }


    $("authSection")
        ?.classList
        .add("hidden");

    $("requestSection")
        ?.classList
        .remove("hidden");


    const name =
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Customer";


    if ($("welcomeCustomer")) {

        $("welcomeCustomer").textContent =
            "👋 Welcome, " + name;
    }


    if ($("cname")) {

        $("cname").value = name;
    }


    // ORDER

    if (requestType === "order") {

        if ($("title")) {
            $("title").textContent =
                "🛒 Confirm Your Order";
        }

        if ($("requestInfo")) {

            $("requestInfo").textContent =
                "Product: " + item;
        }

        if ($("send")) {

            $("send").textContent =
                "🛒 Confirm Order";
        }
    }


    // BOOKING

    else if (requestType === "booking") {

        if ($("title")) {
            $("title").textContent =
                "📅 Confirm Appointment";
        }

        if ($("requestInfo")) {

            $("requestInfo").textContent =
                "Service: " + item;
        }

        if ($("send")) {

            $("send").textContent =
                "📅 Confirm Booking";
        }
    }


    await loadHistory();
}


// =============================================
// LOGIN
// =============================================

if ($("login")) {

    $("login").addEventListener(
        "click",
        async function () {

            const email =
                $("email")?.value.trim();

            const password =
                $("password")?.value;


            if (!email || !password) {

                message(
                    "msg",
                    "❌ Email और Password डालें।"
                );

                return;
            }


            message(
                "msg",
                "⏳ Login हो रहा है..."
            );


            const { error } =
                await sb.auth.signInWithPassword({

                    email: email,

                    password: password
                });


            if (error) {

                message(
                    "msg",
                    "❌ " + error.message
                );

                return;
            }


            message(
                "msg",
                "✅ Login successful"
            );


            // IMPORTANT
            // URL नहीं बदलेगा
            // इसलिए product/service याद रहेगा

            await loadPage();

        }
    );
}


// =============================================
// SIGNUP
// =============================================

if ($("signup")) {

    $("signup").addEventListener(
        "click",
        async function () {

            const name =
                $("customerName")?.value.trim();

            const email =
                $("email")?.value.trim();

            const password =
                $("password")?.value;


            if (!name || !email || !password) {

                message(
                    "msg",
                    "❌ Name, Email और Password डालें।"
                );

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
                        name: name
                    }
                }
            });


            if (error) {

                message(
                    "msg",
                    "❌ " + error.message
                );

                return;
            }


            if (data.session) {

                await loadPage();

            } else {

                message(
                    "msg",
                    "✅ Account बन गया। अब Email confirm करके Login करें।"
                );
            }

        }
    );
}


// =============================================
// GET BUSINESS
// =============================================

async function getBusiness() {

    if (!slug) {

        throw new Error(
            "Business link missing"
        );
    }


    const {
        data,
        error
    } = await sb
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();


    if (error) throw error;


    if (!data) {

        throw new Error(
            "Business not found"
        );
    }


    return data;
}


// =============================================
// SEND ORDER / BOOKING
// =============================================

if ($("send")) {

    $("send").addEventListener(
        "click",
        async function () {

            try {

                message(
                    "done",
                    "⏳ Processing..."
                );


                const user =
                    await getUser();


                if (!user) {

                    throw new Error(
                        "Customer login required"
                    );
                }


                if (
                    requestType !== "order" &&
                    requestType !== "booking"
                ) {

                    throw new Error(
                        "Please open this page using Order Now or Book Appointment."
                    );
                }


                if (!item) {

                    throw new Error(
                        "Product/Service missing"
                    );
                }


                const name =
                    $("cname")?.value.trim();

                const phone =
                    $("cphone")?.value.trim();

                const note =
                    $("note")?.value.trim() || "";


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
                            requestType,

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
                    .select()
                    .single();


                if (error) {

                    throw error;
                }


                if (!data) {

                    throw new Error(
                        "Order save नहीं हुआ"
                    );
                }


                // SUCCESS

                if (requestType === "order") {

                    message(
                        "done",
                        "🎉 आपका Order Successfully हो गया!"
                    );

                } else {

                    message(
                        "done",
                        "🎉 आपकी Appointment Successfully Book हो गई!"
                    );
                }


                // Disable duplicate order

                $("send").disabled = true;


                await loadHistory();

            }

            catch (error) {

                console.error(error);

                message(
                    "done",
                    "❌ " + error.message
                );
            }

        }
    );
}


// =============================================
// LOAD HISTORY
// =============================================

async function loadHistory() {

    const user =
        await getUser();


    if (!user || !$("historyList")) return;


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
        "";


    data.forEach(request => {

        const card =
            document.createElement("div");

        card.className =
            "card history-card";


        const typeText =
            request.type === "order"
                ? "🛒 Product Order"
                : "📅 Service Booking";


        const title =
            document.createElement("h3");

        title.textContent =
            typeText + " - " +
            (request.item_name || "");


        const status =
            document.createElement("p");

        status.innerHTML =
            "<b>Status:</b> " +
            (request.status || "pending")
                .replaceAll("_", " ");


        card.appendChild(title);
        card.appendChild(status);

        $("historyList").appendChild(card);
    });
}


// =============================================
// LOGOUT
// =============================================

if ($("logout")) {

    $("logout").addEventListener(
        "click",
        async function () {

            await sb.auth.signOut();

            window.location.href =
                backUrl;

        }
    );
}


// =============================================
// START
// =============================================

loadPage();
