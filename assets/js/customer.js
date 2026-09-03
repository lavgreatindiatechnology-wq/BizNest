const sb = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const params = new URLSearchParams(location.search);

const slug = params.get("slug");
const type = params.get("type") || "general";
const item = params.get("item") || "General Request";

const $ = (id) => document.getElementById(id);

const backURL = slug
    ? "site.html?slug=" + encodeURIComponent(slug)
    : "index.html";


$("back").href = backURL;


/* -------------------------
   CUSTOMER NAME
------------------------- */

function getCustomerName(user) {

    if (!user) return "Customer";

    return (
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Customer"
    );
}


/* -------------------------
   MESSAGE
------------------------- */

function showMessage(text, isError = false) {

    $("msg").textContent = text;

    $("msg").style.color =
        isError ? "#c62828" : "#198754";
}


/* -------------------------
   LOGIN STATUS
------------------------- */

async function checkLogin() {

    const {
        data: { session }
    } = await sb.auth.getSession();


    const loggedIn = !!session;


    $("authSection").classList.toggle(
        "hidden",
        loggedIn
    );


    $("requestSection").classList.toggle(
        "hidden",
        !loggedIn
    );


    if (session?.user) {

        const name = getCustomerName(
            session.user
        );


        $("welcomeCustomer").textContent =
            "👋 Welcome, " + name;


        $("cname").value = name;


        if (type === "order") {

            $("title").textContent =
                "🛒 Order Product";

            $("requestInfo").textContent =
                "Product: " + item;

        } else if (type === "booking") {

            $("title").textContent =
                "📅 Book Service";

            $("requestInfo").textContent =
                "Service: " + item;

        } else {

            $("title").textContent =
                "Customer Request";

            $("requestInfo").textContent =
                item;
        }
    }
}


/* -------------------------
   LOGIN
------------------------- */

$("login").addEventListener(
    "click",
    async () => {

        const email =
            $("email").value.trim();

        const password =
            $("password").value;


        if (!email || !password) {

            showMessage(
                "Please enter email and password.",
                true
            );

            return;
        }


        $("login").disabled = true;

        $("login").textContent =
            "Logging in...";


        const { error } =
            await sb.auth.signInWithPassword({
                email,
                password
            });


        $("login").disabled = false;

        $("login").textContent =
            "Login";


        if (error) {

            showMessage(
                error.message,
                true
            );

            return;
        }


        showMessage(
            "✅ Login successful!"
        );


        await checkLogin();
    }
);


/* -------------------------
   CUSTOMER REGISTER
------------------------- */

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

            showMessage(
                "Please enter your name.",
                true
            );

            return;
        }


        if (!email || !password) {

            showMessage(
                "Please enter email and password.",
                true
            );

            return;
        }


        if (password.length < 6) {

            showMessage(
                "Password must be at least 6 characters.",
                true
            );

            return;
        }


        $("signup").disabled = true;

        $("signup").textContent =
            "Creating...";


        const {
            data,
            error
        } = await sb.auth.signUp({

            email,
            password,

            options: {

                data: {
                    name: name,
                    role: "customer"
                }

            }

        });


        $("signup").disabled = false;

        $("signup").textContent =
            "Create Account";


        if (error) {

            showMessage(
                error.message,
                true
            );

            return;
        }


        if (data.session) {

            showMessage(
                "✅ Account created successfully!"
            );

            await checkLogin();

        } else {

            showMessage(
                "✅ Account created! Now login."
            );
        }
    }
);


/* -------------------------
   SEND ORDER / BOOKING
------------------------- */

$("send").addEventListener(
    "click",
    async () => {

        try {

            const {
                data: { user }
            } = await sb.auth.getUser();


            if (!user) {

                $("done").textContent =
                    "Please login first.";

                return;
            }


            if (!slug) {

                $("done").textContent =
                    "Business website not found.";

                return;
            }


            const customerName =
                $("cname").value.trim();

            const customerPhone =
                $("cphone").value.trim();

            const note =
                $("note").value.trim();


            if (!customerName) {

                $("done").textContent =
                    "Please enter your name.";

                return;
            }


            if (!customerPhone) {

                $("done").textContent =
                    "Please enter your phone number.";

                return;
            }


            $("send").disabled = true;

            $("send").textContent =
                "Sending...";


            /* GET BUSINESS */

            const {
                data: business,
                error: businessError
            } = await sb
                .from("businesses")
                .select("id")
                .eq("slug", slug)
                .maybeSingle();


            if (businessError)
                throw businessError;


            if (!business) {

                throw new Error(
                    "Business not found."
                );
            }


            /* INSERT REQUEST */

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
                        "new"
                });


            if (error)
                throw error;


            $("done").textContent =
                "✅ Request sent successfully!";


            $("note").value = "";


            $("send").textContent =
                "Sent Successfully ✅";


            setTimeout(() => {

                location.href = backURL;

            }, 1500);


        } catch (error) {

            console.error(error);


            $("done").textContent =
                "❌ " + error.message;


            $("send").disabled = false;

            $("send").textContent =
                "Send Request";
        }
    }
);


/* -------------------------
   LOGOUT
------------------------- */

$("logout").addEventListener(
    "click",
    async () => {

        await sb.auth.signOut();

        location.href = backURL;
    }
);


/* -------------------------
   AUTH LISTENER
------------------------- */

sb.auth.onAuthStateChange(
    () => {

        checkLogin();

    }
);


/* START */

checkLogin();
