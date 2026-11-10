// ====== EDIT THESE ======
// Where the backend lives. Change this to your live backend URL when you deploy.
const API_URL = "http://localhost:3100";
const WHATSAPP_NUMBER = "919999999999"; // country code + number, no + or spaces
const EMAIL = "21kb1a05h1@nbkrist.org";
const PAGE_SIZE = 20; // paintings shown before "Show more"
// ========================

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "kalamkari", label: "Kalamkari" },
  { key: "temple", label: "Temple Art" },
  { key: "muggu", label: "Muggu" },
  { key: "festival", label: "Festivals" },
  { key: "nature", label: "Nature" },
];
const STORE_CATS = [
  { key: "all", label: "All" },
  { key: "canvas", label: "Canvases" },
  { key: "colours", label: "Colours" },
  { key: "tools", label: "Brushes & Tools" },
  { key: "kits", label: "Kits" },
];
const PIGMENTS = [
  ["Kumkum", "#c2243f"], ["Pasupu", "#f2a007"], ["Neelam", "#3a4fd0"], ["Pachcha", "#1a8f66"], ["Gulabi", "#e6007e"],
  ["Sindoor", "#e8452c"], ["Jamun", "#7b2cbf"], ["Peacock", "#0f8b8d"], ["Chandanam", "#f3dcb8"], ["Charcoal", "#2b1022"],
];
const RECIPES = [
  { name: "Monsoon Evening", note: "Deep blue, jamun and a whisper of sandal. Calm, rainy and a little mysterious.", colors: ["#3a4fd0", "#7b2cbf", "#0f8b8d", "#f3dcb8"] },
  { name: "Festival Doorstep", note: "Kumkum, turmeric and rose for a morning full of muggu and marigolds.", colors: ["#c2243f", "#f2a007", "#e6007e", "#fff0c9"] },
  { name: "Konaseema Green", note: "Layered greens and teal, like palm shadows on a quiet canal.", colors: ["#1a8f66", "#0f8b8d", "#8fd9a8", "#f3dcb8"] },
  { name: "Golden Hour Gopuram", note: "Orange and vermilion fading into rose and plum.", colors: ["#f2a007", "#e8452c", "#e6007e", "#7b2cbf"] },
  { name: "Paddy and Sky", note: "Soft green fields under a pale morning sky.", colors: ["#9bcf53", "#1a8f66", "#8fb8ff", "#fff7e0"] },
  { name: "Night Jasmine", note: "Midnight blue, cream and a touch of gold, for moonlit scenes.", colors: ["#1f2a6b", "#3a4fd0", "#f3dcb8", "#f2a007"] },
];
const QUOTE_NOTE = "Kalanjali";

const $ = (id) => document.getElementById(id);
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
const wa = (t) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;
const mail = (s, b) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
const api = (p) => fetch(API_URL + p).then((r) => r.json());
const labelOf = (list, k) => (list.find((c) => c.key === k) || {}).label || k;
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

$("wa-general").href = wa("Hello! I'd love to know more about your paintings.");

