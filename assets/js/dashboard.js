const $ = (id) => document.getElementById(id);

let currentUser = null;
let currentBusiness = null;


/* =========================================
   START DASHBOARD
========================================= */

async function startDashboard() {

    const {
        data: { user },
        error
    } = await sb.auth.getUser();

    if (error || !user) {
        location.href = "login.html";
        return;
    }

    currentUser = user;

    $("welcome").textContent =
        "Welcome, " +
        (
            user.user_metadata?.name ||
            user.email
        );

    await loadBusiness();
    await loadProducts();
    await loadServices();
    await loadRequests();
}


/* =========================================
   LOAD BUSINESS
========================================= */

async function loadBusiness() {

    const { data, error } = await sb
        .from("businesses")
        .select("*")
        .eq("owner_id", currentUser.id)
        .maybeSingle();

    if (error) {
        console.error(error);
        return;
    }

    currentBusiness = data;

    if (!currentBusiness) return;

    $("businessName").value =
        currentBusiness.name || "";

    $("slug").value =
        currentBusiness.slug || "";

    $("tagline").value =
        currentBusiness.tagline || "";

    $("phone").value =
        currentBusiness.phone || "";

    $("businessEmail").value =
        currentBusiness.email || "";

    $("address").value =
        currentBusiness.address || "";

    if (currentBusiness.logo_url) {

        $("logoPreview").src =
            currentBusiness.logo_url;

        $("logoPreview")
            .classList
            .remove("hidden");
    }
}


/* =========================================
   IMAGE UPLOAD
========================================= */

async function uploadImage(file, folder) {

    if (!file) return null;

    const extension =
        file.name.split(".").pop();

    const fileName =
        folder +
        "/" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)
        +
        "." +
        extension;

    const { error } = await sb
        .storage
        .from("business-assets")
        .upload(fileName, file);

    if (error) {
        throw error;
    }

    const {
        data
    } = sb
        .storage
        .from("business-assets")
        .getPublicUrl(fileName);

    return data.publicUrl;
}


/* =========================================
   SAVE BUSINESS
========================================= */

$("saveBusiness").addEventListener(
    "click",
    async function () {

        try {

            const name =
                $("businessName").value.trim();

            const slug =
                $("slug")
                    .value
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-");

            if (!name) {
                throw new Error(
                    "Business name required"
                );
            }

            if (!slug) {
                throw new Error(
                    "Public URL name required"
                );
            }

            let logoUrl =
                currentBusiness?.logo_url || null;

            const logoFile =
                $("logoFile").files[0];

            if (logoFile) {

                logoUrl =
                    await uploadImage(
                        logoFile,
                        "logos"
                    );
            }


            const businessData = {

                owner_id:
                    currentUser.id,

                name: name,

                slug: slug,

                tagline:
                    $("tagline").value.trim(),

                phone:
                    $("phone").value.trim(),

                email:
                    $("businessEmail")
                        .value
                        .trim(),

                address:
                    $("address")
                        .value
                        .trim(),

                logo_url:
                    logoUrl
            };


            if (currentBusiness) {

                const { error } = await sb
                    .from("businesses")
                    .update(businessData)
                    .eq(
                        "id",
                        currentBusiness.id
                    );

                if (error) throw error;

            } else {

                const {
                    data,
                    error
                } = await sb
                    .from("businesses")
                    .insert(businessData)
                    .select()
                    .single();

                if (error) throw error;

                currentBusiness = data;
            }


            $("businessMsg").textContent =
                "✅ Business saved successfully";

            await loadBusiness();
            await loadRequests();

        } catch (error) {

            console.error(error);

            $("businessMsg").textContent =
                "❌ " + error.message;
        }

    }
);


/* =========================================
   ADD PRODUCT
========================================= */

