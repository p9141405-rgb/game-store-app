const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
let selectedPay = "";
let appOpen = true;
let userProfile = null;

const API_URL = "https://highlighted-configure-mayor-sociology.trycloudflare.com";

// ===== Screen Management =====
function hideAll() {
  ["loadingView", "registerView", "loginView", "walletView", "topupView", "profileView"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function showRegister() {
  hideAll();
  document.getElementById("registerView").style.display = "block";
}

function showLogin() {
  hideAll();
  document.getElementById("loginView").style.display = "block";
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
    document.getElementById("pUserId").innerText = userProfile.user_id || "-";
    document.getElementById("pCreated").innerText = userProfile.created || "-";
  }
}

// ===== Register =====
async function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const pw = document.getElementById("regPassword").value;
  const cpw = document.getElementById("regConfirm").value;

  if (!name) return tg.showAlert(" ");
  if (!phone || phone.length < 7) return tg.showAlert("  ");
  if (!pw || pw.length < 4) return tg.showAlert("    ");
  if (pw !== cpw) return tg.showAlert("  ");

  try {
    const res = await fetch(API_URL + "/api/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        first_name: user.first_name,
        name: name,
        phone: phone,
        password: pw
      })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("logged_in", "yes");
      tg.showAlert(" !");
      userProfile = data.user;
      document.getElementById("userName").innerText = data.user.name;
      showWallet();
    } else {
      tg.showAlert(data.message || "Error");
    }
  } catch (e) {
    tg.showAlert("Error — ");
  }
}

// ===== Login =====
async function loginUser() {
  const name = document.getElementById("loginName").value.trim();
  const pw = document.getElementById("loginPassword").value;

  if (!name) return tg.showAlert(" ");
  if (!pw) return tg.showAlert(" ");

  try {
    const res = await fetch(API_URL + "/api/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        name: name,
        password: pw
      })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("logged_in", "yes");
      tg.showAlert(" !");
      userProfile = data.user;
      document.getElementById("userName").innerText = data.user.name;
      showWallet();
    } else {
      tg.showAlert(data.message || "    ");
    }
  } catch (e) {
    tg.showAlert("Error — ");
  }
}

// ===== Logout =====
function logoutUser() {
  tg.showConfirm(" ?", (ok) => {
    if (ok) {
      localStorage.removeItem("logged_in");
      userProfile = null;
      showLogin();
    }
  });
}

// ===== Check User on Load =====
async function checkUser() {
  const isLoggedIn = localStorage.getItem("logged_in");
  
  try {
    const res = await fetch(API_URL + "/api/user_status", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user_id: user.id })
    });
    const data = await res.json();
    
    if (data.registered) {
      userProfile = data.user;
      if (isLoggedIn === "yes") {
        document.getElementById("userName").innerText = data.user.name;
        showWallet();
      } else {
        showLogin();
      }
    } else {
      showRegister();
    }
  } catch (e) {
    console.log(e);
    showRegister();
  }
}

// ===== App Status =====
async function checkAppStatus() {
  try {
    const res = await fetch(API_URL + "/api/status");
    const data = await res.json();
    appOpen = data.app_open;
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