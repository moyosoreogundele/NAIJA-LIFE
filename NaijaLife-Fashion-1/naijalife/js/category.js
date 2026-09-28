/* Generic category filter — reads config from <body data-*> attributes:
   data-mode="category" | "subcategory" | "sale"
   data-value="Men" (matched against product.category or product.subcategory)
*/
renderHeader(document.body.dataset.nav || "");
renderFooter();

const mode = document.body.dataset.mode;
const value = document.body.dataset.value;

let list = PRODUCTS.slice();
if (mode === "category") list = list.filter(p => p.category === value);
if (mode === "subcategory") list = list.filter(p => p.subcategory === value);
if (mode === "sale") list = list.filter(p => p.discount > 0);

const grid = document.getElementById("catGrid");
const countEl = document.getElementById("catCount");
if (countEl) countEl.textContent = `${list.length} product${list.length !== 1 ? "s" : ""}`;

const sortSelect = document.getElementById("catSort");
function applySort() {
  let sorted = list.slice();
  const v = sortSelect ? sortSelect.value : "featured";
  switch (v) {
    case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
    case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
    case "rating": sorted.sort((a, b) => b.rating - a.rating); break;
    case "newest": sorted = sorted.filter(p => p.newArrival).concat(sorted.filter(p => !p.newArrival)); break;
    default: sorted.sort((a, b) => b.featured - a.featured);
  }
  renderProductGrid(grid, sorted);
}
sortSelect?.addEventListener("change", applySort);
applySort();
