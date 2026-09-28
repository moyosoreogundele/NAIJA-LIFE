renderHeader("account");
renderFooter();

const root = document.getElementById("profileRoot");

if (!Auth.isLoggedIn()) {
  root.innerHTML = `
    <div class="empty-state">
      ${iconMarkup("user")}
      <h3>You're not logged in</h3>
      <p>Log in to view your profile, orders, wishlist and addresses.</p>
      <a href="login.html" class="btn btn-gold">Go to Login</a>
    </div>`;
  mountIcons();
} else {
  let tab = "info";
  const user = Auth.currentUser();

  function initials(name) { return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); }

  const NAV = [
    { id: "info", label: "Personal Information", icon: "user" },
    { id: "orders", label: "Orders", icon: "package" },
    { id: "wishlist", label: "Wishlist", icon: "heart" },
    { id: "addresses", label: "Addresses", icon: "map-pin" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  function render() {
    root.innerHTML = `
      <div class="profile-layout">
        <div class="profile-nav">
          ${NAV.map(n => `<button data-tab="${n.id}" class="${tab === n.id ? "active" : ""}">${iconMarkup(n.icon)} ${n.label}</button>`).join("")}
          <button class="logout" id="logoutBtn">${iconMarkup("log-out")} Log Out</button>
        </div>
        <div class="profile-card" id="profilePanel"></div>
      </div>`;
    mountIcons();
    renderPanel();
    root.querySelectorAll(".profile-nav button[data-tab]").forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
    document.getElementById("logoutBtn").addEventListener("click", () => {
      Auth.logout();
      toast("Logged out successfully", "success");
      setTimeout(() => location.href = "index.html", 400);
    });
  }

  function renderPanel() {
    const panel = document.getElementById("profilePanel");
    const u = Auth.currentUser();
    if (tab === "info") {
      panel.innerHTML = `
        <div class="avatar-row">
          <div class="avatar-circle">${initials(u.name)}</div>
          <div><strong style="color:var(--cream);">${u.name}</strong><br><span style="font-size:0.85rem;color:var(--gray);">${u.role === "customer" ? "Customer" : u.role} account</span></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Full name</label><input id="pName" value="${u.name}"></div>
          <div class="field"><label>Phone</label><input id="pPhone" value="${u.phone || ""}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Email</label><input value="${u.email}" disabled></div>
          <div class="field"><label>Location</label>
            <select id="pLocation">
              <option value="">Select state</option>
              ${NIGERIAN_STATES.map(s => `<option ${s === u.location ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </div>
        </div>
        <button class="btn btn-gold" id="saveProfileBtn">Save Changes</button>`;
      document.getElementById("saveProfileBtn").addEventListener("click", () => {
        Auth.updateProfile({ name: document.getElementById("pName").value.trim(), phone: document.getElementById("pPhone").value.trim(), location: document.getElementById("pLocation").value });
        toast("Profile updated", "success");
        render();
      });
    }
    if (tab === "orders") {
      const orders = Orders.get();
      panel.innerHTML = orders.length
        ? `<p style="margin-bottom:16px;">You have ${orders.length} order(s).</p><a href="orders.html" class="btn btn-outline">View all orders</a>`
        : emptyStateHTML({ icon: "package", title: "No orders yet", msg: "Start shopping to see your orders here.", cta: "Shop Now", ctaHref: "shop.html" });
      mountIcons();
    }
    if (tab === "wishlist") {
      const ids = Wishlist.get();
      panel.innerHTML = ids.length
        ? `<p style="margin-bottom:16px;">You have ${ids.length} item(s) saved.</p><a href="wishlist.html" class="btn btn-outline">View wishlist</a>`
        : emptyStateHTML({ icon: "heart", title: "Wishlist is empty", msg: "Save items you love to find them here.", cta: "Browse Fashion", ctaHref: "shop.html" });
      mountIcons();
    }
    if (tab === "addresses") {
      const addresses = readLS(LS.addresses, []);
      panel.innerHTML = `
        <div id="addrList">
          ${addresses.map((a, i) => `
            <div class="addr-card">
              <strong>${a.fullName}</strong>
              ${a.address}, ${a.city}, ${a.state}<br>${a.phone}
            </div>`).join("") || `<p style="margin-bottom:16px;">No saved addresses yet.</p>`}
        </div>
        <button class="btn btn-outline" id="addAddrBtn">${iconMarkup("plus")} Add New Address</button>`;
      mountIcons();
      document.getElementById("addAddrBtn").addEventListener("click", openAddAddressModal);
    }
    if (tab === "notifications") {
      const notifs = [
        { icon: "shopping-bag", text: "Welcome to NaijaLife Fashion — explore new arrivals from Nigerian designers." },
        { icon: "heart", text: "Items in your wishlist may sell out soon." },
        { icon: "tag", text: "New collection: Native Wear for the owambe season just dropped." },
      ];
      panel.innerHTML = notifs.map(n => `<div class="notif-item">${iconMarkup(n.icon)}<span>${n.text}</span></div>`).join("");
      mountIcons();
    }
    if (tab === "settings") {
      panel.innerHTML = `
        <div class="field"><label>Change password</label><input type="password" placeholder="New password"></div>
        <button class="btn btn-outline" style="margin-bottom:24px;">Update Password</button>
        <div style="border-top:1px solid var(--border); padding-top:20px;">
          <p style="margin-bottom:12px; color:var(--danger);">Danger zone</p>
          <button class="btn btn-outline" id="deleteAccBtn" style="border-color:var(--danger); color:var(--danger);">Delete Account</button>
        </div>`;
      document.getElementById("deleteAccBtn").addEventListener("click", () => {
        openModal(`<h3>Delete account?</h3><p class="sub">This will remove your demo session. This action cannot be undone.</p>
          <div class="flex gap-8"><button class="btn btn-outline btn-block" onclick="closeModal()">Cancel</button><button class="btn btn-gold btn-block" id="confirmDelete">Delete</button></div>`);
        document.getElementById("confirmDelete").addEventListener("click", () => {
          Auth.logout(); closeModal(); toast("Account session removed", "success");
          setTimeout(() => location.href = "index.html", 400);
        });
      });
    }
  }

  function openAddAddressModal() {
    openModal(`
      <h3>Add address</h3>
      <div class="field"><label>Full name</label><input id="aName"></div>
      <div class="field"><label>Phone</label><input id="aPhone"></div>
      <div class="field"><label>State</label><select id="aState"><option value="">Select state</option>${NIGERIAN_STATES.map(s => `<option>${s}</option>`).join("")}</select></div>
      <div class="field"><label>City</label><input id="aCity"></div>
      <div class="field"><label>Address</label><input id="aAddress"></div>
      <button class="btn btn-gold btn-block" id="saveAddrBtn">Save Address</button>`);
    document.getElementById("saveAddrBtn").addEventListener("click", () => {
      const a = {
        fullName: document.getElementById("aName").value.trim(),
        phone: document.getElementById("aPhone").value.trim(),
        state: document.getElementById("aState").value,
        city: document.getElementById("aCity").value.trim(),
        address: document.getElementById("aAddress").value.trim(),
      };
      if (!a.fullName || !a.phone || !a.state || !a.city || !a.address) { toast("Please fill in all fields.", "error"); return; }
      const list = readLS(LS.addresses, []); list.push(a); writeLS(LS.addresses, list);
      closeModal(); toast("Address saved", "success"); render();
    });
  }

  render();
}
