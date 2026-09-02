const params = new URLSearchParams(window.location.search);

const businessSlug = params.get("slug");

let businessData = null;

let requestType = null;

let selectedItemName = null;


/* ===============================
   LOAD BUSINESS
================================ */

async function loadBusinessWebsite() {

  if (!businessSlug) {

    document.getElementById("loading").innerHTML =
      "Business website not found.";

    return;
  }


  const { data: business, error } = await db
    .from("businesses")
    .select("*")
    .eq("slug", businessSlug)
    .eq("status", "Active")
    .maybeSingle();


  if (error) {

    console.error(error);

    document.getElementById("loading").innerHTML =
      "Unable to load business.";

    return;
  }


  if (!business) {

    document.getElementById("loading").innerHTML =
      "Business website not found.";

    return;
  }


  businessData = business;


  /* ===============================
     HEADER
  ================================ */

  document.getElementById("headerBusinessName").textContent =
    business.name || "Business";


  document.getElementById("headerCategory").textContent =
    business.category || "Professional Business";


  document.getElementById("businessName").textContent =
    business.name || "Business";


  document.getElementById("businessTagline").textContent =
    business.tagline || "";


  document.getElementById("footerBusinessName").textContent =
    business.name || "Business";


  /* ===============================
     ABOUT
  ================================ */

  document.getElementById("businessAbout").textContent =
    business.about ||
    "Welcome to our business. We provide quality products and professional services.";


  /* ===============================
     CONTACT
  ================================ */

  const phone = business.phone || "-";

  const whatsapp = business.whatsapp || "-";

  const address = business.address || "-";


  document.getElementById("contactPhone").textContent = phone;

  document.getElementById("contactWhatsapp").textContent = whatsapp;

  document.getElementById("contactAddress").textContent = address;


  document.getElementById("businessContact").textContent =
    [phone, whatsapp, address]
      .filter(x => x && x !== "-")
      .join(" • ");


  document.getElementById("footerContact").textContent =
    phone !== "-" ? "Contact: " + phone : "";


  /* ===============================
     LOGO
  ================================ */

  if (business.logo_url) {

    const headerLogo =
      document.getElementById("headerLogo");

    const heroLogo =
      document.getElementById("heroLogo");


    headerLogo.src = business.logo_url;

    heroLogo.src = business.logo_url;


    headerLogo.classList.add("show");


    document
      .getElementById("logoPlaceholder")
      .style.display = "none";

  } else {

    const firstLetter =
      (business.name || "B")
        .charAt(0)
        .toUpperCase();


    document.getElementById(
      "logoPlaceholder"
    ).textContent = firstLetter;


    document.getElementById(
      "heroLogo"
    ).style.display = "none";

  }


  /* ===============================
     PAGE TITLE
  ================================ */

  document.title =
    (business.name || "Business") +
    " | Official Website";


  /* ===============================
     LOAD PRODUCTS
  ================================ */

  await loadProducts();


  /* ===============================
     LOAD SERVICES
  ================================ */

  await loadServices();


  /* ===============================
     SHOW WEBSITE
  ================================ */

  document.getElementById("loading").style.display =
    "none";


  document.getElementById("websiteContent").style.display =
    "block";

}


/* ===============================
   LOAD PRODUCTS
================================ */

async function loadProducts() {

  const productsContainer =
    document.getElementById("products");


  const { data: products, error } = await db
    .from("products")
    .select("*")
    .eq("business_id", businessData.id)
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(error);

    productsContainer.innerHTML =
      "<p>Unable to load products.</p>";

    return;
  }


  if (!products || products.length === 0) {

    productsContainer.innerHTML =
      "<p>No products available right now.</p>";

    return;
  }


  productsContainer.innerHTML =
    products.map(product => {

      const image = product.image_url
        ? `
          <img
            src="${escapeHtml(product.image_url)}"
            class="business-product-image"
            alt="${escapeHtml(product.name)}"
          >
        `
        : `
          <div
            class="business-product-image"
            style="
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:55px;
            "
          >
            🛍️
          </div>
        `;


      return `

        <div class="business-product-card">

          ${image}

          <div class="business-card-body">

            <h3>
              ${escapeHtml(product.name)}
            </h3>

            <p>
              ${escapeHtml(
                product.description || ""
              )}
            </p>

            <div class="business-price">

              ₹${Number(
                product.price || 0
              ).toLocaleString("en-IN")}

            </div>

            <button
              class="business-action"
              onclick='openRequest(
                "order",
                ${JSON.stringify(product.name)}
              )'
            >
              Order Now
            </button>

          </div>

        </div>

      `;

    }).join("");

}


