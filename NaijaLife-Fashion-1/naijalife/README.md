# NaijaLife Fashion

**Your Style. Your Nigeria.**

A Nigerian fashion marketplace demo, built with plain HTML, CSS and vanilla JavaScript — no framework or build step. The included Node.js server provides email verification and shared order storage.

## What's included

- Homepage, full shop with filters/sort, product detail pages, cart, wishlist
- Login / register (demo accounts and profiles stored in localStorage, with email OTP verification)
- Multi-step checkout with a clearly-labelled **Demo Payment** flow
- Order history with a visual status timeline
- Designer directory and individual designer storefronts
- Global search, product reviews, category pages (Men, Women, Kids, Shoes, Bags, Accessories, Native Wear, Streetwear, Agbada, Ankara, Aso-Ebi, Sale)
- Fully responsive, dark luxury theme with gold accents, down to 320px

The storefront includes PWA install support, email OTP verification, and an admin page for viewing orders placed through the shared server. Seller tools and live payment processing are not included.

## How to run it

Just open `index.html` in any modern browser — double-click the file, or drag it into a browser window. Every page links correctly relative to the others.

**Run with the included server** (required for PWA service workers and OTP API):
- Install Node.js 18 or newer.
- For real email OTP, set `RESEND_API_KEY` and `FROM_EMAIL` in the server environment.
- Copy `.env.example` to `.env`, set a long unique `ADMIN_PASSWORD`, and use a sender address verified in your Resend account.
- Run `node server.js` from this folder, then visit `http://localhost:8000`.
- Open `http://localhost:8000/admin-orders.html` and enter `ADMIN_PASSWORD` to see orders from all customers using this server.
- Use the install icon in the header or the browser's install option after opening the site over `http://localhost` or HTTPS.

Without those email variables, the server remains in development mode and does not deliver an email. Configure Resend before using login or registration with real users.

The frontend calls `POST /api/auth/send-otp` and `POST /api/auth/verify-otp`. The server keeps only hashed, short-lived codes in memory, limits attempts, and sends messages through Resend. Orders are written to the ignored `orders.json` file and the admin list requires the server password. No email or admin credentials belong in browser JavaScript.

**Alternative static preview:** storefront browsing works with these options, but checkout cannot save shared orders and email verification is unavailable without the included Node server.
- VS Code: install the "Live Server" extension, right-click `index.html` → "Open with Live Server"
- Python: `python3 -m http.server 8000` from this folder, then visit `http://localhost:8000`

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | customer@naijalife.demo | Customer123 |
| Seller | seller@naijalife.demo | Seller123 |
| Admin | admin@naijalife.demo | Admin123 |

You can also register a new account — it's stored in your browser's localStorage.

## How localStorage is used

Accounts, sessions, cart, wishlist, addresses, and reviews live in the browser's `localStorage`. Customer order history is kept there too, while a copy of each new order is sent to the included server so the admin page can show all customers' orders.

**Demo limitations:** the order store is a local JSON file and the admin password is a simple shared secret; this is not suitable for public production hosting. A production service needs authenticated customer accounts, a managed database, access controls, backups, HTTPS, and server-verified payment processing. The demo payment option does not charge customers.

## Replacing demo images

Product and designer demo images are generated as self-contained SVG data URLs in `js/data.js`, while the homepage and auth artwork live in `assets/images/`. To use real photography:
1. Drop files into `assets/images/products/`, `assets/images/designers/`, etc.
2. Update the relevant `images` / `logo` / `cover` fields in `js/data.js` to point at those local paths instead.
 
The Yoruba traditional-wear demo photos in `assets/images/products/` were downloaded from Wikimedia Commons. See the original file pages for the applicable author and license details: [Yoruba groom in agbada](https://commons.wikimedia.org/wiki/File:A_Nigerian_Yoruba_groom_in_an_Agbada_made_from_Ebira_fabric.jpg), [Yoruba aso-oke and agbada couple](https://commons.wikimedia.org/wiki/File:A_Nigerian_Yoruba_woman_in_a_lace_Buba_blouse,_with_Ipele_and_the_gele_headtie_made_from_contemporary_Aso_Oke_and_A_man_in_Agbada.jpg), [Yoruba man in agbada](https://commons.wikimedia.org/wiki/File:A_Yoruba_man_in_agbada.jpg), and [children in agbada](https://commons.wikimedia.org/wiki/File:Boys_wearing_the_traditional_african_attire_called_Agbada.jpeg).

## File structure

```
index.html, shop.html, product.html, login.html, register.html,
cart.html, checkout.html, wishlist.html, orders.html, profile.html,
designers.html, designer.html, search.html, 404.html
pages/            → category pages (men, women, kids, shoes, bags, ...)
css/style.css      → design system (tokens, layout, components)
css/auth.css        → auth page tweaks
js/data.js          → demo products, designers, Nigerian states
js/app.js           → cart, wishlist, auth, toasts, modals, header/footer
js/filters.js, product.js, cart.js, wishlist.js, checkout.js,
js/orders.js, profile.js, designers.js, search.js, category.js, auth.js
```

## Icons

Icons are rendered with [Lucide](https://lucide.dev) loaded via CDN (`unpkg.com/lucide`).
