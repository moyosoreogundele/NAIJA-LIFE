renderHeader("");
document.getElementById("site-footer") && renderFooter();

function setFieldError(fieldId, show) {
  document.getElementById(fieldId)?.classList.toggle("error", show);
}

const OTP_API = "/api/auth";

async function requestOtp(email, purpose) {
  let response;
  try {
    response = await fetch(`${OTP_API}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });
  } catch {
    throw new Error("Can't reach the verification server. Run the included server with `node server.js` and open http://localhost:8000; file:// and static Live Server previews do not support account verification.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Email verification is unavailable right now.");
  return result;
}

async function verifyOtp(email, code, purpose) {
  const response = await fetch(`${OTP_API}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, purpose }),
  });
  if (!response.ok) throw new Error("That verification code is invalid or expired.");
  return response.json();
}

function showOtpStep({ email, purpose, onVerified }) {
  const box = document.querySelector(".auth-box");
  if (!box) return;
  box.innerHTML = `
    <h1 class="display-3">Check your email</h1>
    <p class="sub">We sent a 6-digit verification code to <strong>${email}</strong>. Check your inbox or Spam folder.</p>
    <form id="otpForm" novalidate>
      <div class="field" id="otpField">
        <label for="otpCode">Verification code</label>
        <input type="text" id="otpCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" placeholder="000000" required>
        <div class="err-msg">Enter the valid 6-digit code.</div>
      </div>
      <button type="submit" class="btn btn-gold btn-block">Verify email</button>
    </form>
    <button type="button" class="btn btn-outline btn-block" id="resendOtpBtn" style="margin-top:12px;">Resend code</button>
    <p class="auth-switch"><button type="button" class="text-button" id="changeEmailBtn">Use a different email</button></p>`;

  document.getElementById("otpForm").addEventListener("submit", async event => {
    event.preventDefault();
    const code = document.getElementById("otpCode").value.trim();
    const valid = /^\d{6}$/.test(code);
    setFieldError("otpField", !valid);
    if (!valid) return;
    const submit = event.target.querySelector("button[type=submit]");
    submit.disabled = true;
    try {
      await verifyOtp(email, code, purpose);
      onVerified();
    } catch (error) {
      toast(error.message, "error");
      submit.disabled = false;
    }
  });
  document.getElementById("resendOtpBtn").addEventListener("click", async event => {
    event.target.disabled = true;
    try {
      await requestOtp(email, purpose);
      toast("A new code was sent.", "success");
    } catch (error) {
      toast(error.message, "error");
    }
    event.target.disabled = false;
  });
  document.getElementById("changeEmailBtn").addEventListener("click", () => location.reload());
}

/* ---- Login ---- */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  document.getElementById("pwToggle")?.addEventListener("click", () => togglePw("password", "pwToggle"));
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    let valid = true;
    if (!/^\S+@\S+\.\S+$/.test(email)) { setFieldError("emailField", true); valid = false; } else setFieldError("emailField", false);
    if (!valid) return;

    const result = Auth.login(email, password);
    if (!result.ok) {
      setFieldError("passField", true);
      toast(result.error, "error");
      return;
    }
    setFieldError("passField", false);
    requestOtp(email, "login").then(() => {
      showOtpStep({
        email,
        purpose: "login",
        onVerified: () => {
          Auth.setSession(result.user);
          toast("Login successful", "success");
          setTimeout(() => location.href = "profile.html", 500);
        },
      });
    }).catch(error => toast(error.message, "error"));
  });
}

/* ---- Register ---- */
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  document.getElementById("regPwToggle")?.addEventListener("click", () => togglePw("regPassword", "regPwToggle"));
  registerForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    let valid = true;

    setFieldError("nameField", !name); if (!name) valid = false;
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    setFieldError("regEmailField", !emailOk); if (!emailOk) valid = false;
    const passOk = password.length >= 8;
    setFieldError("regPassField", !passOk); if (!passOk) valid = false;
    const matchOk = password === confirm && confirm.length > 0;
    setFieldError("confirmField", !matchOk); if (!matchOk) valid = false;

    if (!valid) return;

    const users = readLS(LS.users, []);
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      toast("An account with this email already exists.", "error");
      return;
    }
    requestOtp(email, "register").then(() => {
      showOtpStep({
        email,
        purpose: "register",
        onVerified: () => {
          const result = Auth.register({ name, email, password, phone });
          if (!result.ok) { toast(result.error, "error"); return; }
          toast("Account created — welcome to NaijaLife!", "success");
          setTimeout(() => location.href = "profile.html", 500);
        },
      });
    }).catch(error => toast(error.message, "error"));
  });
}

function togglePw(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  const isPw = input.type === "password";
  input.type = isPw ? "text" : "password";
  btn.innerHTML = `<i data-lucide="${isPw ? "eye-off" : "eye"}"></i>`;
  mountIcons();
}
