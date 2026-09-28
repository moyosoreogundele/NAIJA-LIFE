renderHeader("cart");
renderFooter();

const main = document.getElementById("checkoutMain");
let step = 1;
const checkoutState = {
  fullName: Auth.currentUser()?.name || "",
  phone: Auth.currentUser()?.phone || "",
  state: "",
  city: "",
  address: "",
  landmark: "",
  deliveryMethod: "standard",
  paymentMethod: "demo",
};

function cartOrEmpty() {
  if (!Cart.get().length) {
    main.innerHTML = emptyStateHTML({
      icon: "shopping-bag", title: "Your cart is empty",
      msg: "Add items to your cart before checking out.",
      cta: "Start Shopping", ctaHref: "shop.html"
    });
    mountIcons();
    return false;
  }
  return true;
}

function stepsRowHTML() {
  const labels = ["Delivery Info", "Delivery Method", "Payment", "Confirmation"];
  return `<div class="steps-row">
    ${labels.map((l, i) => `<div class="step-pill ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}"><span class="label">${i + 1}. ${l}</span></div>`).join("")}
  </div>`;
}

function summaryHTML() {
  const items = Cart.get();
  const subtotal = Cart.subtotal();
  const deliveryFee = checkoutState.deliveryMethod === "express" ? 6000 : (subtotal > 100000 ? 0 : 3500);
  const total = subtotal + deliveryFee;
  return `
    <div class="checkout-card">
      <h3 class="display-3" style="font-size:1.2rem; margin-bottom:16px;">Order Summary</h3>
      ${items.map(i => `<div class="order-line"><span>${i.name} × ${i.qty}</span><span>${formatNaira(i.price * i.qty)}</span></div>`).join("")}
      <div class="order-line" style="border-top:1px solid var(--border); padding-top:12px;"><span>Subtotal</span><span>${formatNaira(subtotal)}</span></div>
      <div class="order-line"><span>Delivery</span><span>${deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}</span></div>
      <div class="order-line" style="color:var(--cream); font-weight:700; font-size:1rem; border-top:1px solid var(--border); padding-top:12px;"><span>Total</span><span>${formatNaira(total)}</span></div>
    </div>`;
}

