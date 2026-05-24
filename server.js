const express = require("express");

const app = express();
app.use(express.json());

// 🔥 เก็บโค้ด
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

// 🌐 หน้าเว็บ
app.get("/", (req, res) => {
  res.send(`
    <h1>Roblox Code Manager</h1>

    <h2>➕ เพิ่มโค้ด</h2>
    <input id="code" placeholder="Code"><br>
    <input id="expiry" placeholder="YYYY-MM-DD"><br>
    <input id="max" placeholder="MaxUses"><br>
    <input id="rewardType" placeholder="Type (Coins)"><br>
    <input id="amount" placeholder="Amount"><br>
    <button onclick="add()">Add</button>

    <h2>❌ ลบโค้ด</h2>
    <input id="deleteCode" placeholder="Code"><br>
    <button onclick="del()">Delete</button>

    <h2>📜 Codes</h2>
    <pre id="list"></pre>

    <script>
      async function load(){
        const res = await fetch('/codes');
        const data = await res.json();
        document.getElementById("list").innerText = JSON.stringify(data, null, 2);
      }

      async function add(){
        await fetch('/add', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            code: document.getElementById("code").value,
            data: {
              ExpiryDate: document.getElementById("expiry").value,
              MaxUses: parseInt(document.getElementById("max").value),
              CurrentUses: 0,
              Rewards: [{
                Type: document.getElementById("rewardType").value,
                Amount: parseInt(document.getElementById("amount").value)
              }]
            }
          })
        });
        load();
      }

      async function del(){
        await fetch('/delete?code=' + document.getElementById("deleteCode").value, {
          method: 'POST'
        });
        load();
      }

      load();
    </script>
  `);
});

// 📥 ดึงโค้ด
app.get("/codes", (req, res) => {
  res.json(codes);
});

// ➕ เพิ่มโค้ด
app.post("/add", (req, res) => {
  const { code, data } = req.body;
  codes[code] = data;
  res.json({ success: true });
});

// ❌ ลบโค้ด
app.post("/delete", (req, res) => {
  const code = req.query.code;
  delete codes[code];
  res.json({ success: true });
});

// 📤 ใช้โค้ด
app.post("/use", (req, res) => {
  const code = req.query.code;

  if (!codes[code]) return res.json({ success: false });

  if (codes[code].CurrentUses >= codes[code].MaxUses) {
    return res.json({ success: false });
  }

  codes[code].CurrentUses++;

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));