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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #020408;
    --surface: #080f1a;
    --card: #0c1625;
    --border: #0d2847;
    --accent: #00d4ff;
    --accent2: #7b2fff;
    --accent3: #ff2d78;
    --text: #e0f0ff;
    --muted: #4a6fa5;
    --success: #00ff88;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: var(--bg);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
    color: var(--text);
  }

  /* Animated grid background */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridMove 20s linear infinite;
    pointer-events: none;
  }

  @keyframes gridMove {
    0% { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }

  /* Glowing orbs */
  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    pointer-events: none;
    animation: orbFloat 8s ease-in-out infinite;
  }
  .orb1 { width: 400px; height: 400px; background: var(--accent2); top: -100px; left: -100px; }
  .orb2 { width: 300px; height: 300px; background: var(--accent); bottom: -80px; right: -80px; animation-delay: -4s; }
  .orb3 { width: 200px; height: 200px; background: var(--accent3); top: 50%; left: 50%; animation-delay: -2s; }

  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, -20px) scale(1.05); }
  }

  .login-wrapper {
    position: relative;
    z-index: 10;
    width: 380px;
  }

  /* Hexagon logo */
  .logo-area {
    text-align: center;
    margin-bottom: 32px;
  }

  .hex-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hex-icon svg {
    position: absolute;
    inset: 0;
    animation: hexSpin 10s linear infinite;
  }

  @keyframes hexSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .hex-icon .icon-inner {
    position: relative;
    font-size: 28px;
    z-index: 1;
  }

  .logo-title {
    font-family: 'Orbitron', monospace;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 4px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-transform: uppercase;
  }

  .logo-sub {
    font-size: 12px;
    letter-spacing: 6px;
    color: var(--muted);
    text-transform: uppercase;
    margin-top: 4px;
  }

  /* Card */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 36px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(0,212,255,0.05),
      0 20px 60px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.04);
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0.6;
  }

  .field-label {
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'Orbitron', monospace;
  }

  .input-wrap {
    position: relative;
    margin-bottom: 24px;
  }

  .input-wrap input {
    width: 100%;
    background: rgba(0,212,255,0.04);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px 14px 44px;
    color: var(--text);
    font-family: 'Orbitron', monospace;
    font-size: 14px;
    letter-spacing: 4px;
    outline: none;
    transition: all 0.3s;
  }

  .input-wrap input:focus {
    border-color: var(--accent);
    background: rgba(0,212,255,0.08);
    box-shadow: 0 0 20px rgba(0,212,255,0.15);
  }

  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: var(--muted);
    pointer-events: none;
  }

  .btn-login {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    border: none;
    border-radius: 10px;
    color: white;
    font-family: 'Orbitron', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: 0 0 30px rgba(123,47,255,0.4);
  }

  .btn-login::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
    transform: translateX(-100%) rotate(45deg);
    transition: transform 0.6s;
  }

  .btn-login:hover::before {
    transform: translateX(100%) rotate(45deg);
  }

  .btn-login:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 50px rgba(123,47,255,0.6), 0 10px 30px rgba(0,0,0,0.3);
  }

  .btn-login:active { transform: translateY(0); }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
    padding: 10px 14px;
    background: rgba(0,255,136,0.05);
    border: 1px solid rgba(0,255,136,0.1);
    border-radius: 8px;
  }

  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .status-text {
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--success);
    font-family: 'Orbitron', monospace;
  }
</style>
</head>
<body>

<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>

<div class="login-wrapper">
  <div class="logo-area">
    <div class="hex-icon">
      <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="36,4 66,20 66,52 36,68 6,52 6,20" stroke="url(#grad1)" stroke-width="1.5" fill="none"/>
        <polygon points="36,12 58,24 58,48 36,60 14,48 14,24" stroke="rgba(0,212,255,0.2)" stroke-width="1" fill="none"/>
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="72" y2="72">
            <stop offset="0%" stop-color="#00d4ff"/>
            <stop offset="100%" stop-color="#7b2fff"/>
          </linearGradient>
        </defs>
      </svg>
      <div class="icon-inner">🔐</div>
    </div>
    <div class="logo-title">CodeVault</div>
    <div class="logo-sub">Admin System</div>
  </div>

  <div class="card">
    <div class="field-label">Access Key</div>
    <div class="input-wrap">
      <span class="input-icon">⬡</span>
      <input id="pass" type="password" placeholder="••••••••" autocomplete="current-password">
    </div>
    <button class="btn-login" onclick="login()">Authenticate</button>

    <div class="status-bar">
      <div class="status-dot"></div>
      <div class="status-text">System Online</div>
    </div>
  </div>
