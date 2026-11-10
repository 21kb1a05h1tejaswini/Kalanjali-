// Run with:  npm run reseed
// Wipes the database tables and loads backend/data/*.json again.
const { reseed, count } = require("./db");

reseed();
console.log("Database reloaded from data/*.json:", {
  paintings: count("paintings"),
  products: count("products"),
  sessions: count("sessions"),
  posts: count("posts"),
});
