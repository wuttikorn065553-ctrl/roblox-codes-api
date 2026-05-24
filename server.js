const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PASSWORD = "1234";

// ======================
// 📦 DATA SYSTEM
// ======================
let codes = {};

function loadCodes(){
  if(fs.existsSync("codes.json")){
    try {
      codes = JSON.parse(fs.readFileSync("codes.json"));
    } catch (e) {
      console.log("❌ codes.json corrupted -> reset");
      codes = {};
    }
  }
}

function saveCodes(){
  fs.writeFileSync("codes.json", JSON.stringify(codes, null, 2));
}

loadCodes();

// ======================
// 🔐 LOGIN PAGE
// ======================
app.get("/", (req,res)=>{
res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Admin Login</title>
<style>
body{
  margin:0;
  background:linear-gradient(135deg,#0f172a,#1e293b);
  height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  font-family:sans-serif;
  color:white;
}
.box{
  background:#111827;
  padding:30px;
  border-radius:15px;
  box-shadow:0 0 20px rgba(0,0,0,0.5);
  text-align:center;
}
input{
  padding:10px;
  border-radius:8px;
  border:none;
  margin:10px;
}
button{
  padding:10px 20px;
  background:#3b82f6;
  border:none;
  border-radius:8px;
  color:white;
  cursor:pointer;
}
</style>
</head>
<body>
<div class="box">
<h2>🔐 Admin Login</h2>
<input id="pass" type="password" placeholder="Password">
<br>
<button onclick="login()">Enter</button>
</div>

<script>
function login(){
  location.href="/panel?key="+document.getElementById("pass").value;
}
</script>
</body>
</html>
`);
});

// ======================
// 📊 DASHBOARD
// ======================
app.get("/panel",(req,res)=>{
if(req.query.key !== PASSWORD) return res.send("Unauthorized");

res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Code Panel</title>
<style>
body{
  background:#0b1220;
  color:white;
  font-family:sans-serif;
  padding:20px;
}
.card{
  background:#111827;
  padding:15px;
  border-radius:10px;
  margin-bottom:15px;
}
input{
  padding:8px;
  margin:4px;
}
button{
  padding:8px 15px;
  background:#22c55e;
  border:none;
  border-radius:6px;
  color:white;
  cursor:pointer;
}
pre{
  background:black;
  padding:10px;
  border-radius:10px;
}
</style>
</head>
<body>

<h1>🚀 Code Admin Panel</h1>

<div class="card">
<h3>➕ Add Code</h3>

<input id="code" placeholder="CODE">
<input id="expiry" placeholder="YYYY-MM-DD">
<input id="max" placeholder="MaxUses">

<div id="rewards"></div>

<br>
<button onclick="addReward()">+ Reward</button>
<button onclick="addCode()">Create</button>
</div>

<div class="card">
<h3>❌ Delete Code</h3>
<input id="delCode">
<button onclick="del()">Delete</button>
</div>

<div class="card">
<h3>📜 All Codes</h3>
<pre id="list"></pre>
</div>

<script>
const key="${req.query.key}";

function addReward(){
  let d=document.createElement("div");
  d.innerHTML='<input placeholder="Type"><input placeholder="Amount">';
  document.getElementById("rewards").appendChild(d);
}

async function load(){
  let r=await fetch("/codes");
  let j=await r.json();
  document.getElementById("list").innerText=JSON.stringify(j,null,2);
}

async function addCode(){
  let rewards=[];

  document.querySelectorAll("#rewards div").forEach(d=>{
    let i=d.querySelectorAll("input");
    rewards.push({
      Type:i[0].value,
      Amount:Number(i[1].value||0)
    });
  });

  await fetch("/add?key="+key,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      code:code.value,
      data:{
        ExpiryDate:expiry.value,
        MaxUses:Number(max.value||0),
        Rewards:rewards
      }
    })
  });

  load();
}

async function del(){
  await fetch("/delete?key="+key+"&code="+delCode.value,{method:"POST"});
  load();
}

load();
</script>

</body>
</html>
`);
});

// ======================
// 📡 API
// ======================

// GET ALL CODES
app.get("/codes",(req,res)=>{
res.json(codes);
});

// ======================
// ➕ ADD CODE
// ======================
app.post("/add",(req,res)=>{
if(req.query.key !== PASSWORD) return res.json({success:false});

const code = String(req.body.code || "").trim().toUpperCase();

if(!code){
  return res.json({success:false,message:"empty_code"});
}

codes[code] = {
  ExpiryDate: req.body.data?.ExpiryDate || "2099-12-31",
  MaxUses: Number(req.body.data?.MaxUses || 0),
  CurrentUses: 0,
  Rewards: req.body.data?.Rewards || [],
  CreatedAt: Date.now()
};

saveCodes();

console.log("➕ ADD CODE:", code);

res.json({success:true});
});

// ======================
// ❌ DELETE CODE
// ======================
app.post("/delete",(req,res)=>{
if(req.query.key !== PASSWORD) return res.json({success:false});

const code = String(req.query.code || "").trim().toUpperCase();

delete codes[code];

saveCodes();

console.log("❌ DELETE CODE:", code);

res.json({success:true});
});

// ======================
// 🎮 USE CODE (ROBLOX)
// ======================
app.post("/use",(req,res)=>{

const code = String(req.query.code || "").trim().toUpperCase();

console.log("🎮 USE:", code);

let c = codes[code];

if(!c){
  console.log("❌ NOT FOUND:", code);
  return res.json({success:false,message:"not_found"});
}

// safety
c.MaxUses = Number(c.MaxUses || 0);
c.CurrentUses = Number(c.CurrentUses || 0);

// FULL CHECK
if(c.MaxUses > 0 && c.CurrentUses >= c.MaxUses){
  console.log("🚫 FULL:", code);
  return res.json({
    success:false,
    message:"code_full"
  });
}

c.CurrentUses++;
saveCodes();

console.log("✔ USED:", code, c.CurrentUses+"/"+c.MaxUses);

res.json({
  success:true,
  message:"ok",
  current:c.CurrentUses
});
});

// ======================
app.listen(process.env.PORT || 3000, ()=>{
console.log("🚀 Server running");
});