const express = require("express");

const app = express();
app.use(express.json());

// 🔥 โค้ดทั้งหมดอยู่ตรงนี้ (แก้ได้ตรงนี้เลย)
let codes = {
  FREE100: {
    ExpiryDate: "2026-12-31",
    MaxUses: 100,
    CurrentUses: 0,
    Rewards: [
      { Type: "Coins", Amount: 100 }
    ]
  }
};

// 📥 ดึงโค้ด
app.get("/codes", (req, res) => {
  res.json(codes);
});

// 📤 ใช้โค้ด
app.post("/use", (req, res) => {
  const code = req.query.code;

  if (!codes[code]) {
    return res.json({ success: false, message: "Invalid code" });
  }

  if (codes[code].CurrentUses >= codes[code].MaxUses) {
    return res.json({ success: false, message: "Max uses reached" });
  }

  codes[code].CurrentUses++;

  res.json({ success: true });
});

// หน้าเช็คว่าเซิร์ฟเวอร์ทำงาน
app.get("/", (req, res) => {
  res.send("API is running");
});

// 🔥 Render ต้องใช้ PORT นี้
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});