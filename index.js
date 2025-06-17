// File: index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const pool = require("./config/db");

// Load .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

pool.query("SELECT current_database()", (err, result) => {
  if (err) {
    console.error("❌ Gagal koneksi ke database:", err);
  } else {
    console.log("✅ Terkoneksi ke database:", result.rows[0]);
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

app.get("/", (req, res) => {
  res.send("E-Wallet Backend Running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
