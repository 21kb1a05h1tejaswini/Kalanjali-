// SQLite database: creates the tables and loads the starter data from data/*.json.
const { Database } = require("node-sqlite3-wasm");
const path = require("path");
const fs = require("fs");

const DATA = path.join(__dirname, "data");
const db = new Database(path.join(DATA, "kalanjali.db")); // this file is ignored by Git

db.exec(`
CREATE TABLE IF NOT EXISTS paintings (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL,
  size TEXT, medium TEXT, image TEXT NOT NULL, featured INTEGER DEFAULT 0,
  description TEXT, story TEXT, meaning TEXT, colorNote TEXT
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL,
  image TEXT, badge TEXT, descr TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY, kind TEXT NOT NULL, title TEXT NOT NULL, level TEXT, inDays INTEGER,
  time TEXT, minutes INTEGER, price INTEGER, seats INTEGER, image TEXT, descr TEXT, length TEXT, views TEXT
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, tag TEXT, date TEXT, readTime TEXT,
  image TEXT, excerpt TEXT, body TEXT
);
`);

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const count = (table) => db.get(`SELECT COUNT(*) AS n FROM ${table}`).n;

function insertAll(sql, rows) {
  db.exec("BEGIN");
  try {
    rows.forEach((r) => db.run(sql, r));
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// Fill each empty table from its JSON file (so existing data is never overwritten)
function seedIfEmpty() {
  if (count("paintings") === 0) {
    insertAll(
      "INSERT INTO paintings (id,title,category,price,size,medium,image,featured,description,story,meaning,colorNote) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      readJson("paintings.json").map((p) => [p.id, p.title, p.category, p.price, p.size, p.medium, p.image, p.featured ? 1 : 0, p.description, p.story, p.meaning, p.colorNote])
    );
  }
  if (count("products") === 0) {
    insertAll(
      "INSERT INTO products (id,name,category,price,image,badge,descr) VALUES (?,?,?,?,?,?,?)",
      readJson("products.json").map((p) => [p.id, p.name, p.category, p.price, p.image, p.badge || "", p.desc])
    );
  }
  if (count("sessions") === 0) {
    const { upcoming, replays } = readJson("sessions.json");
    insertAll(
      "INSERT INTO sessions (id,kind,title,level,inDays,time,minutes,price,seats,image,descr,length,views) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        ...upcoming.map((s) => [s.id, "upcoming", s.title, s.level, s.inDays, s.time, s.minutes, s.price, s.seats, s.image, s.desc, null, null]),
        ...replays.map((s) => [s.id, "replay", s.title, null, null, null, null, null, null, s.image, null, s.length, s.views]),
      ]
    );
  }
  if (count("posts") === 0) {
    insertAll(
      "INSERT INTO posts (id,title,tag,date,readTime,image,excerpt,body) VALUES (?,?,?,?,?,?,?,?)",
      readJson("blog.json").map((p) => [p.id, p.title, p.tag, p.date, p.readTime, p.image, p.excerpt, JSON.stringify(p.body)])
    );
  }
}

// Delete everything and load the JSON files again (used by: npm run reseed)
function reseed() {
  ["paintings", "products", "sessions", "posts"].forEach((t) => db.exec(`DELETE FROM ${t}`));
  seedIfEmpty();
}

seedIfEmpty();

module.exports = { db, seedIfEmpty, reseed, count };
