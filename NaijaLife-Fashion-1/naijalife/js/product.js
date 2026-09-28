renderHeader("");
renderFooter();

const pid = +new URLSearchParams(location.search).get("id");
const product = PRODUCTS.find(p => p.id === pid);
const container = document.getElementById("pdContainer");

if (!product) {
  container.innerHTML = emptyStateHTML({
    icon: "package-x", title: "Product not found",
    msg: "This item may have been removed or the link is incorrect.",
    cta: "Back to shop", ctaHref: "shop.html"
  });
  mountIcons();
} else {
  document.title = `${product.name} — NaijaLife Fashion`;
  Recent.add(product.id);
  let selSize = product.sizes[0];
  let selColor = product.colors[0];
  let qty = 1;
  let activeImg = 0;

  const reviews = getProductReviews(product.id);
  const avgBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star, pct: Math.max(6, Math.round(Math.random() * 40) + (star >= 4 ? 30 : 0))
  }));

  container.innerHTML = `
    <div class="breadcrumb" style="margin-top:20px;">
      <a href="index.html">Home</a> <i data-lucide="chevron-right" style="width:13px;height:13px;"></i>
      <a href="shop.html">Shop</a> <i data-lucide="chevron-right" style="width:13px;height:13px;"></i>
      <span>${product.name}</span>
    </div>
    <div class="pd-layout">
      <div>
        <div class="pd-gallery-main"><img id="mainImg" src="${product.images[0]}" alt="${product.name}"></div>
        <div class="pd-thumbs" id="thumbRow">
          ${product.images.map((img, i) => `<img src="${img}" class="${i === 0 ? "active" : ""}" data-i="${i}" alt="${product.name} view ${i + 1}">`).join("")}
        </div>
      </div>
      <div>
        <div class="pd-seller-line"><i data-lucide="store" style="width:14px;height:14px;"></i> <a href="designer.html?id=${product.sellerId}">${product.seller}</a> · ${product.location}</div>
        <h1 class="display-3">${product.name}</h1>
        <div class="pd-rating">${iconMarkup("star")} ${product.rating} · ${product.reviews} reviews · <span style="color:${product.stock > 5 ? "var(--success)" : "var(--warning)"}">${product.stock > 5 ? "In stock" : `Only ${product.stock} left`}</span></div>
        <div class="pd-price-row">
          <span class="now">${formatNaira(product.price)}</span>
          ${product.oldPrice ? `<span class="old">${formatNaira(product.oldPrice)}</span><span class="badge badge-sale">-${product.discount}%</span>` : ""}
        </div>

        <div class="option-block">
          <div class="label-row"><span>Size: <span id="selSizeLabel">${selSize}</span></span> <button onclick="openSizeGuide()">Size guide</button></div>
          <div class="opt-row" id="sizeRow">
            ${product.sizes.map(s => `<button class="opt-chip ${s === selSize ? "active" : ""}" data-size="${s}">${s}</button>`).join("")}
          </div>
        </div>

        <div class="option-block">
          <div class="label-row"><span>Colour: ${selColor}</span></div>
          <div class="opt-row" id="colorRow">
            ${product.colors.map(c => `<button class="opt-chip ${c === selColor ? "active" : ""}" data-color="${c}">${c}</button>`).join("")}
          </div>
        </div>

        <div class="option-block">
          <div class="label-row"><span>Quantity</span></div>
          <div class="qty-stepper">
            <button id="qtyMinus">−</button>
            <span id="qtyVal">1</span>
            <button id="qtyPlus">+</button>
          </div>
        </div>

        <div class="pd-actions">
          <button class="btn btn-gold" id="addToCartBtn">Add to Cart</button>
          <button class="btn btn-dark" id="buyNowBtn">Buy Now</button>
          <button class="btn-icon wishlist-btn ${Wishlist.has(product.id) ? "active" : ""}" id="pdWishBtn" style="width:52px;height:52px;">${iconMarkup("heart")}</button>
        </div>

        <div class="pd-meta-row">
          <div class="item">${iconMarkup("truck")} Delivery in 2–5 days</div>
          <div class="item">${iconMarkup("rotate-ccw")} 7-day returns</div>
          <div class="item">${iconMarkup("shield-check")} Verified seller</div>
        </div>

        <div class="tabs">
          <div class="tab-btns">
            <button class="active" data-tab="details">Details</button>
            <button data-tab="reviews">Reviews (${reviews.length})</button>
            <button data-tab="seller">Seller</button>
          </div>
          <div class="tab-panel active" data-panel="details">
            <p>${product.description}</p>
            <p style="margin-top:12px;">Category: ${product.category} · ${product.subcategory}</p>
          </div>
          <div class="tab-panel" data-panel="reviews">
            <div style="margin-bottom:18px;">
              ${avgBreakdown.map(b => `<div class="rating-bar-row"><span>${b.star}★</span><div class="rating-bar-track"><div class="rating-bar-fill" style="width:${b.pct}%"></div></div></div>`).join("")}
            </div>
            <button class="btn btn-outline btn-sm" id="writeReviewBtn" style="margin-bottom:16px;">Write a review</button>
            <div id="reviewList">
              ${reviews.map(r => `
                <div class="review-item">
                  <div class="review-head"><span>${r.name}</span><span class="rating-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span></div>
                  <p>${r.comment}</p>
                </div>`).join("")}
            </div>
          </div>
          <div class="tab-panel" data-panel="seller">
            <p>Sold by <strong style="color:var(--cream);">${product.seller}</strong>, based in ${product.location}.</p>
            <a href="designer.html?id=${product.sellerId}" class="btn btn-outline btn-sm" style="margin-top:14px;">Visit store</a>
          </div>
        </div>
      </div>
    </div>
  `;
  mountIcons();

  document.getElementById("thumbRow").addEventListener("click", e => {
    const img = e.target.closest("img"); if (!img) return;
    activeImg = +img.dataset.i;
    document.getElementById("mainImg").src = product.images[activeImg];
    document.querySelectorAll("#thumbRow img").forEach(i => i.classList.remove("active"));
    img.classList.add("active");
  });

  document.getElementById("sizeRow").addEventListener("click", e => {
    const btn = e.target.closest(".opt-chip"); if (!btn) return;
    selSize = btn.dataset.size;
    document.querySelectorAll("#sizeRow .opt-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("selSizeLabel").textContent = selSize;
  });
  document.getElementById("colorRow").addEventListener("click", e => {
    const btn = e.target.closest(".opt-chip"); if (!btn) return;
    selColor = btn.dataset.color;
    document.querySelectorAll("#colorRow .opt-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
  document.getElementById("qtyMinus").addEventListener("click", () => { qty = Math.max(1, qty - 1); document.getElementById("qtyVal").textContent = qty; });
  document.getElementById("qtyPlus").addEventListener("click", () => { qty = Math.min(product.stock, qty + 1); document.getElementById("qtyVal").textContent = qty; });

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    Cart.add(product, selSize, selColor, qty);
    toast(`${product.name} added to cart`, "success");
  });
  document.getElementById("buyNowBtn").addEventListener("click", () => {
    Cart.add(product, selSize, selColor, qty);
    location.href = "checkout.html";
  });
  document.getElementById("pdWishBtn").addEventListener("click", (e) => {
    const active = Wishlist.toggle(product.id);
    e.currentTarget.classList.toggle("active", active);
    toast(active ? "Added to wishlist" : "Removed from wishlist", "success");
  });

  document.querySelectorAll(".tab-btns button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btns button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("active");
    });
  });

  document.getElementById("writeReviewBtn").addEventListener("click", openReviewModal);

  // Related products
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  document.getElementById("relatedGrid").innerHTML = related.map(productCardHTML).join("");
  mountIcons();
}

