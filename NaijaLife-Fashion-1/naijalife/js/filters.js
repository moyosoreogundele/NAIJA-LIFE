/* Shop page: filtering, sorting, search-param handling */
renderHeader("shop");
renderFooter();

const state = {
  categories: new Set(),
  sizes: new Set(),
  sellers: new Set(),
  minPrice: null,
  maxPrice: null,
  minRating: 0,
  saleOnly: false,
  sort: "featured",
  q: "",
};

const params = new URLSearchParams(location.search);
if (params.get("category")) state.categories.add(params.get("category"));
if (params.get("q")) state.q = params.get("q");
if (params.get("sort")) state.sort = params.get("sort");
if (params.get("sale") === "1") state.saleOnly = true;

const allCategories = [...new Set(PRODUCTS.map(p => p.category))];
const allSizes = [...new Set(PRODUCTS.flatMap(p => p.sizes))].filter(s => s !== "One Size").slice(0, 8);
const allSellers = [...new Set(PRODUCTS.map(p => p.seller))];

document.getElementById("categoryFilters").innerHTML = allCategories.map(c => `
  <label class="filter-option">
    <input type="checkbox" value="${c}" class="cat-cb" ${state.categories.has(c) ? "checked" : ""}> ${c}
  </label>`).join("");

document.getElementById("sizeFilters").innerHTML = allSizes.map(s => `
  <button type="button" class="swatch size-sw" data-size="${s}">${s}</button>`).join("");

document.getElementById("sellerFilters").innerHTML = allSellers.map(s => `
  <label class="filter-option">
    <input type="checkbox" value="${s}" class="seller-cb"> ${s}
  </label>`).join("");

document.getElementById("sortSelect").value = state.sort;

function applyFilters() {
  let list = PRODUCTS.slice();

  if (state.q) {
    const q = state.q.toLowerCase();
    list = list.filter(p => (p.name + p.category + p.seller + p.description).toLowerCase().includes(q));
  }
  if (state.categories.size) list = list.filter(p => state.categories.has(p.category));
  if (state.sizes.size) list = list.filter(p => p.sizes.some(s => state.sizes.has(s)));
  if (state.sellers.size) list = list.filter(p => state.sellers.has(p.seller));
  if (state.minPrice != null) list = list.filter(p => p.price >= state.minPrice);
  if (state.maxPrice != null) list = list.filter(p => p.price <= state.maxPrice);
  if (state.minRating) list = list.filter(p => p.rating >= state.minRating);
  if (state.saleOnly) list = list.filter(p => p.discount > 0);

  switch (state.sort) {
    case "newest": list = list.filter(p => p.newArrival).concat(list.filter(p => !p.newArrival)); break;
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "rating": list.sort((a, b) => b.rating - a.rating); break;
    case "popular": list.sort((a, b) => b.reviews - a.reviews); break;
    default: list.sort((a, b) => (b.featured - a.featured)); break;
  }

  document.getElementById("resultCount").textContent = `${list.length} product${list.length !== 1 ? "s" : ""}`;
  const grid = document.getElementById("shopGrid");
  showSkeletons(grid, Math.min(8, list.length || 4));
  setTimeout(() => renderProductGrid(grid, list), 220);
}

document.querySelectorAll(".cat-cb").forEach(cb => cb.addEventListener("change", () => {
  cb.checked ? state.categories.add(cb.value) : state.categories.delete(cb.value);
  applyFilters();
}));
document.querySelectorAll(".seller-cb").forEach(cb => cb.addEventListener("change", () => {
  cb.checked ? state.sellers.add(cb.value) : state.sellers.delete(cb.value);
  applyFilters();
}));
document.querySelectorAll(".size-sw").forEach(btn => btn.addEventListener("click", () => {
  const s = btn.dataset.size;
  btn.classList.toggle("active");
  state.sizes.has(s) ? state.sizes.delete(s) : state.sizes.add(s);
  applyFilters();
}));
document.getElementById("minPrice").addEventListener("input", e => { state.minPrice = e.target.value ? +e.target.value : null; applyFilters(); });
document.getElementById("maxPrice").addEventListener("input", e => { state.maxPrice = e.target.value ? +e.target.value : null; applyFilters(); });
document.querySelectorAll('input[name="rating"]').forEach(r => r.addEventListener("change", () => { state.minRating = +r.value; applyFilters(); }));
document.getElementById("saleOnly").addEventListener("change", e => { state.saleOnly = e.target.checked; applyFilters(); });
document.getElementById("sortSelect").addEventListener("change", e => { state.sort = e.target.value; applyFilters(); });

function clearFilters() {
  state.categories.clear(); state.sizes.clear(); state.sellers.clear();
  state.minPrice = null; state.maxPrice = null; state.minRating = 0; state.saleOnly = false; state.q = "";
  document.querySelectorAll(".cat-cb, .seller-cb").forEach(cb => cb.checked = false);
  document.querySelectorAll(".size-sw").forEach(b => b.classList.remove("active"));
  document.getElementById("minPrice").value = "";
  document.getElementById("maxPrice").value = "";
  document.getElementById("saleOnly").checked = false;
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  applyFilters();
}
document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

document.getElementById("openFilters").addEventListener("click", () => {
  document.getElementById("filtersPanel").classList.add("drawer-open");
  document.getElementById("closeFilters").style.display = "inline-flex";
});
document.getElementById("closeFilters").addEventListener("click", () => {
  document.getElementById("filtersPanel").classList.remove("drawer-open");
});

applyFilters();
mountIcons();
