renderHeader("cart");
renderFooter();

function renderCart() {
  const items = Cart.get();
  const main = document.getElementById("cartMain");

  if (!items.length) {
    main.innerHTML = emptyStateHTML({
      icon: "shopping-bag", title: "Your cart is empty",
      msg: "Looks like you haven't added anything yet. Let's fix that.",
      cta: "Start Shopping", ctaHref: "shop.html"
    });
    mountIcons();
    return;
  }

  const subtotal = Cart.subtotal();
  const delivery = subtotal > 100000 ? 0 : 3500;
  const total = subtotal + delivery;

  main.innerHTML = `
    <div class="cart-layout">
      <div>
        <div id="cartItemList">
          ${items.map((i, idx) => `
            <div class="cart-item" data-idx="${idx}">
              <img src="${i.image}" alt="${i.name}">
              <div>
                <h4>${i.name}</h4>
                <div class="meta">Size: ${i.size} · Colour: ${i.color} · Sold by ${i.seller}</div>
                <div class="cart-item-actions">
                  <div class="qty-stepper">
                    <button class="qm">−</button>
                    <span>${i.qty}</span>
                    <button class="qp">+</button>
                  </div>
                  <button class="cart-item-remove"><i data-lucide="trash-2" style="width:14px;height:14px;"></i> Remove</button>
                </div>
              </div>
              <div class="cart-item-right">
                <strong>${formatNaira(i.price * i.qty)}</strong>
                <span class="meta">${formatNaira(i.price)} each</span>
              </div>
            </div>`).join("")}
        </div>
        <a href="shop.html" class="btn btn-outline" style="margin-top:20px;">${iconMarkup("arrow-left")} Continue Shopping</a>
      </div>
      <div class="summary-box">
        <h3 class="display-3" style="margin-bottom:18px;">Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${formatNaira(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${delivery === 0 ? "Free" : formatNaira(delivery)}</span></div>
        <div class="promo-row">
          <input type="text" placeholder="Promo code">
          <button class="btn btn-dark btn-sm">Apply</button>
        </div>
        <div class="summary-row total"><span>Total</span><span>${formatNaira(total)}</span></div>
        <a href="checkout.html" class="btn btn-gold btn-block" style="margin-top:18px;">Proceed to Checkout</a>
      </div>
    </div>
  `;
  mountIcons();

  document.getElementById("cartItemList").addEventListener("click", e => {
    const row = e.target.closest(".cart-item"); if (!row) return;
    const idx = +row.dataset.idx;
    const item = items[idx];
    if (e.target.closest(".qp")) Cart.updateQty(item.id, item.size, item.color, item.qty + 1);
    if (e.target.closest(".qm")) { if (item.qty > 1) Cart.updateQty(item.id, item.size, item.color, item.qty - 1); }
    if (e.target.closest(".cart-item-remove")) {
      Cart.remove(item.id, item.size, item.color);
      toast("Removed from cart", "success");
    }
    renderCart();
  });
}

renderCart();
document.addEventListener("cart:change", renderCart);
