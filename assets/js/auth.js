// ==========================================
// BizBoost AI - Authentication System
// FIXED VERSION
// ==========================================

// Check Supabase
if (typeof supabase === "undefined") {
  console.error("Supabase library is not loaded.");
}

// Get Supabase client
const supabaseClient = supabase.createClient(
  "https://ywwojkvarygebbfwiymq.supabase.co",
  "sb_publishable_uUqW1tX4WdY1we6yj5PnuQ_KpYe_M17"
);


// ==========================================
// SESSION SETTINGS
// ==========================================

const SESSION_HOURS = 12;

function saveLoginTime() {
  const expiryTime = Date.now() + SESSION_HOURS * 60 * 60 * 1000;

  localStorage.setItem(
    "bizboost_session_expiry",
    expiryTime.toString()
  );
}

function isSessionExpired() {
  const expiry = localStorage.getItem(
    "bizboost_session_expiry"
  );

  if (!expiry) {
    return false;
  }

  if (Date.now() > Number(expiry)) {
    return true;
  }

  return false;
}


// ==========================================
// LOGIN
// ==========================================

async function loginUser(email, password) {

  try {

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      alert(error.message);
      return null;
    }

    saveLoginTime();

    return data;

  } catch (error) {

    console.error(error);
    alert("Login failed: " + error.message);

    return null;
  }
}


// ==========================================
// REGISTER
// ==========================================

async function registerUser(
  name,
  email,
  password,
  role = "owner"
) {

  try {

    const { data, error } =
      await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      });

    if (error) {
      alert(error.message);
      return null;
    }

    if (data.user) {

      const { error: profileError } =
        await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: name,
            role: role
          });

      if (profileError) {
        console.error(profileError);
      }
    }

    alert(
      "Registration successful! You can now login."
    );

    return data;

  } catch (error) {

    console.error(error);

    alert(
      "Registration failed: " + error.message
    );

    return null;
  }
}


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser() {

  try {

    await supabaseClient.auth.signOut();

    localStorage.removeItem(
      "bizboost_session_expiry"
    );

    localStorage.removeItem(
      "bizboost_business_id"
    );

    window.location.href = "../login.html";

  } catch (error) {

    console.error(error);

    window.location.href = "../login.html";
  }
}


// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentUser() {

  const {
    data,
    error
  } = await supabaseClient.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkLogin() {

  if (isSessionExpired()) {

    await supabaseClient.auth.signOut();

    localStorage.removeItem(
      "bizboost_session_expiry"
    );

    return null;
  }

  const user = await getCurrentUser();

  return user;
}


// ==========================================
// LOGIN FORM HANDLER
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const loginForm =
      document.querySelector("#loginForm");

    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();

          const emailInput =
            document.querySelector("#email");

          const passwordInput =
            document.querySelector("#password");

          if (!emailInput || !passwordInput) {

            alert(
              "Email or Password field not found."
            );

            return;
          }

          const email =
            emailInput.value.trim();

          const password =
            passwordInput.value;

          if (!email || !password) {

            alert(
              "Please enter Email and Password."
            );

            return;
          }

          const loginButton =
            loginForm.querySelector(
              'button[type="submit"]'
            );

          if (loginButton) {

            loginButton.disabled = true;

            loginButton.innerText =
              "Logging in...";
          }

          const result =
            await loginUser(
              email,
              password
            );

          if (result && result.user) {

            const userId =
              result.user.id;

            const { data: profile } =
              await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .maybeSingle();

            if (
              profile &&
              profile.is_blocked === true
            ) {

              alert(
                "Your account has been blocked."
              );

              await supabaseClient.auth.signOut();

              return;
            }

            // Admin Login
            if (
              profile &&
              profile.role === "admin"
            ) {

              window.location.href =
                "admin/dashboard.html";

              return;
            }

            // Customer Login
            if (
              profile &&
              profile.role === "customer"
            ) {

              window.location.href =
                "customer.html";

              return;
            }

            // Business Owner Login
            window.location.href =
              "dashboard/dashboard.html";
          }

          if (loginButton) {

            loginButton.disabled = false;

            loginButton.innerText =
              "Login";
          }
        }
      );
    }
  }
);


// ==========================================
// REGISTER FORM HANDLER
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const registerForm =
      document.querySelector("#registerForm");

    if (registerForm) {

      registerForm.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();

          const nameInput =
            document.querySelector("#name");

          const emailInput =
            document.querySelector("#email");

          const passwordInput =
            document.querySelector("#password");

          const roleInput =
            document.querySelector("#role");

          if (
            !nameInput ||
            !emailInput ||
            !passwordInput
          ) {

            alert(
              "Registration fields not found."
            );

            return;
          }

          const name =
            nameInput.value.trim();

          const email =
            emailInput.value.trim();

          const password =
            passwordInput.value;

          let role = "owner";

          if (roleInput) {
            role = roleInput.value;
          }

          if (
            !name ||
            !email ||
            !password
          ) {

            alert(
              "Please fill all required fields."
            );

            return;
          }

          const button =
            registerForm.querySelector(
              'button[type="submit"]'
            );

          if (button) {

            button.disabled = true;

            button.innerText =
              "Creating Account...";
          }

          const result =
            await registerUser(
              name,
              email,
              password,
              role
            );

          if (result) {

            window.location.href =
              "login.html";

            return;
          }

          if (button) {

            button.disabled = false;

            button.innerText =
              "Create Account";
          }
        }
      );
    }
  }
);


// ==========================================
// MAKE FUNCTIONS AVAILABLE GLOBALLY
// ==========================================

window.loginUser = loginUser;

window.registerUser = registerUser;

window.logoutUser = logoutUser;

window.getCurrentUser = getCurrentUser;

window.checkLogin = checkLogin;
