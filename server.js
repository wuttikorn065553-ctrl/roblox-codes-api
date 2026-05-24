const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PASSWORD = "1234"; // 🔐 เปลี่ยนเอง

// โหลดข้อมูล
let codes = {};
function loadCodes() {
  if (fs.existsSync("codes.json")) {
    codes = JSON.parse(fs.readFileSync("codes.json"));
  }
}
function saveCodes() {
  fs.writeFileSync("codes.json", JSON.stringify(codes, null, 2));
}

loadCodes();

// 🔐 middleware เช็ครหัส
function auth(req, res, next) {
  if (req.query.key !== PASSWORD) {
    return res.send("Unauthorized");
  }
  next();
}

// 🌐 UI
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Code Manager</title>
    <style>
      body { font-family: Arial; background:#111; color:white; padding:20px }
      input, button { margin:5px; padding:8px }
      .box { background:#222; padding:15px; border-radius:10px }
    </style>
  </head>
  <body>

  <h1>🔐 Code Manager</h1>

  <div class="box">
    <input id="key" placeholder="Password"><br>

    <h3>➕ เพิ่มโค้ด</h3>
    <input id="code" placeholder="Code"><br>
    <input id="expiry" placeholder="YYYY-MM-DD"><br>
    <input id="max" placeholder="MaxUses"><br>

    <h4>🎁 Rewards (ใส่หลายอันได้)</h4>
    <div id="rewards"></div>
    <button onclick="addReward()">+ เพิ่มของ</button><br>

    <button onclick="addCode()">Add Code</button>
  </div>

  <div class="box">
    <h3>❌ ลบโค้ด</h3>
    <input id="deleteCode" placeholder="Code">
    <button onclick="del()">Delete</button>
  </div>

  <div class="box">
    <h3>📜 Codes</h3>
    <pre id="list"></pre>
  </div>

<script>
function addReward(){
  let div = document.createElement("div");
  div.innerHTML = '<input placeholder="Type"><input placeholder="Amount">';
  document.getElementById("rewards").appendChild(div);
}

async function load(){
  let res = await fetch('/codes');
  let data = await res.json();
  document.getElementById("list").innerText = JSON.stringify(data,null,2);
}

async function addCode(){
  let rewards = [];
  document.querySelectorAll("#rewards div").forEach(d=>{
    let inputs = d.querySelectorAll("input");
    rewards.push({
      Type: inputs[0].value,
      Amount: parseInt(inputs[1].value)
    });
  });

  await fetch('/add?key='+key.value,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      code: code.value,
      data:{
        ExpiryDate: expiry.value,
        MaxUses: parseInt(max.value),
        CurrentUses: 0,
        Rewards: rewards
      }
    })
  });

  load();
}

async function del(){
  await fetch('/delete?key='+key.value+'&code='+deleteCode.value,{
    method:'POST'
  });
  load();
}

load();
</script>

  </body>
  </html>
  `);
});

// 📥 ดึงโค้ด
app.get("/codes", (req, res) => {
  res.json(codes);
});

// ➕ เพิ่ม
app.post("/add", auth, (req, res) => {
  const { code, data } = req.body;
  codes[code] = data;
  saveCodes();
  res.json({ success: true });
});

// ❌ ลบ
app.post("/delete", auth, (req, res) => {
  delete codes[req.query.code];
  saveCodes();
  res.json({ success: true });
});

// 📤 ใช้
app.post("/use", (req, res) => {
  const code = req.query.code;

  if (!codes[code]) return res.json({ success:false });

  if (codes[code].CurrentUses >= codes[code].MaxUses)
    return res.json({ success:false });

  codes[code].CurrentUses++;
  saveCodes();

  res.json({ success:true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Server running"));