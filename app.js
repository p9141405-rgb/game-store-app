const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
let selectedPay = "";

const API_URL = "https://mention-kurt-flag-arranged.trycloudflare.com";

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

// ===== Submit Topup =====
async function submitTopup() {
  if (!selectedPay) return tg.showAlert("ငွေလွှဲနည်းလမ်း ရွေးပါ");
  const amount = document.getElementById("topupAmount").value;
  if (!amount || amount < 1000) return tg.showAlert("အနည်းဆုံး ၁,၀၀၀ ကျပ်");

  const receipt = document.getElementById("receipt").files[0];
  if (!receipt) return tg.showAlert("ပြေစာ တင်ပါ");

  try {
    const res = await fetch(API_URL + "/api/topup", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        user_name: user.first_name,
        amount: parseInt(amount),
        method: selectedPay
      })
    });
    const data = await res.json();
    tg.showAlert(data.message);
    showWallet();
  } catch (e) {
    tg.showAlert("Error — ပြန်စမ်းပါ");
  }
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