function renderStep() {
  if (!cartOrEmpty()) return;
  let body = "";

  if (step === 1) {
    body = `
      <div class="checkout-card">
        <h3 class="display-3" style="font-size:1.3rem; margin-bottom:20px;">Delivery Information</h3>
        <div class="field-row">
          <div class="field"><label>Full name</label><input id="cFullName" value="${checkoutState.fullName}"></div>
          <div class="field"><label>Phone number</label><input id="cPhone" value="${checkoutState.phone}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>State</label>
            <select id="cState">
              <option value="">Select state</option>
              ${NIGERIAN_STATES.map(s => `<option ${s === checkoutState.state ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>City</label><input id="cCity" value="${checkoutState.city}" placeholder="e.g. Ikeja"></div>
        </div>
        <div class="field"><label>Delivery address</label><input id="cAddress" value="${checkoutState.address}" placeholder="Street address"></div>
        <div class="field"><label>Landmark (optional)</label><input id="cLandmark" value="${checkoutState.landmark}"></div>
        <div class="checkout-nav"><span></span><button class="btn btn-gold" id="nextBtn">Continue</button></div>
      </div>`;
  } else if (step === 2) {
    body = `
      <div class="checkout-card">
        <h3 class="display-3" style="font-size:1.3rem; margin-bottom:20px;">Delivery Method</h3>
        <label class="method-option ${checkoutState.deliveryMethod === "standard" ? "active" : ""}">
          <input type="radio" name="dm" value="standard" ${checkoutState.deliveryMethod === "standard" ? "checked" : ""}>
          <div><div class="title">Standard Delivery — 3–5 days</div><div class="desc">Free over ₦100,000, otherwise ${formatNaira(3500)}</div></div>
        </label>
        <label class="method-option ${checkoutState.deliveryMethod === "express" ? "active" : ""}">
          <input type="radio" name="dm" value="express" ${checkoutState.deliveryMethod === "express" ? "checked" : ""}>
          <div><div class="title">Express Delivery — 1–2 days</div><div class="desc">${formatNaira(6000)} flat rate</div></div>
        </label>
        <div class="checkout-nav"><button class="btn btn-outline" id="backBtn">Back</button><button class="btn btn-gold" id="nextBtn">Continue</button></div>
      </div>`;
  } else if (step === 3) {
    body = `
      <div class="checkout-card">
        <h3 class="display-3" style="font-size:1.3rem; margin-bottom:8px;">Payment Method</h3>
        <div class="demo-banner">This is a frontend demo. No real payment is processed — Paystack and Flutterwave secret keys can never be safely used from browser JavaScript. A production build requires a secure backend to handle payments.</div>
        <label class="method-option ${checkoutState.paymentMethod === "paystack" ? "active" : ""}">
          <input type="radio" name="pm" value="paystack" ${checkoutState.paymentMethod === "paystack" ? "checked" : ""}>
          <div><div class="title">Paystack (integration placeholder)</div><div class="desc">Requires backend integration — disabled in this demo</div></div>
        </label>
        <label class="method-option ${checkoutState.paymentMethod === "flutterwave" ? "active" : ""}">
          <input type="radio" name="pm" value="flutterwave" ${checkoutState.paymentMethod === "flutterwave" ? "checked" : ""}>
          <div><div class="title">Flutterwave (integration placeholder)</div><div class="desc">Requires backend integration — disabled in this demo</div></div>
        </label>
        <label class="method-option ${checkoutState.paymentMethod === "demo" ? "active" : ""}">
          <input type="radio" name="pm" value="demo" ${checkoutState.paymentMethod === "demo" ? "checked" : ""}>
          <div><div class="title">Demo Payment</div><div class="desc">Simulates a successful payment for this demo storefront</div></div>
        </label>
        <div class="checkout-nav"><button class="btn btn-outline" id="backBtn">Back</button><button class="btn btn-gold" id="placeOrderBtn">Place Order</button></div>
      </div>`;
  } else if (step === 4) {
    const orderNum = "NL" + Date.now().toString().slice(-8);
    body = `
      <div class="checkout-card text-center" style="padding:48px 28px;">
        <div class="conf-icon">${iconMarkup("check")}</div>
        <h2 class="display-3">Order placed successfully</h2>
        <p style="margin:12px auto 26px; max-width:38ch;">Your order <strong style="color:var(--gold-light);">#${orderNum}</strong> has been placed. You'll receive updates as it moves through processing.</p>
        <div class="flex" style="gap:12px; justify-content:center;">
          <a href="orders.html" class="btn btn-gold">Track Order</a>
          <a href="shop.html" class="btn btn-outline">Continue Shopping</a>
        </div>
      </div>`;
  }

  main.innerHTML = `<div class="checkout-layout"><div>${stepsRowHTML()}${body}</div><div>${step < 4 ? summaryHTML() : ""}</div></div>`;
  mountIcons();
  bindStepEvents(step === 4 ? null : undefined);
}

function bindStepEvents() {
  document.getElementById("nextBtn")?.addEventListener("click", () => {
    if (step === 1) {
      checkoutState.fullName = document.getElementById("cFullName").value.trim();
      checkoutState.phone = document.getElementById("cPhone").value.trim();
      checkoutState.state = document.getElementById("cState").value;
      checkoutState.city = document.getElementById("cCity").value.trim();
      checkoutState.address = document.getElementById("cAddress").value.trim();
      checkoutState.landmark = document.getElementById("cLandmark").value.trim();
      if (!checkoutState.fullName || !checkoutState.phone || !checkoutState.state || !checkoutState.city || !checkoutState.address) {
        toast("Please fill in all required delivery fields.", "error");
        return;
      }
    }
    if (step === 2) {
      checkoutState.deliveryMethod = document.querySelector('input[name="dm"]:checked')?.value || "standard";
    }
    step++;
    renderStep();
  });
  document.getElementById("backBtn")?.addEventListener("click", () => { step--; renderStep(); });
  document.querySelectorAll('input[name="dm"]').forEach(r => r.addEventListener("change", () => {
    document.querySelectorAll(".method-option").forEach(m => m.classList.remove("active"));
    r.closest(".method-option").classList.add("active");
  }));
  document.querySelectorAll('input[name="pm"]').forEach(r => r.addEventListener("change", () => {
    document.querySelectorAll(".method-option").forEach(m => m.classList.remove("active"));
    r.closest(".method-option").classList.add("active");
    checkoutState.paymentMethod = r.value;
  }));
  document.getElementById("placeOrderBtn")?.addEventListener("click", async event => {
    const selected = document.querySelector('input[name="pm"]:checked')?.value;
    if (selected !== "demo") {
      toast("Only Demo Payment is available in this frontend-only build.", "error");
      return;
    }
    const placeOrderButton = event.currentTarget;
    placeOrderButton.disabled = true;
    const items = Cart.get();
    const subtotal = Cart.subtotal();
    const deliveryFee = checkoutState.deliveryMethod === "express" ? 6000 : (subtotal > 100000 ? 0 : 3500);
    const user = Auth.currentUser();
    const order = {
      id: "NL" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      customer: { name: checkoutState.fullName, email: user?.email || "", phone: checkoutState.phone },
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      delivery: { ...checkoutState },
      status: "Order Placed",
      timeline: ["Order Placed"],
    };
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: order.customer,
          order: { ...order, items: items.map(({ name, size, color, qty, price }) => ({ name, size, color, qty, price })) },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The order could not be saved.");
    } catch (error) {
      const message = error instanceof TypeError
        ? "Can't reach the order server. Run the included server and retry."
        : error.message || "The order could not be saved.";
      toast(message, "error");
      placeOrderButton.disabled = false;
      return;
    }
    Orders.create(order);
    Cart.clear();
    toast("Order placed successfully", "success");
    step = 4;
    renderStep();
  });
}

renderStep();