</div>

<script>
function login(){
  location.href="/panel?key="+document.getElementById("pass").value;
}
document.getElementById("pass").addEventListener("keydown", e => {
  if(e.key === "Enter") login();
});
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
<title>CodeVault Panel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #020408;
    --surface: #060d18;
    --card: #0a1628;
    --card2: #0c1a2e;
    --border: #0f2a45;
    --border2: #152f50;
    --accent: #00d4ff;
    --accent2: #7b2fff;
    --accent3: #ff2d78;
    --accent4: #ff9500;
    --success: #00ff88;
    --text: #d0e8ff;
    --text2: #8ab0d0;
    --muted: #3a5a7a;
    --danger: #ff3860;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Rajdhani', sans-serif;
    min-height: 100vh;
    display: flex;
  }

  /* Grid overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }

  /* === SIDEBAR === */
  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 24px 16px;
    flex-shrink: 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sidebar-logo {
    padding: 12px 8px 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .sidebar-logo .title {
    font-family: 'Orbitron', monospace;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sidebar-logo .sub {
    font-size: 10px;
    letter-spacing: 4px;
    color: var(--muted);
    text-transform: uppercase;
    margin-top: 2px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    color: var(--text2);
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .nav-item:hover {
    background: rgba(0,212,255,0.06);
    border-color: rgba(0,212,255,0.1);
    color: var(--accent);
  }

  .nav-item.active {
    background: rgba(0,212,255,0.1);
    border-color: rgba(0,212,255,0.2);
    color: var(--accent);
    box-shadow: 0 0 20px rgba(0,212,255,0.1);
  }

  .nav-item .nav-icon { font-size: 18px; }

  /* Badge */
  .badge {
    margin-left: auto;
    background: var(--accent);
    color: #000;
    font-size: 10px;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
    min-width: 22px;
    text-align: center;
  }

  .sidebar-spacer { flex: 1; }

  .sidebar-footer {
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .online-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(0,255,136,0.05);
    border: 1px solid rgba(0,255,136,0.1);
    border-radius: 8px;
  }

  .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
    animation: blink 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .online-text {
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--success);
    font-family: 'Orbitron', monospace;
  }

  /* === MAIN === */
  .main {
    margin-left: 240px;
    flex: 1;
    padding: 32px;
    position: relative;
    z-index: 1;
  }

  /* Header */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .page-title {
    font-family: 'Orbitron', monospace;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--text);
  }

  .page-title span {
    color: var(--accent);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-chip {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 12px;
    font-family: 'Orbitron', monospace;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-chip .val {
    color: var(--accent);
    font-weight: 700;
    font-size: 16px;
  }

  .stat-chip .lbl {
    color: var(--muted);
    letter-spacing: 1px;
  }

  /* Stats row */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px 22px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
  }

  .stat-card.c1::before { background: linear-gradient(90deg, var(--accent), transparent); }
  .stat-card.c2::before { background: linear-gradient(90deg, var(--accent2), transparent); }
  .stat-card.c3::before { background: linear-gradient(90deg, var(--success), transparent); }

  .stat-card:hover {
    border-color: var(--border2);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
  }

  .stat-icon {
    font-size: 28px;
    margin-bottom: 10px;
    display: block;
    opacity: 0.8;
  }

  .stat-num {
    font-family: 'Orbitron', monospace;
    font-size: 32px;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-card.c1 .stat-num { color: var(--accent); }
  .stat-card.c2 .stat-num { color: var(--accent2); }
  .stat-card.c3 .stat-num { color: var(--success); }

  .stat-label {
    font-size: 11px;
    letter-spacing: 3px;
    color: var(--muted);
    text-transform: uppercase;
  }

  /* Panels grid */
  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  /* Card */
  .panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.3s;
  }

  .panel:hover { border-color: var(--border2); }

  .panel-header {
    padding: 16px 22px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0,0,0,0.2);
  }

  .panel-icon {
    font-size: 18px;
  }

  .panel-title {
    font-family: 'Orbitron', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--text);
    text-transform: uppercase;
    flex: 1;
  }

  .panel-body {
    padding: 22px;
  }

  /* Form elements */
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group.full { grid-column: span 2; }

  label {
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--muted);
    text-transform: uppercase;
    font-family: 'Orbitron', monospace;
  }

  input[type=text], input[type=date], input[type=number], input[type=password] {
    background: rgba(0,212,255,0.04);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 11px 14px;
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    outline: none;
    width: 100%;
    transition: all 0.25s;
    letter-spacing: 1px;
  }

  input:focus {
    border-color: var(--accent);
    background: rgba(0,212,255,0.08);
    box-shadow: 0 0 16px rgba(0,212,255,0.12);
  }

  /* Reward rows */
  .rewards-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .reward-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
    align-items: center;
    background: rgba(0,0,0,0.2);
    padding: 8px;
    border-radius: 8px;
    border: 1px solid var(--border);
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn {
    from { opacity:0; transform: translateY(-6px); }
    to { opacity:1; transform: translateY(0); }
  }

  .btn-remove {
    background: rgba(255,56,96,0.15);
    border: 1px solid rgba(255,56,96,0.3);
    border-radius: 6px;
    color: var(--danger);
    cursor: pointer;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .btn-remove:hover {
    background: rgba(255,56,96,0.3);
    border-color: var(--danger);
  }

  /* Buttons */
  .btn-row {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .btn {
    flex: 1;
    padding: 12px 18px;
    border: none;
    border-radius: 9px;
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.25s;
  }

  .btn::after {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
    transform: translateX(-100%) rotate(45deg);
    transition: transform 0.5s;
  }

  .btn:hover::after { transform: translateX(100%) rotate(45deg); }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    color: white;
    box-shadow: 0 0 20px rgba(123,47,255,0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 35px rgba(123,47,255,0.5);
  }

  .btn-ghost {
    background: rgba(0,212,255,0.08);
    border: 1px solid rgba(0,212,255,0.2);
    color: var(--accent);
  }

  .btn-ghost:hover {
    background: rgba(0,212,255,0.15);
    border-color: var(--accent);
  }

  .btn-danger {
    background: rgba(255,56,96,0.15);
    border: 1px solid rgba(255,56,96,0.3);
    color: var(--danger);
  }

  .btn-danger:hover {
    background: rgba(255,56,96,0.25);
    border-color: var(--danger);
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(255,56,96,0.3);
  }

  /* Toast */
  #toast {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }

  .toast-msg {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    font-family: 'Orbitron', monospace;
    font-size: 11px;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.5s forwards;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    min-width: 260px;
  }

  .toast-msg.ok {
    border-color: rgba(0,255,136,0.3);
    color: var(--success);
  }

  .toast-msg.err {
    border-color: rgba(255,56,96,0.3);
    color: var(--danger);
  }

  @keyframes toastIn {
    from { opacity:0; transform: translateX(20px); }
    to { opacity:1; transform: translateX(0); }
  }

  @keyframes toastOut {
    to { opacity:0; transform: translateX(20px); }
  }

  /* Codes table */
  .full-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 24px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  thead tr {
    background: rgba(0,0,0,0.3);
    border-bottom: 1px solid var(--border);
  }

  th {
    padding: 13px 18px;
    text-align: left;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
    font-weight: 600;
  }

  tbody tr {
    border-bottom: 1px solid rgba(15,42,69,0.5);
    transition: background 0.2s;
  }

  tbody tr:last-child { border-bottom: none; }

  tbody tr:hover { background: rgba(0,212,255,0.03); }

  td {
    padding: 13px 18px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text2);
  }

  .code-badge {
    display: inline-block;
    background: rgba(0,212,255,0.1);
    border: 1px solid rgba(0,212,255,0.2);
    border-radius: 6px;
    padding: 4px 10px;
    font-family: 'Orbitron', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--accent);
  }

  .uses-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .uses-track {
    flex: 1;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    max-width: 80px;
  }

  .uses-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent2), var(--accent));
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .uses-text {
    font-size: 12px;
    color: var(--text2);
    min-width: 50px;
  }

  .expiry-ok { color: var(--success); }
  .expiry-warn { color: var(--accent4); }
  .expiry-expired { color: var(--danger); }

  .rewards-cell {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .reward-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(123,47,255,0.12);
    border: 1px solid rgba(123,47,255,0.25);
    border-radius: 20px;
    padding: 3px 8px;
    font-size: 11px;
    color: #a98aff;
    font-family: 'JetBrains Mono', monospace;
  }

  .reward-tag .ramt {
    font-weight: 600;
    color: #c4aaff;
  }

  .btn-del-row {
    background: none;
    border: 1px solid rgba(255,56,96,0.2);
    border-radius: 6px;
    color: rgba(255,56,96,0.6);
    cursor: pointer;
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    transition: all 0.2s;
  }

  .btn-del-row:hover {
    background: rgba(255,56,96,0.15);
    border-color: var(--danger);
    color: var(--danger);
  }

  .empty-state {
    text-align: center;
    padding: 48px;
    color: var(--muted);
  }

  .empty-state .empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
  .empty-state .empty-text {
    font-family: 'Orbitron', monospace;
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  /* Divider line top */
  .panel-header.green { border-bottom-color: rgba(0,255,136,0.15); }
  .panel-header.red { border-bottom-color: rgba(255,56,96,0.15); }

  /* Scan line effect */
  .panel::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent);
    pointer-events: none;
  }

  .panel { position: relative; }