function getProductReviews(id) {
  const all = readLS(LS.reviews, {});
  if (all[id]) return all[id];
  const seeded = REVIEW_SAMPLES.slice(0, 3).map((c, i) => ({
    name: ["Amaka O.", "Tunde B.", "Fatima A."][i],
    rating: 4 + (i % 2),
    comment: c,
  }));
  all[id] = seeded;
  writeLS(LS.reviews, all);
  return seeded;
}

function openReviewModal() {
  if (!Auth.isLoggedIn()) {
    openModal(`<h3>Login required</h3><p class="sub">Please log in to write a review.</p><a href="login.html" class="btn btn-gold btn-block">Go to Login</a>`);
    return;
  }
  openModal(`
    <h3>Write a review</h3>
    <p class="sub">Share your experience with ${product.name}</p>
    <div class="field">
      <label>Rating</label>
      <div class="opt-row" id="starPicker">
        ${[1,2,3,4,5].map(n => `<button type="button" class="opt-chip star-opt" data-star="${n}">${n}★</button>`).join("")}
      </div>
    </div>
    <div class="field">
      <label>Your review</label>
      <textarea rows="4" id="reviewText" placeholder="Tell us about the fit, fabric and delivery..."></textarea>
    </div>
    <button class="btn btn-gold btn-block" id="submitReview">Submit Review</button>
  `);
  let chosenStar = 5;
  document.getElementById("starPicker").addEventListener("click", e => {
    const b = e.target.closest(".star-opt"); if (!b) return;
    chosenStar = +b.dataset.star;
    document.querySelectorAll(".star-opt").forEach(s => s.classList.remove("active"));
    b.classList.add("active");
  });
  document.getElementById("submitReview").addEventListener("click", () => {
    const text = document.getElementById("reviewText").value.trim();
    if (!text) { toast("Please write a comment first.", "error"); return; }
    const all = readLS(LS.reviews, {});
    all[product.id] = all[product.id] || [];
    all[product.id].unshift({ name: Auth.currentUser().name, rating: chosenStar, comment: text });
    writeLS(LS.reviews, all);
    closeModal();
    toast("Review submitted — thank you!", "success");
    document.getElementById("reviewList").insertAdjacentHTML("afterbegin", `
      <div class="review-item"><div class="review-head"><span>${Auth.currentUser().name}</span><span class="rating-stars">${"★".repeat(chosenStar)}${"☆".repeat(5 - chosenStar)}</span></div><p>${text}</p></div>`);
  });
}

function openSizeGuide() {
  openModal(`
    <h3>Size guide</h3>
    <p class="sub">General fit guide — sizing may vary slightly by seller.</p>
    <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:var(--gray);">
      <thead><tr style="text-align:left; color:var(--cream);"><th style="padding:8px 0;">Size</th><th>Chest (in)</th><th>Waist (in)</th></tr></thead>
      <tbody>
        <tr><td style="padding:8px 0;">S</td><td>36</td><td>30</td></tr>
        <tr><td style="padding:8px 0;">M</td><td>39</td><td>33</td></tr>
        <tr><td style="padding:8px 0;">L</td><td>42</td><td>36</td></tr>
        <tr><td style="padding:8px 0;">XL</td><td>45</td><td>39</td></tr>
        <tr><td style="padding:8px 0;">XXL</td><td>48</td><td>42</td></tr>
      </tbody>
    </table>
  `);
}