$("addProduct").addEventListener(
    "click",
    async function () {

        try {

            if (!currentBusiness) {

                throw new Error(
                    "Please save your business first"
                );
            }


            const name =
                $("productName").value.trim();

            if (!name) {

                throw new Error(
                    "Product name required"
                );
            }


            let imageUrl = null;

            const imageFile =
                $("productImage").files[0];

            if (imageFile) {

                imageUrl =
                    await uploadImage(
                        imageFile,
                        "products"
                    );
            }


            const { error } = await sb
                .from("products")
                .insert({

                    business_id:
                        currentBusiness.id,

                    name: name,

                    price:
                        Number(
                            $("productPrice").value || 0
                        ),

                    description:
                        $("productDescription")
                            .value
                            .trim(),

                    image_url:
                        imageUrl,

                    active: true
                });


            if (error) throw error;


            $("productMsg").textContent =
                "✅ Product added successfully";


            $("productName").value = "";
            $("productPrice").value = "";
            $("productDescription").value = "";
            $("productImage").value = "";


            await loadProducts();

        } catch (error) {

            console.error(error);

            $("productMsg").textContent =
                "❌ " + error.message;
        }

    }
);


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

    if (!currentBusiness) {

        $("productList").innerHTML =
            "Please save your business first.";

        return;
    }


    const {
        data,
        error
    } = await sb
        .from("products")
        .select("*")
        .eq(
            "business_id",
            currentBusiness.id
        )
        .order(
            "created_at",
            { ascending: false }
        );


    if (error) {

        $("productList").textContent =
            "❌ " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        $("productList").innerHTML =
            "No products yet.";

        return;
    }


    $("productList").innerHTML =
        data.map(product => `

            <div class="card">

                ${
                    product.image_url
                        ? `<img
                            src="${product.image_url}"
                            class="product-image"
                          >`
                        : ""
                }

                <h3>${product.name}</h3>

                <p>
                    ${product.description || ""}
                </p>

                <div class="price">
                    ₹${product.price || 0}
                </div>

                <button
                    class="btn danger"
                    onclick="deleteProduct('${product.id}')"
                >
                    Delete
                </button>

            </div>

        `).join("");
}


/* =========================================
   DELETE PRODUCT
========================================= */

window.deleteProduct =
async function (id) {

    if (!confirm("Delete this product?")) {
        return;
    }


    const { error } = await sb
        .from("products")
        .delete()
        .eq("id", id);


    if (error) {

        alert(
            "❌ " + error.message
        );

        return;
    }


    await loadProducts();
};


/* =========================================
   ADD SERVICE
========================================= */

$("addService").addEventListener(
    "click",
    async function () {

        try {

            if (!currentBusiness) {

                throw new Error(
                    "Please save your business first"
                );
            }


            const name =
                $("serviceName").value.trim();

            if (!name) {

                throw new Error(
                    "Service name required"
                );
            }


            const { error } = await sb
                .from("services")
                .insert({

                    business_id:
                        currentBusiness.id,

                    name: name,

                    price:
                        Number(
                            $("servicePrice").value || 0
                        ),

                    description:
                        $("serviceDescription")
                            .value
                            .trim(),

                    active: true
                });


            if (error) throw error;


            $("serviceMsg").textContent =
                "✅ Service added successfully";


            $("serviceName").value = "";
            $("servicePrice").value = "";
            $("serviceDescription").value = "";


            await loadServices();

        } catch (error) {

            console.error(error);

            $("serviceMsg").textContent =
                "❌ " + error.message;
        }

    }
);


/* =========================================
   LOAD SERVICES
========================================= */

async function loadServices() {

    if (!currentBusiness) {

        $("serviceList").innerHTML =
            "Please save your business first.";

        return;
    }


    const {
        data,
        error
    } = await sb
        .from("services")
        .select("*")
        .eq(
            "business_id",
            currentBusiness.id
        )
        .order(
            "created_at",
            { ascending: false }
        );


    if (error) {

        $("serviceList").textContent =
            "❌ " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        $("serviceList").innerHTML =
            "No services yet.";

        return;
    }


    $("serviceList").innerHTML =
        data.map(service => `

            <div class="card">

                <h3>${service.name}</h3>

                <p>
                    ${service.description || ""}
                </p>

                <div class="price">
                    ₹${service.price || 0}
                </div>

                <button
                    class="btn danger"
                    onclick="deleteService('${service.id}')"
                >
                    Delete
                </button>

            </div>

        `).join("");
}


/* =========================================
   DELETE SERVICE
========================================= */

window.deleteService =
async function (id) {

    if (!confirm("Delete this service?")) {
        return;
    }


    const { error } = await sb
        .from("services")
        .delete()
        .eq("id", id);


    if (error) {

        alert(
            "❌ " + error.message
        );

        return;
    }


    await loadServices();
};


/* =========================================
   LOAD ORDERS & BOOKINGS
========================================= */