</style>
</head>
<body>

<div id="toast"></div>

<!-- SIDEBAR -->
<nav class="sidebar">
  <div class="sidebar-logo">
    <div class="title">⬡ CodeVault</div>
    <div class="sub">Admin Panel</div>
  </div>

  <div class="nav-item active" onclick="scrollTo(0,0)">
    <span class="nav-icon">📊</span>
    Dashboard
  </div>
  <div class="nav-item" onclick="document.getElementById('addPanel').scrollIntoView({behavior:'smooth'})">
    <span class="nav-icon">➕</span>
    Add Code
  </div>
  <div class="nav-item" onclick="document.getElementById('deletePanel').scrollIntoView({behavior:'smooth'})">
    <span class="nav-icon">🗑</span>
    Delete Code
  </div>
  <div class="nav-item" onclick="document.getElementById('listPanel').scrollIntoView({behavior:'smooth'})">
    <span class="nav-icon">📋</span>
    All Codes
    <span class="badge" id="sideCount">0</span>
  </div>

  <div class="sidebar-spacer"></div>

  <div class="sidebar-footer">
    <div class="online-indicator">
      <div class="dot"></div>
      <div class="online-text">Online</div>
    </div>
  </div>
</nav>

<!-- MAIN -->
<main class="main">

  <!-- Topbar -->
  <div class="topbar">
    <div class="page-title">Code <span>Management</span></div>
    <div class="topbar-right">
      <div class="stat-chip">
        <span class="lbl">Codes</span>
        <span class="val" id="topCount">0</span>
      </div>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat-card c1">
      <span class="stat-icon">🗂</span>
      <div class="stat-num" id="statTotal">0</div>
      <div class="stat-label">Total Codes</div>
    </div>
    <div class="stat-card c2">
      <span class="stat-icon">🎯</span>
      <div class="stat-num" id="statUses">0</div>
      <div class="stat-label">Total Uses</div>
    </div>
    <div class="stat-card c3">
      <span class="stat-icon">✅</span>
      <div class="stat-num" id="statActive">0</div>
      <div class="stat-label">Active Codes</div>
    </div>
  </div>

  <!-- Add + Delete -->
  <div class="panels">

    <!-- ADD CODE -->
    <div class="panel" id="addPanel">
      <div class="panel-header">
        <span class="panel-icon">➕</span>
        <span class="panel-title">Add New Code</span>
      </div>
      <div class="panel-body">
        <div class="form-row">
          <div class="form-group">
            <label>Code ID</label>
            <input id="code" type="text" placeholder="MYCODE2025">
          </div>
          <div class="form-group">
            <label>Expiry Date</label>
            <input id="expiry" type="date">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Max Uses</label>
            <input id="max" type="number" placeholder="0 = unlimited">
          </div>
        </div>

        <label style="display:block;margin-bottom:10px;margin-top:4px;">Rewards</label>
        <div class="rewards-list" id="rewards"></div>

        <div class="btn-row">
          <button class="btn btn-ghost" onclick="addReward()">+ Reward</button>
          <button class="btn btn-primary" onclick="addCode()">✦ Create Code</button>
        </div>
      </div>
    </div>

    <!-- DELETE CODE -->
    <div class="panel" id="deletePanel">
      <div class="panel-header red">
        <span class="panel-icon">🗑</span>
        <span class="panel-title">Delete Code</span>
      </div>
      <div class="panel-body">
        <div class="form-group" style="margin-bottom:16px;">
          <label>Code to Delete</label>
          <input id="delCode" type="text" placeholder="Enter code name...">
        </div>
        <div class="btn-row">
          <button class="btn btn-danger" onclick="del()">⚡ Delete Code</button>
        </div>
      </div>
    </div>

  </div>

  <!-- ALL CODES TABLE -->
  <div class="full-panel" id="listPanel">
    <div class="panel-header">
      <span class="panel-icon">📋</span>
      <span class="panel-title">All Codes</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Uses</th>
            <th>Max</th>
            <th>Expiry</th>
            <th>Rewards</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="codesBody">
          <tr>
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-icon">⬡</div>
                <div class="empty-text">Loading data...</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</main>

