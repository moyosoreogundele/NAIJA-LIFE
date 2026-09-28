/* ============================================================
   NAIJALIFE FASHION — DEMO DATA
   All data below is static demo data held in memory + localStorage.
   Replace the `img()` output with local files in assets/images/products
   when real photography is available — see README.
   ============================================================ */

function img(seed, w = 700, h = 900) {
  const palette = ["#151515", "#243b36", "#4b2632", "#2d3348", "#6b4e2e"];
  const accent = palette[seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length];
  const safeSeed = seed.replace(/[^a-z0-9-]/gi, "").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <path d="M0 ${h * 0.72}L${w * 0.36} ${h * 0.36}L${w * 0.62} ${h * 0.58}L${w} ${h * 0.18}V${h}H0Z" fill="#d4af37" opacity=".16"/>
    <path d="M0 ${h * 0.18}L${w * 0.28} ${h * 0.48}L${w * 0.56} ${h * 0.28}L${w} ${h * 0.68}" fill="none" stroke="#f0d889" stroke-width="${Math.max(2, w / 160)}" opacity=".38"/>
    <text x="50%" y="48%" fill="#f0d889" font-family="Georgia,serif" font-size="${Math.max(18, w / 24)}" text-anchor="middle">NAIJALIFE</text>
    <text x="50%" y="54%" fill="#ffffff" opacity=".72" font-family="sans-serif" font-size="${Math.max(10, w / 55)}" letter-spacing="3" text-anchor="middle">${safeSeed}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

const PRODUCT_IMAGE_FILES = {
  "Native Wear": ["fashion-men-1.jpg", "fashion-men-2.jpg", "fashion-men-3.jpg"],
  "Women": ["fashion-women-1.jpg", "fashion-women-2.jpg", "fashion-women-3.jpg", "fashion-women-4.jpg", "fashion-women-5.jpg"],
  "Streetwear": ["fashion-street-1.jpg", "fashion-street-2.jpg", "fashion-street-3.jpg"],
  "Shoes": ["fashion-shoes-1.jpg", "fashion-shoes-2.jpg", "fashion-shoes-3.jpg"],
  "Bags": ["fashion-bags-1.jpg", "fashion-bags-2.jpg", "fashion-bags-3.jpg"],
  "Kids": ["fashion-kids-1.jpg", "kids.jpg"],
  "Accessories": ["fashion-accessories-1.jpg", "fashion-accessories-2.jpg", "accessories.jpg"],
  "Men": ["fashion-men-1.jpg", "fashion-men-2.jpg", "fashion-men-3.jpg"],
};

function productImage(category, subcategory = "", variant = 0) {
  const root = location.pathname.includes("/pages/") ? "../" : "";
  let files = PRODUCT_IMAGE_FILES[category] || PRODUCT_IMAGE_FILES["Native Wear"];
  if (category === "Kids" && subcategory === "Agbada") {
    files = ["boys-agbada.jpg"];
  } else if (subcategory === "Agbada") {
    files = ["yoruba-agbada-mgkente.jpg"];
  } else if (subcategory === "Senator") {
    files = ["yoruba-agbada-pinterest.jpg"];
  } else if (category === "Native Wear" && subcategory === "Kaftan") {
    files = ["yoruba-agbada-groom.jpg"];
  } else if (subcategory === "Aso-Ebi") {
    files = ["yoruba-asooke-couple.jpg", "fashion-women-4.jpg", "fashion-women-5.jpg"];
  } else if (category === "Accessories" && subcategory === "Jewelry") {
    files = ["women-jewelry-1.jpg", "women-jewelry-2.jpg"];
  } else if (category === "Accessories" && subcategory === "Eyewear") {
    files = ["women-sunglasses.jpg"];
  } else if (category === "Accessories" && subcategory === "Headwear") {
    files = ["women-headwear.jpg"];
  }
  const file = files[variant % files.length];
  return `${root}assets/images/products/${file}`;
}

const CATEGORIES = [
  { slug: "men", name: "Men", cover: productImage("Men") },
  { slug: "women", name: "Women", cover: productImage("Women") },
  { slug: "kids", name: "Kids", cover: productImage("Kids") },
  { slug: "shoes", name: "Shoes", cover: productImage("Shoes") },
  { slug: "bags", name: "Bags", cover: productImage("Bags") },
  { slug: "accessories", name: "Accessories", cover: productImage("Accessories") },
  { slug: "native-wear", name: "Native Wear", cover: productImage("Native Wear") },
  { slug: "streetwear", name: "Streetwear", cover: productImage("Streetwear") },
];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara"
];

