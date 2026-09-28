renderHeader("account");
renderFooter();

const ALL_STATUSES = ["Order Placed", "Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];

function renderOrders() {
  const orders = Orders.get();
  const main = document.getElementById("ordersMain");
  if (!orders.length) {
    main.innerHTML = emptyStateHTML({
      icon: "package", title: "No orders yet",
      msg: "Your order history will show up here once you make a purchase.",
      cta: "Start Shopping", ctaHref: "shop.html"
    });
    mountIcons();
    return;
  }

  main.innerHTML = orders.map(o => {
    const currentIdx = ALL_STATUSES.indexOf(o.status);
    return `
    <div class="order-card">
      <div class="order-top">
        <div><div class="num">Order #${o.id}</div><div class="date">${new Date(o.date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</div></div>
        <span class="status-pill">${o.status}</span>
      </div>
      <div class="order-items-mini">
        ${o.items.slice(0, 5).map(i => `<img src="${i.image}" alt="${i.name}">`).join("")}
      </div>
      <div style="font-size:0.85rem; color:var(--gray); margin-bottom:14px;">${o.items.length} item(s) · Total ${formatNaira(o.total)} · Deliver to ${o.delivery.city}, ${o.delivery.state}</div>
      <div class="timeline">
        ${ALL_STATUSES.map((s, i) => `
          <div class="tl-step">
            <div class="tl-dot ${i <= currentIdx ? "done" : ""}">${i <= currentIdx ? '<i data-lucide="check" style="width:11px;height:11px;color:#080808;"></i>' : ""}</div>
            <div class="tl-label ${i <= currentIdx ? "done" : ""}">${s}</div>
          </div>`).join("")}
      </div>
    </div>`;
  }).join("");
  mountIcons();
}
renderOrders();
