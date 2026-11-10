const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3100;

// The frontend runs on its own address (for example http://localhost:5500),
// so the backend must allow it to call the API.
app.use(cors());
app.use(express.json());

// Read JSON on every request so edits show up without restarting.
// (In a later step this moves into a real database.)
const load = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, "data", file), "utf8"));

app.get("/", (req, res) => res.json({ name: "Kalanjali API", status: "running", routes: ["/api/paintings", "/api/products", "/api/sessions", "/api/blog"] }));

app.get("/api/paintings", (req, res) => res.json(load("paintings.json")));
app.get("/api/paintings/:id", (req, res) => {
  const p = load("paintings.json").find((x) => x.id === Number(req.params.id));
  p ? res.json(p) : res.status(404).json({ error: "Not found" });
});
app.get("/api/products", (req, res) => res.json(load("products.json")));
app.get("/api/sessions", (req, res) => res.json(load("sessions.json")));
app.get("/api/blog", (req, res) => res.json(load("blog.json")));

app.listen(PORT, () => console.log(`Kalanjali API running at http://localhost:${PORT}`));