const DESIGNERS = [
  { id: 1, name: "Lagos Threads", slug: "lagos-threads", location: "Lagos", verified: true,
    logo: img("dsg1", 200, 200), cover: img("dsgc1", 1200, 500), rating: 4.8,
    bio: "Contemporary tailoring rooted in Yoruba textile heritage, reworked for the modern wardrobe." },
  { id: 2, name: "Kaduna Atelier", slug: "kaduna-atelier", location: "Kaduna", verified: true,
    logo: img("dsg2", 200, 200), cover: img("dsgc2", 1200, 500), rating: 4.6,
    bio: "Structured native wear for men who want their agbada to move like a suit." },
  { id: 3, name: "Delta Ankara Co.", slug: "delta-ankara", location: "Warri", verified: false,
    logo: img("dsg3", 200, 200), cover: img("dsgc3", 1200, 500), rating: 4.5,
    bio: "Bold ankara prints cut into silhouettes you actually want to wear twice." },
  { id: 4, name: "Abuja House of Style", slug: "abuja-house-of-style", location: "Abuja", verified: true,
    logo: img("dsg4", 200, 200), cover: img("dsgc4", 1200, 500), rating: 4.9,
    bio: "Aso-ebi and occasion wear for the wedding season that never really ends." },
  { id: 5, name: "PH Streetwear Lab", slug: "ph-streetwear-lab", location: "Port Harcourt", verified: false,
    logo: img("dsg5", 200, 200), cover: img("dsgc5", 1200, 500), rating: 4.4,
    bio: "Graphic tees and utility fits made for Naija streets, not showrooms." },
  { id: 6, name: "Ibadan Leathercraft", slug: "ibadan-leathercraft", location: "Ibadan", verified: true,
    logo: img("dsg6", 200, 200), cover: img("dsgc6", 1200, 500), rating: 4.7,
    bio: "Hand-finished leather bags and footwear built to age well, not fall apart." },
];

const SIZES_CLOTHING = ["S", "M", "L", "XL", "XXL"];
const SIZES_SHOES = ["40", "41", "42", "43", "44", "45"];

