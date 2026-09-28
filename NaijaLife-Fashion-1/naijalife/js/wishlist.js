renderHeader("wishlist");
renderFooter();

function renderWishlist() {
  const ids = Wishlist.get();
  const grid = document.getElementById("wishGrid");
  const items = PRODUCTS.filter(p => ids.includes(p.id));
  if (!items.length) {
    grid.parentElement.innerHTML = emptyStateHTML({
      icon: "heart", title: "Your wishlist is empty",
      msg: "Save items you love and find them here later.",
      cta: "Browse Fashion", ctaHref: "shop.html"
    });
    mountIcons();
    return;
  }
  renderProductGrid(grid, items);
}
renderWishlist();
document.addEventListener("wishlist:change", renderWishlist);