async function loadRequests() {

    if (!currentBusiness) {

        $("requestList").innerHTML =
            "Please save your business first.";

        return;
    }


    const {
        data,
        error
    } = await sb
        .from("requests")
        .select("*")
        .eq(
            "business_id",
            currentBusiness.id
        )
        .order(
            "created_at",
            { ascending: false }
        );


    if (error) {

        console.error(error);

        $("requestList").innerHTML =
            "❌ ERROR: " + error.message;

        return;
    }


    if (!data || data.length === 0) {

        $("requestList").innerHTML =
            "<p>No orders or bookings yet.</p>";

        return;
    }


    $("requestList").innerHTML =
        data.map(request => {

            const requestType =
                request.type === "order"
                    ? "🛒 Product Order"
                    : "📅 Service Booking";


            const currentStatus =
                request.status || "pending";


            return `

                <div class="card request-card">

                    <div class="request-head">

                        <div>

                            <h3>
                                ${requestType}
                            </h3>

                            <b>
                                ${request.item_name || ""}
                            </b>

                        </div>


                        <span
                            class="status ${currentStatus}"
                        >

                            ${currentStatus
                                .replaceAll("_", " ")
                            }

                        </span>

                    </div>


                    <p>
                        👤 ${request.customer_name || ""}
                    </p>


                    <p>
                        📞 ${request.customer_phone || "-"}
                    </p>


                    <p>
                        💬 ${request.note || "-"}
                    </p>


                    <div class="action-buttons">

                        <button
                            class="btn orange"
                            onclick="updateRequestStatus('${request.id}', 'accepted')"
                        >
                            ✅ Accept
                        </button>


                        <button
                            class="btn danger"
                            onclick="updateRequestStatus('${request.id}', 'rejected')"
                        >
                            ❌ Reject
                        </button>


                        <button
                            class="btn"
                            onclick="updateRequestStatus('${request.id}', 'processing')"
                        >
                            📦 Processing
                        </button>


                        <button
                            class="btn"
                            onclick="updateRequestStatus('${request.id}', 'out_for_delivery')"
                        >
                            🚚 Out for Delivery
                        </button>


                        <button
                            class="btn dark"
                            onclick="updateRequestStatus('${request.id}', 'delivered')"
                        >
                            📦 Delivered
                        </button>


                        <button
                            class="btn"
                            onclick="updateRequestStatus('${request.id}', 'completed')"
                        >
                            🏁 Completed
                        </button>

                    </div>

                </div>

            `;

        }).join("");
}


/* =========================================
   FIXED REQUEST STATUS UPDATE
========================================= */

window.updateRequestStatus =
async function (requestId, newStatus) {

    try {

        console.log(
            "Updating request:",
            requestId,
            newStatus
        );


        const confirmUpdate =
            confirm(
                "Change status to: " +
                newStatus.replaceAll("_", " ") +
                " ?"
            );


        if (!confirmUpdate) {
            return;
        }


        const {
            data,
            error
        } = await sb
            .from("requests")
            .update({
                status: newStatus
            })
            .eq("id", requestId)
            .select();


        if (error) {

            console.error(error);

            alert(
                "❌ Status update failed:\n\n" +
                error.message
            );

            return;
        }


        if (!data || data.length === 0) {

            alert(
                "❌ Status update नहीं हुआ। Permission या Request ID की समस्या हो सकती है।"
            );

            return;
        }


        alert(
            "✅ Status updated successfully!"
        );


        await loadRequests();

    } catch (error) {

        console.error(error);

        alert(
            "❌ ERROR:\n\n" +
            error.message
        );
    }
};


/* =========================================
   TABS
========================================= */

document
    .querySelectorAll(".tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".tab")
                    .forEach(button =>
                        button.classList.remove("active")
                    );


                document
                    .querySelectorAll(".panel")
                    .forEach(panel =>
                        panel.classList.remove("active")
                    );


                tab.classList.add("active");


                const panel =
                    document.getElementById(
                        tab.dataset.tab
                    );


                if (panel) {

                    panel.classList.add("active");
                }

            }
        );

    });


/* =========================================
   OPEN PUBLIC WEBSITE
========================================= */

$("openSite").addEventListener(
    "click",
    function () {

        if (!currentBusiness) {

            alert(
                "Please save your business first."
            );

            return;
        }


        window.open(
            "site.html?slug=" +
            encodeURIComponent(
                currentBusiness.slug
            ),
            "_blank"
        );

    }
);


/* =========================================
   LOGOUT
========================================= */

$("logout").addEventListener(
    "click",
    async function () {

        await sb.auth.signOut();

        location.href = "index.html";

    }
);


/* =========================================
   START
========================================= */

startDashboard();
