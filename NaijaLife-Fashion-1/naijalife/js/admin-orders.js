renderHeader("");
renderFooter();

const adminForm = document.getElementById("adminLoginForm");
const adminMessage = document.getElementById("adminMessage");
const ordersPanel = document.getElementById("ordersPanel");
let adminPassword = "";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function renderAdminOrders(orders) {
  const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  document.getElementById("ordersSummary").textContent = `${orders.length} order(s) · Recorded order value ${formatNaira(total)}`;
  const list = document.getElementById("ordersList");
  if (!orders.length) {
    list.innerHTML = '<p class="admin-muted">No orders have been placed yet.</p>';
    return;
  }
  list.innerHTML = orders.map(order => {
    const customer = order.customer || {};
    const delivery = order.delivery || {};
    const orderItems = Array.isArray(order.items) ? order.items : [];
    const date = new Date(order.date);
    const formattedDate = Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
    return `<article class="admin-order">
      <div class="admin-order-head">
        <h2>Order #${escapeHTML(order.id)} <span class="admin-muted">· ${escapeHTML(order.status || "Order Placed")}</span></h2>
        <time>${escapeHTML(formattedDate)}</time>
      </div>
      <div class="admin-order-meta">
        <div><strong>${escapeHTML(customer.name || "Customer")}</strong><br>
          <span class="admin-muted">${escapeHTML(customer.email || "No email provided")} · ${escapeHTML(customer.phone || "No phone provided")}</span>
        </div>
        <strong class="admin-order-total">${formatNaira(order.total)}</strong>
      </div>
      <ul class="admin-order-items">${orderItems.map(item => `<li><span>${escapeHTML(item.name)}${item.size ? ` · ${escapeHTML(item.size)}` : ""}${item.color ? ` · ${escapeHTML(item.color)}` : ""} × ${escapeHTML(item.qty)}</span><span>${formatNaira(Number(item.price || 0) * Number(item.qty || 1))}</span></li>`).join("")}</ul>
      <p class="admin-address">Deliver to ${escapeHTML([delivery.address, delivery.city, delivery.state].filter(Boolean).join(", ") || "No delivery address")}${delivery.landmark ? ` · Landmark: ${escapeHTML(delivery.landmark)}` : ""}</p>
    </article>`;
  }).join("");
}

async function loadAdminOrders(password) {
  const response = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${password}` } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Orders could not be loaded.");
  adminPassword = password;
  adminMessage.textContent = "";
  ordersPanel.hidden = false;
  renderAdminOrders(result.orders || []);
  mountIcons();
}

adminForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = adminForm.querySelector("button[type=submit]");
  button.disabled = true;
  adminMessage.textContent = "Loading orders…";
  try {
    await loadAdminOrders(document.getElementById("adminPassword").value);
  } catch (error) {
    adminPassword = "";
    ordersPanel.hidden = true;
    adminMessage.textContent = error.message || "Can't reach the order server.";
  } finally {
    button.disabled = false;
  }
});

document.getElementById("refreshOrdersBtn").addEventListener("click", async () => {
  try { await loadAdminOrders(adminPassword); }
  catch (error) { adminMessage.textContent = error.message || "Orders could not be refreshed."; }
});

document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  adminPassword = "";
  document.getElementById("adminPassword").value = "";
  ordersPanel.hidden = true;
  adminMessage.textContent = "Admin view locked.";
});