/* ===============================
   LOAD SERVICES
================================ */

async function loadServices() {

  const servicesContainer =
    document.getElementById("services");


  const { data: services, error } = await db
    .from("services")
    .select("*")
    .eq("business_id", businessData.id)
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(error);

    servicesContainer.innerHTML =
      "<p>Unable to load services.</p>";

    return;
  }


  if (!services || services.length === 0) {

    servicesContainer.innerHTML =
      "<p>No services available right now.</p>";

    return;
  }


  servicesContainer.innerHTML =
    services.map(service => {

      return `

        <div class="service-card">

          <div class="service-icon">
            🛠️
          </div>

          <h3>
            ${escapeHtml(service.name)}
          </h3>

          <p>
            ${escapeHtml(
              service.description || ""
            )}
          </p>

          <div class="business-price">

            ₹${Number(
              service.price || 0
            ).toLocaleString("en-IN")}

          </div>

          <button
            class="business-action"
            onclick='openRequest(
              "appointment",
              ${JSON.stringify(service.name)}
            )'
          >
            Book Appointment
          </button>

        </div>

      `;

    }).join("");

}


/* ===============================
   OPEN REQUEST
================================ */

function openRequest(type, itemName) {

  requestType = type;

  selectedItemName = itemName;


  document.getElementById(
    "modalTitle"
  ).textContent =
    type === "order"
      ? "Place Your Order"
      : "Book Appointment";


  document.getElementById(
    "selectedItem"
  ).textContent =
    "Selected: " + itemName;


  document.getElementById(
    "requestMessage"
  ).textContent = "";


  document.getElementById(
    "requestModal"
  ).classList.add("show");

}


/* ===============================
   CLOSE MODAL
================================ */

function closeRequest() {

  document.getElementById(
    "requestModal"
  ).classList.remove("show");

}


/* ===============================
   SUBMIT REQUEST
================================ */

async function submitRequest() {

  const name =
    document
      .getElementById("customerName")
      .value
      .trim();


  const phone =
    document
      .getElementById("customerPhone")
      .value
      .trim();


  const message =
    document
      .getElementById("customerMessage")
      .value
      .trim();


  const messageBox =
    document.getElementById(
      "requestMessage"
    );


  if (!name) {

    messageBox.textContent =
      "Please enter your name.";

    messageBox.style.color = "red";

    return;

  }


  messageBox.textContent =
    "Submitting...";

  messageBox.style.color =
    "#475467";


  const {
    data: { user }
  } = await db.auth.getUser();


  let result;


  /* ===============================
     PRODUCT ORDER
  ================================ */

  if (requestType === "order") {

    result = await db
      .from("orders")
      .insert({

        business_id:
          businessData.id,

        customer_id:
          user ? user.id : null,

        customer_name:
          name,

        item_name:
          selectedItemName,

        status:
          "Pending"

      });

  }


  /* ===============================
     APPOINTMENT
  ================================ */

  else {

    result = await db
      .from("appointments")
      .insert({

        business_id:
          businessData.id,

        customer_id:
          user ? user.id : null,

        customer_name:
          name,

        service_name:
          selectedItemName,

        message:
          "Phone: " +
          phone +
          " | " +
          message,

        status:
          "Pending"

      });

  }


  if (result.error) {

    console.error(result.error);


    messageBox.textContent =
      result.error.message;


    messageBox.style.color =
      "red";


    return;

  }


  messageBox.textContent =
    "✅ Your request has been submitted successfully!";


  messageBox.style.color =
    "green";


  document
    .getElementById("customerName")
    .value = "";


  document
    .getElementById("customerPhone")
    .value = "";


  document
    .getElementById("customerMessage")
    .value = "";


  setTimeout(() => {

    closeRequest();

  }, 1800);

}


/* ===============================
   ESCAPE HTML
================================ */

function escapeHtml(text) {

  if (text === null ||
      text === undefined) {

    return "";

  }


  return String(text)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


/* ===============================
   START WEBSITE
================================ */

document.addEventListener(
  "DOMContentLoaded",
  loadBusinessWebsite
);
