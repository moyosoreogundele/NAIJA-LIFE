const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, "utf8").split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  });
}

const PORT = Number(process.env.PORT || 8000);
const ROOT = __dirname;
const OTP_TTL_MS = 10 * 60 * 1000;
const ORDERS_FILE = process.env.ORDERS_FILE || path.join(ROOT, "orders.json");
const otpStore = new Map();
let orderWrites = Promise.resolve();

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1000000) req.destroy();
    });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); } catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function readOrders() {
  try {
    return JSON.parse(await fs.promises.readFile(ORDERS_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function cleanText(value, maxLength = 200) {
  return String(value || "").trim().slice(0, maxLength);
}

function adminAuthorized(req) {
  const expected = process.env.ADMIN_PASSWORD || "";
  const supplied = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!expected || !supplied) return false;
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && crypto.timingSafeEqual(expectedBytes, suppliedBytes);
}

async function sendOtp(email, code, purpose) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    throw new Error("Email delivery is not configured. Add RESEND_API_KEY and FROM_EMAIL to .env.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: purpose === "register" ? "Confirm your NaijaLife account" : "Your NaijaLife login code",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px"><h1>NaijaLife Fashion</h1><p>Your verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
    }),
  });
  if (!response.ok) throw new Error("Email provider rejected the message.");
}

async function handleApi(req, res) {
  const route = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (route === "/api/orders" && req.method === "POST") {
    let payload;
    try { payload = await readBody(req); } catch { json(res, 400, { error: "Invalid order request" }); return; }
    const body = payload && typeof payload === "object" ? payload : {};
    const input = body.order && typeof body.order === "object" ? body.order : {};
    const delivery = input.delivery || {};
    const items = Array.isArray(input.items) ? input.items : [];
    const amount = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
    if (!items.length || items.length > 100 || items.some(item => !item || typeof item !== "object") || [input.subtotal, input.deliveryFee, input.total].some(value => amount(value) === null)) {
      json(res, 400, { error: "Order details are incomplete or invalid." });
      return;
    }
    const order = {
      id: cleanText(input.id, 40),
      date: new Date().toISOString(),
      customer: {
        name: cleanText(body.customer?.name || delivery.fullName),
        email: cleanText(body.customer?.email, 254).toLowerCase(),
        phone: cleanText(body.customer?.phone || delivery.phone, 40),
      },
      items: items.map(item => ({
        name: cleanText(item.name, 200),
        size: cleanText(item.size, 40),
        color: cleanText(item.color, 80),
        qty: Math.max(1, Math.min(999, Math.floor(Number(item.qty) || 1))),
        price: amount(item.price) ?? 0,
      })),
      subtotal: amount(input.subtotal),
      deliveryFee: amount(input.deliveryFee),
      total: amount(input.total),
      delivery: {
        state: cleanText(delivery.state, 100),
        city: cleanText(delivery.city, 100),
        address: cleanText(delivery.address, 300),
        landmark: cleanText(delivery.landmark, 200),
        method: cleanText(delivery.deliveryMethod, 40),
      },
      status: "Order Placed",
    };
    if (!order.id || !order.items.every(item => item.name)) {
      json(res, 400, { error: "Order number and item names are required." });
      return;
    }
    orderWrites = orderWrites.catch(() => {}).then(async () => {
      const orders = await readOrders();
      orders.unshift(order);
      await fs.promises.mkdir(path.dirname(ORDERS_FILE), { recursive: true });
      await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
    });
    try {
      await orderWrites;
      json(res, 201, { ok: true, orderId: order.id });
    } catch {
      json(res, 500, { error: "The order could not be saved. Please try again." });
    }
    return;
  }
  if (route === "/api/admin/orders" && req.method === "GET") {
    if (!process.env.ADMIN_PASSWORD) {
      json(res, 503, { error: "Set ADMIN_PASSWORD in the server .env file to enable the admin orders view." });
      return;
    }
    if (!adminAuthorized(req)) { json(res, 401, { error: "Admin password is incorrect." }); return; }
    try { json(res, 200, { orders: await readOrders() }); }
    catch { json(res, 500, { error: "Orders could not be loaded." }); }
    return;
  }
  if (req.method !== "POST" || !["/api/auth/send-otp", "/api/auth/verify-otp"].includes(route)) {
    json(res, 404, { error: "Not found" });
    return;
  }
  let body;
  try { body = await readBody(req); } catch { json(res, 400, { error: "Invalid request" }); return; }
  const email = String(body.email || "").trim().toLowerCase();
  const purpose = body.purpose === "register" ? "register" : "login";
  if (!/^\S+@\S+\.\S+$/.test(email)) { json(res, 400, { error: "Valid email required" }); return; }

  if (route.endsWith("send-otp")) {
    const current = otpStore.get(`${purpose}:${email}`);
    if (current && Date.now() - current.sentAt < 30000) {
      json(res, 429, { error: "Please wait before requesting another code." });
      return;
    }
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    try {
      await sendOtp(email, code, purpose);
      otpStore.set(`${purpose}:${email}`, { digest: hash(code), sentAt: Date.now(), expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
      json(res, 200, { ok: true });
    } catch (error) {
      json(res, 503, { error: error.message });
    }
    return;
  }

  const record = otpStore.get(`${purpose}:${email}`);
  const code = String(body.code || "");
  if (!record || Date.now() > record.expiresAt || record.attempts >= 5 || !/^\d{6}$/.test(code)) {
    json(res, 400, { error: "That verification code is invalid or expired." });
    return;
  }
  record.attempts += 1;
  if (hash(code) !== record.digest) {
    json(res, 400, { error: "That verification code is invalid or expired." });
    return;
  }
  otpStore.delete(`${purpose}:${email}`);
  json(res, 200, { ok: true });
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".webmanifest": "application/manifest+json" };
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) { handleApi(req, res); return; }
  const requested = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const relative = requested === "/" ? "/index.html" : requested;
  const file = path.resolve(ROOT, `.${relative}`);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
server.listen(PORT, () => {
  console.log(`NaijaLife running at http://localhost:${PORT}`);
  console.log(process.env.RESEND_API_KEY && process.env.FROM_EMAIL
    ? "Email OTP delivery: enabled"
    : "Email OTP delivery: development mode. Add RESEND_API_KEY and FROM_EMAIL to .env");
});