<script>
const key="${req.query.key}";

// Toast system
function toast(msg, ok=true) {
  const el = document.createElement("div");
  el.className = "toast-msg " + (ok ? "ok" : "err");
  el.innerHTML = (ok ? "✦" : "✖") + " " + msg;
  document.getElementById("toast").appendChild(el);
  setTimeout(() => el.remove(), 2900);
}

// Add reward row
function addReward(){
  const d = document.createElement("div");
  d.className = "reward-row";
  d.innerHTML = \`
    <input type="text" placeholder="Type (e.g. Coins)">
    <input type="number" placeholder="Amount">
    <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
  \`;
  document.getElementById("rewards").appendChild(d);
}

// Load codes
async function load(){
  try {
    const r = await fetch("/codes");
    const j = await r.json();
    renderTable(j);
  } catch(e) {
    toast("Failed to load codes", false);
  }
}

function renderTable(data) {
  const keys = Object.keys(data);
  const tbody = document.getElementById("codesBody");

  // Update stats
  const total = keys.length;
  const totalUses = keys.reduce((a,k) => a + (data[k].CurrentUses||0), 0);
  const now = new Date();
  const active = keys.filter(k => {
    const exp = new Date(data[k].ExpiryDate);
    return exp >= now;
  }).length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statUses").textContent = totalUses;
  document.getElementById("statActive").textContent = active;
  document.getElementById("topCount").textContent = total;
  document.getElementById("sideCount").textContent = total;

  if(keys.length === 0) {
    tbody.innerHTML = \`<tr><td colspan="6"><div class="empty-state">
      <div class="empty-icon">⬡</div>
      <div class="empty-text">No codes found</div>
    </div></td></tr>\`;
    return;
  }

  tbody.innerHTML = keys.map(k => {
    const c = data[k];
    const uses = Number(c.CurrentUses||0);
    const max = Number(c.MaxUses||0);
    const pct = max > 0 ? Math.min(100, (uses/max)*100) : 0;

    const now = new Date();
    const exp = new Date(c.ExpiryDate);
    const daysLeft = Math.ceil((exp - now) / 86400000);
    let expiryClass = "expiry-ok";
    let expiryLabel = c.ExpiryDate;
    if(daysLeft < 0) { expiryClass = "expiry-expired"; expiryLabel = "EXPIRED"; }
    else if(daysLeft <= 7) { expiryClass = "expiry-warn"; expiryLabel = c.ExpiryDate + " (" + daysLeft + "d)"; }

    const rewards = (c.Rewards||[]).map(r =>
      \`<span class="reward-tag">\${r.Type} <span class="ramt">×\${r.Amount}</span></span>\`
    ).join("") || '<span style="color:var(--muted);font-size:12px">—</span>';

    return \`<tr>
      <td><span class="code-badge">\${k}</span></td>
      <td>
        <div class="uses-bar">
          <div class="uses-track"><div class="uses-fill" style="width:\${pct}%"></div></div>
          <span class="uses-text">\${uses}\${max>0?'/'+max:''}</span>
        </div>
      </td>
      <td style="color:var(--text2)">\${max > 0 ? max : '∞'}</td>
      <td class="\${expiryClass}">\${expiryLabel}</td>
      <td><div class="rewards-cell">\${rewards}</div></td>
      <td>
        <button class="btn-del-row" onclick="quickDel('\${k}')" title="Delete">✕</button>
      </td>
    </tr>\`;
  }).join("");
}

async function addCode(){
  const codeVal = document.getElementById("code").value.trim();
  if(!codeVal) { toast("Enter a code name", false); return; }

  const rewards = [];
  document.querySelectorAll("#rewards .reward-row").forEach(d => {
    const inputs = d.querySelectorAll("input");
    if(inputs[0].value) {
      rewards.push({ Type: inputs[0].value, Amount: Number(inputs[1].value||0) });
    }
  });

  await fetch("/add?key="+key, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      code: codeVal,
      data: {
        ExpiryDate: document.getElementById("expiry").value || "2099-12-31",
        MaxUses: Number(document.getElementById("max").value || 0),
        Rewards: rewards
      }
    })
  });

  document.getElementById("code").value = "";
  document.getElementById("expiry").value = "";
  document.getElementById("max").value = "";
  document.getElementById("rewards").innerHTML = "";

  toast("Code created: " + codeVal.toUpperCase());
  load();
}

async function del(){
  const c = document.getElementById("delCode").value.trim();
  if(!c) { toast("Enter a code to delete", false); return; }
  await fetch("/delete?key="+key+"&code="+encodeURIComponent(c), {method:"POST"});
  document.getElementById("delCode").value = "";
  toast("Deleted: " + c.toUpperCase());
  load();
}

async function quickDel(code) {
  if(!confirm("Delete code: " + code + "?")) return;
  await fetch("/delete?key="+key+"&code="+encodeURIComponent(code), {method:"POST"});
  toast("Deleted: " + code);
  load();
}

load();
</script>

</body>
</html>
`);
});

