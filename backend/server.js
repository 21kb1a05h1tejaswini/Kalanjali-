const express = require("express");
const cors = require("cors");
const { db } = require("./db");

const app = express();
const PORT = process.env.PORT || 3100;

// The frontend runs on its own address (for example http://localhost:5500),
// so the backend must allow it to call the API.
app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>
  res.json({ name: "Kalanjali API", status: "running", database: "SQLite", routes: ["/api/paintings", "/api/products", "/api/sessions", "/api/blog"] })
);

// ---- Paintings ----
const paintingOut = (r) => ({ ...r, featured: !!r.featured });
app.get("/api/paintings", (req, res) => res.json(db.all("SELECT * FROM paintings ORDER BY id").map(paintingOut)));
app.get("/api/paintings/:id", (req, res) => {
  const row = db.get("SELECT * FROM paintings WHERE id = ?", [Number(req.params.id)]);
  row ? res.json(paintingOut(row)) : res.status(404).json({ error: "Not found" });
});

// ---- Store products ----
app.get("/api/products", (req, res) =>
  res.json(db.all("SELECT * FROM products ORDER BY id").map(({ descr, ...p }) => ({ ...p, desc: descr })))
);

// ---- Live sessions ----
app.get("/api/sessions", (req, res) => {
  const rows = db.all("SELECT * FROM sessions ORDER BY id");
  const upcoming = rows
    .filter((s) => s.kind === "upcoming")
    .map((s) => ({ id: s.id, title: s.title, level: s.level, inDays: s.inDays, time: s.time, minutes: s.minutes, price: s.price, seats: s.seats, image: s.image, desc: s.descr }));
  const replays = rows
    .filter((s) => s.kind === "replay")
    .map((s) => ({ id: s.id, title: s.title, length: s.length, views: s.views, image: s.image }));
  res.json({ upcoming, replays });
});

// ---- Journal (blog) ----
app.get("/api/blog", (req, res) =>
  res.json(db.all("SELECT * FROM posts ORDER BY id").map((p) => ({ ...p, body: JSON.parse(p.body) })))
);

app.listen(PORT, () => console.log(`Kalanjali API running at http://localhost:${PORT} (SQLite database)`));
