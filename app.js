const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
let selectedPay = "";
let appOpen = true;
let userProfile = null;

//   URL 
const API_URL = "https://highlighted-configure-mayor-sociology.trycloudflare.com";

// ===== Screen Management =====
function hideAll() {
  document.getElementById("loadingView").style.display = "none";
  document.getElementById("registerView").style.display = "none";
  document.getElementById("walletView").style.display = "none";
  document.getElementById("topupView").style.display = "none";
  document.getElementById("profileView").style.display = "none";
}

function showWallet() {
  hideAll();
  document.getElementById("walletView").style.display = "block";
  loadBalance();
}

function showTopup() {
  hideAll();
  document.getElementById("topupView").style.display = "block";
}

function showProfile() {
  hideAll();
  document.getElementById("profileView").style.display = "block";
  if (userProfile) {
    document.getElementById("pName").innerText = userProfile.name || "-";
    document.getElementById("pPhone").innerText = userProfile.phone || "-";
    document.getElementById("pGameId").innerText = userProfile.game_id || "-";
    document.getElementById("pUserId").innerText = userProfile.user_id || "-";
    document.getElementById("pCreated").innerText = userProfile.created || "-";
  }
}

// ===== Register User =====
async function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const gameId = document.getElementById("regGameId").value.trim();

  if (!name) return tg.showAlert(" ");
  if (!phone || phone.length < 7) return tg.showAlert("  ");

  try {
    const res = await fetch(API_URL + "/api/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        first_name: user.first_name,
        name: name,
        phone: phone,
        game_id: gameId
      })
    });
    const data = await res.json();
    if (data.success) {
      tg.showAlert(" !");
      userProfile = data.user;
      showWallet();
    } else {
      tg.showAlert(data.message || "Error");
    }
  } catch (e) {
    tg.showAlert("Error — ");
  }
}

// ===== Check User Status =====
async function checkUser() {
  try {
    const res = await fetch(API_URL + "/api/user_status", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user_id: user.id })
    });
    const data = await res.json();
    
    if (data.registered) {
      userProfile = data.user;
      document.getElementById("userName").innerText = data.user.name || user.first_name;
      showWallet();
    } else {
      hideAll();
      document.getElementById("registerView").style.display = "block";
    }
  } catch (e) {
    console.log(e);
    hideAll();
    document.getElementById("registerView").style.display = "block";
  }
}

// ===== App Status =====
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
  } catch (e) { console.log(e); }
}

// ===== Payment =====
function selectPay(method, btn) {
  selectedPay = method;
  document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("payInfo").style.display = "block";
  document.getElementById("selectedMethod").innerText = method;
}

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
          user_name: userProfile?.name || user.first_name,
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

// ===== Buy =====
async function buyItem(item, price) {
  if (!appOpen) return tg.showAlert("  ");
  try {
    const res = await fetch(API_URL + "/api/buy", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        user_name: userProfile?.name || user.first_name,
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
    await checkUser();
    checkAppStatus();
  } else {
    hideAll();
    document.getElementById("registerView").style.display = "block";
  }
};