/* Product blueprint: [name, category, subcategory, basePrice, seller, sizes, colors, tags] */
const PRODUCT_SEED = [
  ["Premium Agbada Grand Boubou", "Native Wear", "Agbada", 145000, "Kaduna Atelier", SIZES_CLOTHING, ["Black Gold", "Ivory", "Burgundy"]],
  ["Hand-Embroidered Senator Set", "Native Wear", "Senator", 85000, "Lagos Threads", SIZES_CLOTHING, ["Navy", "Black", "White"]],
  ["Ankara Wrap Maxi Dress", "Women", "Ankara", 42000, "Delta Ankara Co.", SIZES_CLOTHING, ["Orange Print", "Blue Print", "Green Print"]],
  ["Aso-Ebi Corset Lace Gown", "Women", "Aso-Ebi", 98000, "Abuja House of Style", SIZES_CLOTHING, ["Champagne", "Wine", "Emerald"]],
  ["Silk-Feel Kaftan Robe", "Native Wear", "Kaftan", 56000, "Kaduna Atelier", SIZES_CLOTHING, ["Sapphire", "Cream", "Charcoal"]],
  ["Naija Pride Graphic Hoodie", "Streetwear", "Hoodie", 28000, "PH Streetwear Lab", SIZES_CLOTHING, ["Black", "Grey", "Olive"]],
  ["Lagos Nights Bomber Jacket", "Streetwear", "Jacket", 46500, "PH Streetwear Lab", SIZES_CLOTHING, ["Black", "Tan"]],
  ["Ankara Print Bucket Hat Set", "Accessories", "Headwear", 12500, "Delta Ankara Co.", ["One Size"], ["Multicolor A", "Multicolor B"]],
  ["Woven Leather Loafers", "Shoes", "Loafers", 62000, "Ibadan Leathercraft", SIZES_SHOES, ["Brown", "Black"]],
  ["Classic White Sneakers", "Shoes", "Sneakers", 38000, "Lagos Threads", SIZES_SHOES, ["White", "White/Gold"]],
  ["Full-Grain Leather Crossbody Bag", "Bags", "Crossbody", 54000, "Ibadan Leathercraft", ["One Size"], ["Tan", "Black", "Cognac"]],
  ["Structured Designer Handbag", "Bags", "Handbag", 76000, "Abuja House of Style", ["One Size"], ["Black", "Red", "Cream"]],
  ["Adire Print Two-Piece Set", "Women", "Adire", 39500, "Delta Ankara Co.", SIZES_CLOTHING, ["Indigo", "Rust"]],
  ["Native Shirt & Trouser Combo", "Men", "Native Shirt", 47000, "Kaduna Atelier", SIZES_CLOTHING, ["White", "Blue Stripe", "Cream"]],
  ["Danshiki Casual Top", "Men", "Danshiki", 26000, "Lagos Threads", SIZES_CLOTHING, ["Black", "Navy", "Grey"]],
  ["Kids Ankara Party Dress", "Kids", "Dress", 18500, "Delta Ankara Co.", ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], ["Pink Print", "Yellow Print"]],
  ["Kids Native Agbada Set", "Kids", "Agbada", 24000, "Kaduna Atelier", ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], ["White", "Sky Blue"]],
  ["Beaded Coral Necklace Set", "Accessories", "Jewelry", 15500, "Abuja House of Style", ["One Size"], ["Red Coral", "Gold Tone"]],
  ["Gold-Plated Layered Chain", "Accessories", "Jewelry", 21000, "Lagos Threads", ["One Size"], ["Gold"]],
  ["Oversize Retro Sunglasses", "Accessories", "Eyewear", 9800, "PH Streetwear Lab", ["One Size"], ["Black", "Tortoise"]],
  ["Ankara Statement Blazer", "Women", "Blazer", 58000, "Delta Ankara Co.", SIZES_CLOTHING, ["Green Print", "Purple Print"]],
  ["Lace Aso-Ebi Blouse & Wrapper", "Women", "Aso-Ebi", 88000, "Abuja House of Style", SIZES_CLOTHING, ["Gold", "Silver", "Peach"]],
  ["Tailored Agbada Waistcoat", "Native Wear", "Agbada", 62000, "Kaduna Atelier", SIZES_CLOTHING, ["Black", "Brown"]],
  ["Streetwear Cargo Pants", "Streetwear", "Trousers", 32000, "PH Streetwear Lab", SIZES_CLOTHING, ["Khaki", "Black"]],
  ["Naija Flag Graphic Tee", "Streetwear", "T-Shirt", 15000, "PH Streetwear Lab", SIZES_CLOTHING, ["White", "Black", "Green"]],
  ["Leather Ankle Boots", "Shoes", "Boots", 68000, "Ibadan Leathercraft", SIZES_SHOES, ["Black", "Brown"]],
  ["Slide Sandals", "Shoes", "Sandals", 17500, "Lagos Threads", SIZES_SHOES, ["Black", "White", "Gold"]],
  ["Mini Ankara Clutch", "Bags", "Clutch", 21500, "Delta Ankara Co.", ["One Size"], ["Red Print", "Blue Print"]],
  ["Leather Weekender Duffel", "Bags", "Duffel", 89000, "Ibadan Leathercraft", ["One Size"], ["Brown", "Black"]],
  ["Kids Streetwear Tracksuit", "Kids", "Tracksuit", 22000, "PH Streetwear Lab", ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], ["Grey", "Navy"]],
  ["Boys Senator Set", "Kids", "Senator", 26500, "Kaduna Atelier", ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], ["White", "Black"]],
  ["Premium Agbada — Wedding Edition", "Native Wear", "Agbada", 210000, "Abuja House of Style", SIZES_CLOTHING, ["Ivory Gold", "Royal Blue"]],
  ["Ankara Jumpsuit", "Women", "Ankara", 45500, "Delta Ankara Co.", SIZES_CLOTHING, ["Orange", "Teal"]],
  ["Kente-Inspired Scarf", "Accessories", "Scarf", 11000, "Lagos Threads", ["One Size"], ["Multicolor"]],
  ["Men's Leather Belt", "Accessories", "Belt", 13500, "Ibadan Leathercraft", ["One Size"], ["Black", "Brown"]],
  ["Fila Traditional Cap", "Accessories", "Headwear", 9500, "Kaduna Atelier", ["One Size"], ["Black", "Ivory"]],
  ["Ankara Print Backpack", "Bags", "Backpack", 34500, "Delta Ankara Co.", ["One Size"], ["Multicolor A", "Multicolor B"]],
  ["Chunky Sneaker Boots", "Shoes", "Sneakers", 47000, "PH Streetwear Lab", SIZES_SHOES, ["Black", "White"]],
  ["Senator Two-Piece — Wine", "Native Wear", "Senator", 76000, "Lagos Threads", SIZES_CLOTHING, ["Wine", "Black"]],
  ["Kaftan Print Robe", "Men", "Kaftan", 51000, "Kaduna Atelier", SIZES_CLOTHING, ["Print A", "Print B"]],
  ["Ankara Head Wrap (Gele)", "Accessories", "Headwear", 8500, "Delta Ankara Co.", ["One Size"], ["Red", "Gold", "Purple"]],
  ["Women's Leather Tote", "Bags", "Tote", 71000, "Ibadan Leathercraft", ["One Size"], ["Tan", "Black"]],
  ["Native Print Overshirt", "Men", "Overshirt", 33500, "Lagos Threads", SIZES_CLOTHING, ["Print A", "Print B"]],
  ["Kids Bow Sandals", "Kids", "Sandals", 9500, "Ibadan Leathercraft", ["8Y", "9Y", "10Y", "11Y"], ["White", "Pink"]],
  ["Streetwear Denim Jacket", "Streetwear", "Jacket", 41000, "PH Streetwear Lab", SIZES_CLOTHING, ["Blue Wash", "Black Wash"]],
  ["Ankara Fitted Corset Top", "Women", "Ankara", 27500, "Delta Ankara Co.", SIZES_CLOTHING, ["Yellow Print", "Blue Print"]],
  ["Formal Native Shoes", "Shoes", "Formal", 58500, "Ibadan Leathercraft", SIZES_SHOES, ["Black", "Brown"]],
  ["Waist Beads Set", "Accessories", "Jewelry", 6500, "Abuja House of Style", ["One Size"], ["Gold", "Multicolor"]],
  ["Lagos Skyline Cap", "Streetwear", "Headwear", 9800, "PH Streetwear Lab", ["One Size"], ["Black", "Navy"]],
  ["Premium Ankara Shirt", "Men", "Ankara", 29500, "Delta Ankara Co.", SIZES_CLOTHING, ["Print C", "Print D"]],
];

