renderHeader("shop");
renderFooter();

const q = new URLSearchParams(location.search).get("q") || "";
document.getElementById("searchHeading").textContent = q ? `Results for "${q}"` : "Search";

let results = [];
if (q) {
  const query = q.toLowerCase();
  results = PRODUCTS.filter(p => (p.name + " " + p.category + " " + p.subcategory + " " + p.seller + " " + p.description).toLowerCase().includes(query));

  // save recent search
  const recentSearches = readLS("nl_recent_searches", []);
  if (!recentSearches.includes(q)) {
    writeLS("nl_recent_searches", [q, ...recentSearches].slice(0, 8));
  }
}

document.getElementById("searchCount").textContent = q ? `${results.length} product${results.length !== 1 ? "s" : ""} found` : "Enter a search term to find products.";

const grid = document.getElementById("searchGrid");
if (!q) {
  grid.parentElement.innerHTML = emptyStateHTML({
    icon: "search", title: "Start searching",
    msg: "Try “ankara”, “agbada”, “sneakers” or a designer name.",
    cta: "Browse all products", ctaHref: "shop.html"
  });
  mountIcons();
} else if (!results.length) {
  grid.parentElement.innerHTML = emptyStateHTML({
    icon: "search-x", title: `No results for "${q}"`,
    msg: "Try a different search term or browse our categories.",
    cta: "Browse Shop", ctaHref: "shop.html"
  });
  mountIcons();
} else {
  renderProductGrid(grid, results);
}