// ======================
// 📡 API (unchanged)
// ======================

app.get("/codes",(req,res)=>{ res.json(codes); });

app.post("/add",(req,res)=>{
  if(req.query.key !== PASSWORD) return res.json({success:false});
  const code = String(req.body.code || "").trim().toUpperCase();
  if(!code) return res.json({success:false,message:"empty_code"});
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

app.post("/delete",(req,res)=>{
  if(req.query.key !== PASSWORD) return res.json({success:false});
  const code = String(req.query.code || "").trim().toUpperCase();
  delete codes[code];
  saveCodes();
  console.log("❌ DELETE CODE:", code);
  res.json({success:true});
});

app.post("/use",(req,res)=>{
  const code = String(req.query.code || "").trim().toUpperCase();
  console.log("🎮 USE:", code);
  let c = codes[code];
  if(!c){ console.log("❌ NOT FOUND:", code); return res.json({success:false,message:"not_found"}); }
  c.MaxUses = Number(c.MaxUses || 0);
  c.CurrentUses = Number(c.CurrentUses || 0);
  if(c.MaxUses > 0 && c.CurrentUses >= c.MaxUses){
    console.log("🚫 FULL:", code);
    return res.json({success:false,message:"code_full"});
  }
  c.CurrentUses++;
  saveCodes();
  console.log("✔ USED:", code, c.CurrentUses+"/"+c.MaxUses);
  res.json({success:true,message:"ok",current:c.CurrentUses});
});

app.listen(process.env.PORT || 3000, ()=>{ console.log("🚀 Server running"); });
