const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PASSWORD = "1234";

let codes = {};
function loadCodes(){
  if(fs.existsSync("codes.json")){
    codes = JSON.parse(fs.readFileSync("codes.json"));
  }
}
function saveCodes(){
  fs.writeFileSync("codes.json", JSON.stringify(codes,null,2));
}
loadCodes();

// 🔐 login page
app.get("/", (req,res)=>{
res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Login</title>
<style>
body {
  background: linear-gradient(135deg,#0f2027,#203a43,#2c5364);
  height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  font-family:sans-serif;
}
.box{
  background:#111;
  padding:30px;
  border-radius:15px;
  box-shadow:0 0 20px #000;
  text-align:center;
}
input{
  padding:10px;
  margin:10px;
  border:none;
  border-radius:5px;
}
button{
  padding:10px 20px;
  background:#00c6ff;
  border:none;
  border-radius:5px;
  cursor:pointer;
}
</style>
</head>
<body>

<div class="box">
<h2>🔐 Admin Login</h2>
<input id="pass" type="password" placeholder="Password"><br>
<button onclick="login()">Enter</button>
</div>

<script>
function login(){
  let p = document.getElementById("pass").value;
  window.location = "/panel?key="+p;
}
</script>

</body>
</html>
`);
});

// 🔐 panel
app.get("/panel", (req,res)=>{
if(req.query.key !== PASSWORD) return res.send("Unauthorized");

res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Dashboard</title>
<style>
body{
  background:#0d1117;
  color:white;
  font-family:sans-serif;
  padding:20px;
}
.card{
  background:#161b22;
  padding:20px;
  border-radius:10px;
  margin-bottom:20px;
}
input{
  padding:8px;
  margin:5px;
  border-radius:5px;
  border:none;
}
button{
  padding:8px 15px;
  background:#238636;
  border:none;
  border-radius:5px;
  color:white;
  cursor:pointer;
}
pre{
  background:#010409;
  padding:10px;
  border-radius:10px;
}
</style>
</head>
<body>

<h1>🚀 Code Dashboard</h1>

<div class="card">
<h3>➕ Add Code</h3>
<input id="code" placeholder="Code">
<input id="expiry" placeholder="YYYY-MM-DD">
<input id="max" placeholder="MaxUses"><br>

<div id="rewards"></div>
<button onclick="addReward()">+ Reward</button><br><br>

<button onclick="addCode()">Add</button>
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
const key = "${req.query.key}"

function addReward(){
  let d = document.createElement("div");
  d.innerHTML = '<input placeholder="Type"><input placeholder="Amount">';
  document.getElementById("rewards").appendChild(d);
}

async function load(){
  let r = await fetch('/codes');
  let data = await r.json();
  document.getElementById("list").innerText = JSON.stringify(data,null,2);
}

async function addCode(){
  let rewards = [];
  document.querySelectorAll("#rewards div").forEach(d=>{
    let i = d.querySelectorAll("input");
    rewards.push({Type:i[0].value,Amount:parseInt(i[1].value)});
  });

  await fetch('/add?key='+key,{
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
  await fetch('/delete?key='+key+'&code='+delCode.value,{method:'POST'});
  load();
}

load();
</script>

</body>
</html>
`);
});

// API
app.get("/codes",(req,res)=>res.json(codes));

app.post("/add",(req,res)=>{
if(req.query.key!==PASSWORD)return res.json({success:false});
codes[req.body.code]=req.body.data;
saveCodes();
res.json({success:true});
});

app.post("/delete",(req,res)=>{
if(req.query.key!==PASSWORD)return res.json({success:false});
delete codes[req.query.code];
saveCodes();
res.json({success:true});
});

app.post("/use",(req,res)=>{
let c = codes[req.query.code];
if(!c) return res.json({success:false});
if(c.CurrentUses>=c.MaxUses) return res.json({success:false});
c.CurrentUses++;
saveCodes();
res.json({success:true});
});

app.listen(process.env.PORT||3000);