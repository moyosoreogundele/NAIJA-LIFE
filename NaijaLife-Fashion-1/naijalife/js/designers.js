renderHeader("designers");
renderFooter();

const grid = document.getElementById("designerGridFull");
if (grid) {
  grid.innerHTML = DESIGNERS.map(d => `
    <a class="designer-card" href="designer.html?id=${d.id}">
      <div class="designer-cover">
        <img src="${d.cover}" alt="${d.name} cover" loading="lazy">
        <img class="designer-avatar" src="${d.logo}" alt="${d.name} logo">
      </div>
      <div class="designer-body">
        <h4>${d.name} ${d.verified ? '<i data-lucide="badge-check" class="verified-tick"></i>' : ""}</h4>
        <div class="loc"><i data-lucide="map-pin" style="width:12px;height:12px;display:inline;vertical-align:-2px;"></i> ${d.location} · ${d.rating} rating · ${PRODUCTS.filter(p => p.sellerId === d.id).length} products</div>
        <p class="bio">${d.bio}</p>
      </div>
    </a>`).join("");
  mountIcons();
}