// scroll reveal
const io = new IntersectionObserver(
  (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("show"), io.unobserve(e.target))),
  { threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// mobile menu
$("burger").addEventListener("click", () => $("menu").classList.toggle("open"));
$("menu").addEventListener("click", () => $("menu").classList.remove("open"));

/* ================= PAINTINGS ================= */
let paintings = [], active = "all", shown = PAGE_SIZE;

api("/api/paintings").then((list) => {
  paintings = list;
  $("count").textContent = list.length;
  renderHero();
  renderTabs();
  renderGrid();
}).catch(() => {
  $("grid").innerHTML = "<p class='muted'>Could not load paintings. Start the backend (<b>cd backend</b>, then <b>npm start</b>) and refresh.</p>";
});

function renderHero() {
  const featured = paintings.find((p) => p.featured) || paintings[0];
  const pick = (cat) => paintings.find((p) => p.category === cat && p !== featured);
  const trio = [pick("kalamkari"), pick("nature"), featured].filter(Boolean);
  $("hero-stack").innerHTML = trio.map((p) => `<div class="stack-card" data-id="${p.id}"><img src="${p.image}" alt="${p.title}" /></div>`).join("");
  $("hero-stack").querySelectorAll(".stack-card").forEach((c) => c.addEventListener("click", () => openModal(paintings.find((p) => p.id == c.dataset.id))));
}

function renderTabs() {
  $("chips").innerHTML = CATEGORIES.map((c) => {
    const n = c.key === "all" ? paintings.length : paintings.filter((p) => p.category === c.key).length;
    return `<button class="tab ${c.key === active ? "active" : ""}" data-key="${c.key}">${c.label}<sup>${n}</sup></button>`;
  }).join("");
  $("chips").querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => { active = b.dataset.key; shown = PAGE_SIZE; renderTabs(); renderGrid(); }));
}

function filtered() {
  const q = $("search").value.trim().toLowerCase();
  let list = paintings.filter((p) => (active === "all" || p.category === active) && (!q || `${p.title} ${p.description} ${p.story} ${p.meaning}`.toLowerCase().includes(q)));
  const s = $("sort").value;
  if (s === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (s === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (s === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  return list;
}

function renderGrid() {
  const list = filtered();
  $("result-count").textContent = `${list.length} painting${list.length === 1 ? "" : "s"}`;
  if (!list.length) {
    $("grid").innerHTML = "<p class='muted' style='grid-column:1/-1;text-align:center;padding:30px'>No paintings found. Try another word or tab ✦</p>";
    $("more").parentElement.hidden = true;
    return;
  }
  const visible = list.slice(0, shown);
  $("grid").innerHTML = visible.map((p, i) => `
    <article class="card" data-id="${p.id}" style="animation-delay:${(i % PAGE_SIZE) * 0.02}s">
      <div class="mat"><img src="${p.image}" alt="${p.title}" loading="lazy" /></div>
      <div class="label"><h3>${p.title}</h3><div class="meta"><span>${p.size}</span><span class="price">${inr(p.price)}</span></div></div>
    </article>`).join("");
  $("grid").querySelectorAll(".card").forEach((c) => c.addEventListener("click", () => openModal(paintings.find((p) => p.id == c.dataset.id))));
  const left = list.length - visible.length;
  $("more").parentElement.hidden = left <= 0;
  $("more").textContent = `Show more (${left} left)`;
}
$("more").addEventListener("click", () => { shown += PAGE_SIZE; renderGrid(); });
$("search").addEventListener("input", () => { shown = PAGE_SIZE; renderGrid(); });
$("sort").addEventListener("change", () => { shown = PAGE_SIZE; renderGrid(); });

function openModal(p) {
  $("m-img").src = p.image;
  $("m-img").alt = p.title;
  $("m-cat").textContent = labelOf(CATEGORIES, p.category);
  $("m-title").textContent = p.title;
  $("m-desc").textContent = p.description;
  $("m-story").textContent = p.story;
  $("m-meaning").textContent = p.meaning;
  $("m-color").textContent = p.colorNote;
  $("m-size").textContent = p.size;
  $("m-medium").textContent = p.medium;
  $("m-price").textContent = inr(p.price);
  const msg = `Hello! I'm interested in the painting "${p.title}" (${inr(p.price)}). Is it available?`;
  $("m-wa").href = wa(msg);
  $("m-mail").href = mail(`Enquiry: ${p.title}`, msg);
  $("m-mail").target = "_blank";
  $("m-mail").rel = "noopener";
  openOverlay($("modal"));
}

/* ================= MODAL HELPERS ================= */
function openOverlay(el) { el.classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function closeOverlays() {
  document.querySelectorAll(".modal").forEach((m) => m.classList.add("hidden"));
  document.body.style.overflow = "";
}
document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => (e.target === m || e.target.hasAttribute("data-close")) && closeOverlays()));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeOverlays(); closeCart(); } });