function buildProducts() {
  return PRODUCT_SEED.map((p, i) => {
    const [name, category, subcategory, price, seller, sizes, colors] = p;
    const id = i + 1;
    const discount = [0, 0, 0, 10, 15, 20][id % 6];
    const oldPrice = discount ? Math.round((price / (1 - discount / 100)) / 100) * 100 : null;
    const designer = DESIGNERS.find(d => d.name === seller) || DESIGNERS[0];
    return {
      id,
      name,
      category,
      subcategory,
      price,
      oldPrice,
      discount,
      rating: +(3.9 + ((id * 37) % 11) / 10).toFixed(1),
      reviews: 8 + ((id * 53) % 240),
      seller,
      sellerId: designer.id,
      location: designer.location,
      images: [productImage(category, subcategory, id - 1), productImage(category, subcategory, id), productImage(category, subcategory, id + 1)],
      sizes,
      colors,
      stock: 3 + ((id * 17) % 40),
      description: `${name} by ${seller}. Crafted for everyday confidence with a distinctly Nigerian point of view — considered fabric, considered fit, made to be worn often.`,
      featured: id % 5 === 0,
      bestseller: id % 4 === 0,
      newArrival: id % 3 === 0,
    };
  });
}

const PRODUCTS = buildProducts();

const DEMO_ACCOUNTS = [
  { name: "Ada Customer", email: "customer@naijalife.demo", password: "Customer123", role: "customer" },
  { name: "Site Admin", email: "admin@naijalife.demo", password: "Admin123", role: "admin" },
  { name: "Chidi Seller", email: "seller@naijalife.demo", password: "Seller123", role: "seller" },
];

const REVIEW_SAMPLES = [
  "Fit was true to size and the fabric feels premium. Delivered to Lekki in 3 days.",
  "Colour is even better in person. Already ordered a second one.",
  "Good quality for the price but sizing runs slightly large — order one size down.",
  "Exactly as pictured. Seller was responsive when I asked about the fabric.",
  "My go-to for owambe season now. Compliments every time I wear it.",
];
