const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
let selectedPay = "";

const API_URL = "https://marvel-truly-ranging-survive.trycloudflare.com";

// ===== Screens =====
function showWallet() {
  document.getElementById("walletView").style.display = "block";
  document.getElementById("topupView").style.display = "none";
  document.getElementById("gamesView").style.display = "none";
  loadBalance();
}

function showTopup() {
  document.getElementById("walletView").style.display = "none";
  document.getElementById("topupView").style.display = "block";
  document.getElementById("gamesView").style.display = "none";
}

function showGames() {
  document.getElementById("walletView").style.display = "none";
  document.getElementById("topupView").style.display = "none";
  document.getElementById("gamesView").style.display = "block";
}

// ===== Balance =====
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
  } catch (e) { console.log("Balance error", e); }
}

// ===== Payment Method =====
function selectPay(method, btn) {
  selectedPay = method;
  document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("payInfo").style.display = "block";
  document.getElementById("selectedMethod").innerText = method;
}

// ===== Submit Topup with Receipt =====
async function submitTopup() {
  if (!selectedPay) return tg.showAlert("ငွေလွှဲနည်းလမ်း ရွေးပါ");
  const amount = document.getElementById("topupAmount").value;
  if (!amount || amount < 1000) return tg.showAlert("အနည်းဆုံး ၁,၀၀၀ ကျပ်");

  const receiptFile = document.getElementById("receipt").files[0];
  if (!receiptFile) return tg.showAlert("ပြေစာ တင်ပါ");

  // ပြေစာပုံကို Base64 ပြောင်း
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
      tg.showAlert("Error — ပြန်စမ်းပါ");
    }
  };
  reader.readAsDataURL(receiptFile);
}

// ===== Buy =====
async function buyItem(item, price) {
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

window.onload = () => {
  if (user) {
    document.getElementById("userName").innerText = user.first_name;
    loadBalance();
  }
};