/* ================= LIVE SESSIONS ================= */
const sessionDate = (s) => {
  const d = new Date();
  d.setDate(d.getDate() + s.inDays);
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(s.time);
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  d.setHours(h, Number(m[2]), 0, 0);
  return d;
};
const fmtDate = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const priceChip = (s) => (s.price === 0 ? `<span class="chip free">Free</span>` : `<span class="chip">${inr(s.price)}</span>`);
const reserve = (s) => mail(`Seat for: ${s.title}`, `Hello! Please reserve a seat for "${s.title}" on ${fmtDate(sessionDate(s))} at ${s.time}.`);

api("/api/sessions").then(({ upcoming, replays }) => {
  const first = upcoming[0], d0 = sessionDate(first);
  $("live-main").innerHTML = `
    <div class="poster"><img src="${first.image}" alt="${first.title}" /><span class="live-badge"><i></i> NEXT LIVE</span></div>
    <div class="live-info">
      <p class="kicker" style="margin:0">${fmtDate(d0)} · ${first.time} IST</p>
      <h3>${first.title}</h3>
      <p class="muted">${first.desc}</p>
      <div class="meta-row"><span class="chip">${first.level}</span><span class="chip">${first.minutes} min</span>${priceChip(first)}<span class="chip">${first.seats} seats</span></div>
      <div class="count" id="count-down"></div>
      <div class="row"><a class="btn solid" href="${reserve(first)}" target="_blank" rel="noopener">Reserve my seat</a></div>
    </div>`;
  const tick = () => {
    const ms = Math.max(0, d0 - new Date()), s = Math.floor(ms / 1000);
    const parts = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor((s % 86400) / 3600)], ["Mins", Math.floor((s % 3600) / 60)], ["Secs", s % 60]];
    const el = $("count-down");
    if (el) el.innerHTML = parts.map(([l, v]) => `<div><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
  };
  tick();
  setInterval(tick, 1000);

  $("session-grid").innerHTML = upcoming.slice(1).map((s) => `
    <article class="session"><img src="${s.image}" alt="${s.title}" loading="lazy" />
      <div class="body"><span class="when">${fmtDate(sessionDate(s))} · ${s.time}</span><h4>${s.title}</h4>
        <div class="meta-row"><span class="chip">${s.level}</span><span class="chip">${s.minutes} min</span>${priceChip(s)}</div>
        <a class="btn line" href="${reserve(s)}" target="_blank" rel="noopener">Reserve seat</a></div></article>`).join("");

  $("replay-grid").innerHTML = replays.map((r) => `
    <article class="replay"><img src="${r.image}" alt="${r.title}" loading="lazy" /><span class="play">▶</span>
      <div class="body"><h4>${r.title}</h4><span>${r.length} · ${r.views} views</span></div></article>`).join("");
  $("replay-grid").querySelectorAll(".replay").forEach((el) => el.addEventListener("click", () => toast("Replays are a demo for now")));
});

/* ================= COLOUR MIXER ================= */
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const blend = (h1, h2, t) => { const a = hex2rgb(h1), b = hex2rgb(h2); return rgb2hex(a.map((v, i) => v + (b[i] - v) * t)); };
let selA = 0, selB = 2, mixed = "#000000", mixName = "";

function drawSwatches() {
  [["sw-a", selA, (i) => (selA = i)], ["sw-b", selB, (i) => (selB = i)]].forEach(([id, sel, set]) => {
    $(id).innerHTML = PIGMENTS.map(([n, c], i) => `<button class="sw ${i === sel ? "on" : ""}" style="background:${c}" title="${n}" data-i="${i}" aria-label="${n}"></button>`).join("");
    $(id).querySelectorAll(".sw").forEach((b) => b.addEventListener("click", () => { set(Number(b.dataset.i)); drawSwatches(); updateMix(); }));
  });
}
function updateMix() {
  const t = $("mix").value / 100;
  $("mix-pct").textContent = $("mix").value;
  mixed = blend(PIGMENTS[selA][1], PIGMENTS[selB][1], t);
  mixName = selA === selB ? PIGMENTS[selA][0] : `${PIGMENTS[selA][0]} + ${PIGMENTS[selB][0]}`;
  $("result").style.background = mixed;
  $("result-name").textContent = mixName;
  $("result-hex").textContent = mixed.toUpperCase();
  const steps = [blend(mixed, "#ffffff", 0.75), blend(mixed, "#ffffff", 0.5), blend(mixed, "#ffffff", 0.25), mixed, blend(mixed, "#2b1022", 0.25), blend(mixed, "#2b1022", 0.5), blend(mixed, "#2b1022", 0.75)];
  $("tints").innerHTML = steps.map((c) => `<div style="background:${c}" data-c="${c}" title="${c.toUpperCase()}"></div>`).join("");
  $("tints").querySelectorAll("div").forEach((d) => d.addEventListener("click", () => copyHex(d.dataset.c)));
}
function copyHex(h) {
  try { navigator.clipboard.writeText(h.toUpperCase()); } catch {}
  toast(`Copied ${h.toUpperCase()}`);
}
function drawSaved() {
  const list = store.get("kalanjali-palette", []);
  $("saved").innerHTML = list.length
    ? list.map((c) => `<div class="chipc" style="background:${c.hex}" title="${c.name} ${c.hex.toUpperCase()}" data-hex="${c.hex}"></div>`).join("")
    : `<span class="empty">Nothing saved yet. Make a mix you like and press "Save this mix".</span>`;
  $("saved").querySelectorAll(".chipc").forEach((c) => c.addEventListener("click", () => copyHex(c.dataset.hex)));
}
$("mix").addEventListener("input", updateMix);
$("save-mix").addEventListener("click", () => {
  const list = store.get("kalanjali-palette", []);
  list.push({ hex: mixed, name: mixName });
  store.set("kalanjali-palette", list.slice(-14));
  drawSaved();
  toast("Mix saved to your palette");
});
$("clear-board").addEventListener("click", () => { store.set("kalanjali-palette", []); drawSaved(); });
$("recipes").innerHTML = RECIPES.map((r) => `
  <article class="recipe"><div class="strip">${r.colors.map((c) => `<div style="background:${c}" title="${c.toUpperCase()}" data-c="${c}"></div>`).join("")}</div>
    <div class="body"><h4>${r.name}</h4><p>${r.note}</p></div></article>`).join("");
$("recipes").querySelectorAll(".strip div").forEach((d) => d.addEventListener("click", () => copyHex(d.dataset.c)));
drawSwatches();
updateMix();
drawSaved();

/* ================= STORE + CART ================= */
let products = [], storeTab = "all";
let cart = store.get("kalanjali-cart", {}); // { productId: qty }

api("/api/products").then((list) => { products = list; renderStoreTabs(); renderProducts(); renderCart(); });

function renderStoreTabs() {
  $("store-tabs").innerHTML = STORE_CATS.map((c) => `<button class="tab ${c.key === storeTab ? "active" : ""}" data-key="${c.key}">${c.label}</button>`).join("");
  $("store-tabs").querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => { storeTab = b.dataset.key; renderStoreTabs(); renderProducts(); }));
}
function renderProducts() {
  const list = storeTab === "all" ? products : products.filter((p) => p.category === storeTab);
  $("products").innerHTML = list.map((p) => `
    <article class="product"><div class="pic"><img src="${p.image}" alt="${p.name}" loading="lazy" />${p.badge ? `<span class="badge">${p.badge}</span>` : ""}</div>
      <div class="body"><h4>${p.name}</h4><p>${p.desc}</p>
        <div class="foot"><span class="price">${inr(p.price)}</span><button class="add" data-id="${p.id}">Add to cart</button></div></div></article>`).join("");
  $("products").querySelectorAll(".add").forEach((b) => b.addEventListener("click", () => { addToCart(Number(b.dataset.id)); }));
}
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  toast("Added to cart");
}
function setQty(id, q) {
  if (q <= 0) delete cart[id]; else cart[id] = q;
  saveCart();
}
function saveCart() { store.set("kalanjali-cart", cart); renderCart(); }

function cartLines() {
  return Object.entries(cart).map(([id, q]) => ({ p: products.find((x) => x.id == id), q })).filter((l) => l.p);
}
function renderCart() {
  const lines = cartLines();
  const count = lines.reduce((s, l) => s + l.q, 0), total = lines.reduce((s, l) => s + l.q * l.p.price, 0);
  $("cart-count").textContent = count;
  $("cart-count").dataset.n = count;
  $("cart-total").textContent = inr(total);
  $("cart-items").innerHTML = lines.length
    ? lines.map(({ p, q }) => `
      <div class="ci"><img src="${p.image}" alt="" />
        <div><h5>${p.name}</h5><div class="p">${inr(p.price * q)}</div>
          <div class="qty"><button data-a="dec" data-id="${p.id}">−</button><span>${q}</span><button data-a="inc" data-id="${p.id}">+</button></div></div>
        <button class="rm" data-a="rm" data-id="${p.id}" aria-label="Remove">×</button></div>`).join("")
    : `<p class="cart-empty">Your cart is empty.<br/>Add some canvases or colours from the store.</p>`;
  $("cart-items").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    const id = Number(b.dataset.id), q = cart[id] || 0;
    setQty(id, b.dataset.a === "inc" ? q + 1 : b.dataset.a === "dec" ? q - 1 : 0);
  }));
  const text = lines.length
    ? `Hello! I'd like to order:\n\n${lines.map(({ p, q }) => `• ${p.name} x ${q} = ${inr(p.price * q)}`).join("\n")}\n\nTotal: ${inr(total)}\n\nPlease share payment and delivery details.`
    : "Hello! I'd like to order some art supplies.";
  $("order-wa").href = wa(text);
  $("order-mail").href = mail("Art supply order", text);
}
function openCart() { $("cart").classList.add("open"); $("cart-overlay").classList.remove("hidden"); }
function closeCart() { $("cart").classList.remove("open"); $("cart-overlay").classList.add("hidden"); }
$("cart-open").addEventListener("click", openCart);
$("cart-close").addEventListener("click", closeCart);
$("cart-overlay").addEventListener("click", closeCart);

/* ================= JOURNAL ================= */
api("/api/blog").then((posts) => {
  $("posts").innerHTML = posts.map((p) => `
    <article class="post" data-id="${p.id}"><img src="${p.image}" alt="${p.title}" loading="lazy" />
      <div class="body"><span class="tagline">${p.tag}</span><h4>${p.title}</h4><p>${p.excerpt}</p><div class="by">${p.date} · ${p.readTime}</div></div></article>`).join("");
  $("posts").querySelectorAll(".post").forEach((el) => el.addEventListener("click", () => {
    const p = posts.find((x) => x.id == el.dataset.id);
    $("p-img").src = p.image;
    $("p-img").alt = p.title;
    $("p-tag").textContent = p.tag;
    $("p-title").textContent = p.title;
    $("p-meta").textContent = `${p.date} · ${p.readTime}`;
    $("p-body").innerHTML = p.body.map((t) => `<p>${t}</p>`).join("");
    openOverlay($("post-modal"));
  }));
});

/* ================= CONTACT ================= */
$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("f-name").value.trim(), from = $("f-email").value.trim();
  const body = `${$("f-msg").value.trim()}\n\n— ${name}\nReply to: ${from}`;
  window.open(mail($("f-subject").value.trim(), body), "_blank", "noopener");
});
