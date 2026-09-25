const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
let selectedPay = "";
let appOpen = true;

//   URL  
const API_URL = "https://innovation-removed-spiritual-previously.trycloudflare.com";

// ===== Screens =====
function showWallet() {
  document.getElementById("walletView").style.display = "block";
  document.getElementById("topupView").style.display = "none";
  document.getElementById("mlbbView").style.display = "none";
  loadBalance();
}

function showTopup() {
  document.getElementById("walletView").style.display = "none";
  document.getElementById("topupView").style.display = "block";
  document.getElementById("mlbbView").style.display = "none";
}

function showMLBB() {
  document.getElementById("walletView").style.display = "none";
  document.getElementById("topupView").style.display = "none";
  document.getElementById("mlbbView").style.display = "block";
  document.getElementById("mlbbResult").style.display = "none";
}

// ===== MLBB ID  =====
async function checkMLBB() {
  const mlbbId = document.getElementById("mlbbId").value.trim();
  const server = document.getElementById("mlbbServer").value.trim();
  
  if (!mlbbId || mlbbId.length < 5) {
    return tg.showAlert("MLBB ID   ( — 123456789)");
  }
  
  if (!server || server.length < 4) {
    return tg.showAlert("Server ID   ( — 12345)");
  }
  
  tg.showAlert(" ...");
  
  try {
    const res = await fetch(API_URL + "/api/check_mlbb", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ uid: mlbbId, server: server })
    });
    
    const data = await res.json();
    console.log("MLBB Result:", data);
    
    if (data.success) {
      document.getElementById("resultName").innerText = data.name;
      document.getElementById("resultId").innerText = mlbbId;
      document.getElementById("resultServer").innerText = server;
      document.getElementById("resultRegion").innerText = " " + data.region;
      document.getElementById("mlbbResult").style.display = "block";
      
      if (data.source === "Demo") {
        tg.showAlert(" Result \n(Demo Data — API )");
      } else {
        tg.showAlert("  !");
      }
    } else {
      tg.showAlert(data.message || "  ");
    }
  } catch (err) {
    console.error(err);
    tg.showAlert(" Error — ");
  }
}

function copyResult() {
  const text = document.getElementById("resultName").innerText + " | " +
               document.getElementById("resultId").innerText + " (" +
               document.getElementById("resultServer").innerText + ")";
  navigator.clipboard.writeText(text);
  tg.showAlert(" Copy ");
}

// ===== App Status  =====
async function checkAppStatus() {
  try {
    const res = await fetch(API_URL + "/api/status");
    const data = await res.json();
    appOpen = data.app_open;
    if (!appOpen) {
      tg.showAlert("  ");
    }
  } catch (e) { console.log(e); }
}

// ===== Balance  =====
async function loadBalance() {
  if (!user) return;
  try {
    const res = await fetch(API_URL + "/api/balance", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user_id: user.id })
    });
    const data = await res.json();
    document.getElementById("balance").innerText = data.balance.toLocaleString();
  } catch (e) { console.log(e); }
}

// =====   =====
function selectPay(method, btn) {
  selectedPay = method;
  document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("payInfo").style.display = "block";
  document.getElementById("selectedMethod").innerText = method;
}

// =====  Submit  =====
async function submitTopup() {
  if (!selectedPay) return tg.showAlert(" ");
  const amount = document.getElementById("topupAmount").value;
  if (!amount || amount < 1000) return tg.showAlert(" , ");

  const receiptFile = document.getElementById("receipt").files[0];
  if (!receiptFile) return tg.showAlert(" ");

  const reader = new FileReader();
  reader.onload = async function(e) {
    const receiptB64 = e.target.result.split(",")[1];
    try {
      const res = await fetch(API_URL + "/api/topup", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          user_id: user.id,
          user_name: user.first_name,
          amount: parseInt(amount),
          method: selectedPay,
          receipt: receiptB64
        })
      });
      const data = await res.json();
      tg.showAlert(data.message);
      showWallet();
    } catch (err) {
      tg.showAlert("Error — ");
    }
  };
  reader.readAsDataURL(receiptFile);
}

// =====  =====
async function buyItem(item, price) {
  if (!appOpen) return tg.showAlert("  ");
  try {
    const res = await fetch(API_URL + "/api/buy", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        user_name: user.first_name,
        item: item,
        price: price
      })
    });
    const data = await res.json();
    tg.showAlert(data.message);
  } catch (e) {
    tg.showAlert("Error");
  }
}

// ===== On Load =====
window.onload = async () => {
  if (user) {
    document.getElementById("userName").innerText = user.first_name;
    loadBalance();
    
    try {
      const res = await fetch(API_URL + "/api/status");
      const data = await res.json();
      if (!data.app_open) {
        document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f0f1a;color:#fff;text-align:center;padding:24px;font-family:sans-serif;">
            <div>
              <h1 style="font-size:64px;margin-bottom:16px;"></h1>
              <h2 style="color:#2AABEE;margin-bottom:12px;">Mini App </h2>
              <p style="color:#8888aa;">Admin   </p>
            </div>
          </div>
        `;
      }
    } catch (e) { console.log(e); }
  }
};