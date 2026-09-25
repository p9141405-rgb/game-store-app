const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
let selectedPay = "";
let appOpen = true;
let userProfile = null;
let currentBalance = 0;

// ⭐ သင့် URL
const API_URL = "https://highlighted-configure-mayor-sociology.trycloudflare.com";
const ADMIN_USERNAME = "pyae_phyo_12327";

function showToast(message, type = "info") {
  const box = document.getElementById("toastBox");
  if (!box) return;
  box.className = "toast-box " + type;
  box.innerText = message;
  setTimeout(() => box.classList.add("show"), 10);
  setTimeout(() => { box.classList.remove("show"); }, 4000);
}

// ===== ITEMS DATA =====
const ITEMS = {
  mlbb: { title: "Mobile Legends", img: "mlbb.png", needServer: true, needId: true, items: [ { name: "Weekly Pass", price: 6650 }, { name: "Miya Twilight Pass", price: 35000 }, { name: "Diamond 86", price: 5500 }, { name: "Diamond 172", price: 11500 }, { name: "Diamond 257", price: 16300 }, { name: "Diamond 343", price: 21500 }, { name: "Diamond 429", price: 26800 }, { name: "Diamond 514", price: 31800 }, { name: "Diamond 600", price: 37000 }, { name: "Diamond 706", price: 42400 }, { name: "Diamond 878", price: 53000 }, { name: "Diamond 963", price: 58300 }, { name: "Diamond 1049", price: 63600 }, { name: "Diamond 1135", price: 68900 }, { name: "Diamond 1412", price: 84800 }, { name: "Diamond 2195", price: 128000 }, { name: "Diamond 3688", price: 213000 }, { name: "Diamond 5532", price: 319500 }, { name: "Diamond 9288", price: 530000 }, { name: "50+50", price: 4000 }, { name: "150+150", price: 12500 }, { name: "250+250", price: 17500 }, { name: "500+500", price: 34500 } ] },
  pubg: { title: "PUBG Mobile", img: "pubg.png", needServer: false, needId: true, items: [ { name: "UC 60", price: 4700 }, { name: "UC 120", price: 9400 }, { name: "UC 180", price: 13900 }, { name: "UC 325", price: 22700 }, { name: "UC 660", price: 45300 }, { name: "UC 780", price: 52900 }, { name: "UC 1800", price: 114000 }, { name: "UC 3850", price: 226000 }, { name: "UC 8100", price: 440000 }, { name: "First Purchase", price: 5950 }, { name: "Firearm Materials", price: 14000 }, { name: "Mythic Emblem Pack", price: 22750 }, { name: "Elite Pass Lv1-50", price: 26000 }, { name: "Elite Pass Lv1-100", price: 52000 }, { name: "Elite Pass Plus Lv1-100", price: 112500 }, { name: "Weekly Mythic Emblem", price: 17000 }, { name: "Weekly Deal Pack 1", price: 6000 }, { name: "Weekly Deal Pack 2", price: 14500 }, { name: "Prime 1 Month", price: 6000 }, { name: "Prime 3 Month", price: 15000 }, { name: "Prime 6 Month", price: 27000 }, { name: "Prime 12 Month", price: 51000 }, { name: "Prime+ 1 Month", price: 46000 }, { name: "Prime+ 3 Month", price: 126000 }, { name: "Prime+ 6 Month", price: 245000 }, { name: "Prime+ 12 Month", price: 482000 } ] },
  magic: { title: "Magic Chess Go Go", img: "magic.png", needServer: true, needId: true, items: [ { name: "Weekly Pass (WP)", price: 8500 }, { name: "50+50", price: 4000 }, { name: "150+150", price: 11000 }, { name: "250+250", price: 18500 }, { name: "500+500", price: 35700 }, { name: "Diamond 86", price: 6000 }, { name: "Diamond 172", price: 11900 }, { name: "Diamond 257", price: 17500 }, { name: "Diamond 344", price: 23000 }, { name: "Diamond 516", price: 34000 }, { name: "Diamond 706", price: 45000 }, { name: "Diamond 1346", price: 84200 }, { name: "Diamond 1825", price: 111500 }, { name: "Diamond 2195", price: 138000 }, { name: "Diamond 3688", price: 220000 }, { name: "Diamond 5532", price: 337500 }, { name: "Diamond 9288", price: 530000 } ] },
  premium: { title: "App Premium", img: "premium.png", needServer: false, needId: false, items: [ { name: "⭐️ Tg SMS Free", price: 8000 }, { name: "Telegram 1 Month Login", price: 19500 }, { name: "Telegram 3 Month", price: 59000 }, { name: "Telegram 6 Month", price: 7700 }, { name: "Telegram 12 Month", price: 135000 }, { name: "Alight Motion 1 Year", price: 5000 }, { name: "Capcut Pro 1 Month", price: 8500 }, { name: "Capcut Pro 1 Month (PC)", price: 18000 }, { name: "Canva Lifetime", price: 6500 }, { name: "ChatGPT Plus 1M (Share)", price: 28000 }, { name: "ChatGPT Plus 1M (Private)", price: 103000 }, { name: "Gemini 1M (Family)", price: 13000 }, { name: "Gemini 3M (Family)", price: 21000 }, { name: "Gemini 18M (Own)", price: 385000 } ] }
};

let currentBuy = null;
let currentBuyGameKey = "";

function hideAll() {
  ["loadingView", "registerView", "loginView", "walletView", "gameView", "topupView", "profileView", "buyView", "successView"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function showRegister() { hideAll(); document.getElementById("registerView").style.display = "block"; }
function showLogin() { hideAll(); document.getElementById("loginView").style.display = "block"; }
function showWallet() { hideAll(); document.getElementById("walletView").style.display = "block"; loadBalance(); }
function showTopup() { hideAll(); document.getElementById("topupView").style.display = "block"; }
function closeBuy() { showGame(currentBuyGameKey); }

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

function openGame(key) { currentBuyGameKey = key; showGame(key); }

function showGame(key) {
  hideAll();
  const game = ITEMS[key];
  if (!game) return;
  document.getElementById("gameView").style.display = "block";
  document.getElementById("gameHeaderImg").src = game.img;
  document.getElementById("gameHeaderTitle").innerText = game.title;
  const container = document.getElementById("gameItemsList");
  container.innerHTML = "";
  game.items.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "item-btn";
    btn.innerHTML = `${item.name}<b>${item.price.toLocaleString()} Ks</b>`;
    btn.onclick = () => openBuy(key, game.title, item.name, item.price);
    container.appendChild(btn);
  });
}

async function openBuy(key, gameTitle, itemName, price) {
  hideAll();
  document.getElementById("buyView").style.display = "block";
  document.getElementById("buyGame").innerText = gameTitle;
  document.getElementById("buyItem").innerText = itemName;
  document.getElementById("buyPrice").innerText = price.toLocaleString() + " Ks";
  document.getElementById("buyGameId").value = "";
  document.getElementById("buyServerId").value = "";
  document.getElementById("buyNote").value = "";
  
  await loadBalance();
  document.getElementById("buyBalance").innerText = currentBalance.toLocaleString() + " Ks";
  
  const gameData = ITEMS[key];
  if (!gameData.needId) {
    document.getElementById("gameIdBlock").style.display = "none";
    document.getElementById("serverIdBlock").style.display = "none";
  } else if (gameData.needServer) {
    document.getElementById("gameIdBlock").style.display = "block";
    document.getElementById("serverIdBlock").style.display = "block";
    document.getElementById("buyGameIdLabel").innerText = "🆔 ဂိမ်း ID ထည့်ပါ";
  } else {
    document.getElementById("gameIdBlock").style.display = "block";
    document.getElementById("serverIdBlock").style.display = "none";
    document.getElementById("buyGameIdLabel").innerText = "🆔 ဂိမ်း ID ထည့်ပါ";
  }
  
  currentBuy = { key, game: gameTitle, item: itemName, price: price };
}

async function confirmBuy() {
  if (!currentBuy) return;
  
  let gameId = "N/A";
  let serverId = "";
  const gameData = ITEMS[currentBuy.key];
  
  if (gameData.needId) {
    gameId = document.getElementById("buyGameId").value.trim();
    if (!gameId) return showToast("🆔 ဂိမ်း ID ထည့်ပါ", "error");
    if (gameData.needServer) {
      serverId = document.getElementById("buyServerId").value.trim();
      if (!serverId) return showToast("🌐 Server ID ထည့်ပါ", "error");
    }
  }
  
  const note = document.getElementById("buyNote").value.trim();
  
  if (currentBalance < currentBuy.price) {
    return showToast("❌ လက်ကျန်ငွေ မလုံလောက်ပါ", "error");
  }
  
  try {
    const res = await fetch(API_URL + "/api/buy", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        user_name: userProfile?.name || user.first_name,
        user_phone: userProfile?.phone || "",
        user_username: user.username || "",
        game: currentBuy.game,
        item: currentBuy.item,
        price: currentBuy.price,
        game_id: gameId,
        server_id: serverId,
        note: note
      })
    });
    const data = await res.json();
    
    if (data.success) {
      showToast("✅ ဝယ်ယူမှု အောင်မြင်ပါသည်!\n🛒 " + currentBuy.item + "\n💵 " + currentBuy.price.toLocaleString() + " Ks ဖြတ်ပြီး\n💰 လက်ကျန်: " + data.new_balance.toLocaleString() + " Ks", "success");
      setTimeout(() => showSuccess(data.new_balance), 1800);
    } else {
      showToast(data.message || "❌ Error", "error");
    }
  } catch (e) {
    showToast("⚠️ Error: " + e.message, "error");
  }
}

function showSuccess(newBalance) {
  hideAll();
  document.getElementById("successView").style.display = "block";
  document.getElementById("successGame").innerText = currentBuy.game;
  document.getElementById("successItem").innerText = currentBuy.item;
  document.getElementById("successPrice").innerText = currentBuy.price.toLocaleString() + " Ks";
  document.getElementById("successBalance").innerText = newBalance.toLocaleString() + " Ks";
  document.getElementById("successTime").innerText = new Date().toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  document.getElementById("adminContactBox").style.display = "block";
}

function openAdminChat() {
  tg.openTelegramLink(`https://t.me/${ADMIN_USERNAME}`);
}

async function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const pw = document.getElementById("regPassword").value;
  const cpw = document.getElementById("regConfirm").value;
  
  if (!name) return showToast("အမည် ထည့်ပါ", "error");
  if (!phone || phone.length < 7) return showToast("ဖုန်းနံပါတ် မှန်ကန်စွာ ထည့်ပါ", "error");
  if (!pw || pw.length < 4) return showToast("စကားဝှက် အနည်းဆုံး ၄ လုံး", "error");
  if (pw !== cpw) return showToast("စကားဝှက် နှစ်ခု မတူပါ", "error");
  
  try {
    const res = await fetch(API_URL + "/api/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        user_id: user.id,
        first_name: user.first_name,
        username: user.username || "",
        name: name,
        phone: phone,
        password: pw
      })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem("logged_in", "yes");
      showToast("✅ အကောင့်ဖွင့်ပြီးပါပြီ!\n👤 " + (data.user?.name || name), "success");
      userProfile = data.user;
      document.getElementById("userName").innerText = data.user?.name || name;
      setTimeout(() => showWallet(), 1200);
    } else {
      showToast(data.message || "❌ Error", "error");
    }
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

async function loginUser() {
  const name = document.getElementById("loginName").value.trim();
  const pw = document.getElementById("loginPassword").value;
  if (!name) return showToast("အမည် ထည့်ပါ", "error");
  if (!pw) return showToast("စကားဝှက် ထည့်ပါ", "error");
  try {
    const res = await fetch(API_URL + "/api/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user_id: user.id, name, password: pw })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("logged_in", "yes");
      showToast("✅ ဝင်ရောက်ပြီးပါပြီ!\n👤 " + data.user.name, "success");
      userProfile = data.user;
      document.getElementById("userName").innerText = data.user.name;
      setTimeout(() => showWallet(), 1200);
    } else {
      showToast(data.message || "❌ Error", "error");
    }
  } catch (e) { showToast("Error: " + e.message, "error"); }
}

function logoutUser() {
  tg.showConfirm("အကောင့်မှ ထွက်မည်လား?", (ok) => {
    if (ok) {
      localStorage.removeItem("logged_in");
      userProfile = null;
      showLogin();
    }
  });
}

// ⭐ App Status စစ်ဆေးခြင်း
async function checkAppStatus() {
  try {
    const res = await fetch(API_URL + "/api/status");
    const data = await res.json();
    appOpen = data.app_open;
    if (!appOpen) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f0f1a;color:#fff;text-align:center;padding:24px;font-family:sans-serif;">
          <div>
            <h1 style="font-size:64px;margin-bottom:16px;">🔒</h1>
            <h2 style="color:#2AABEE;margin-bottom:12px;">Mini App ပိတ်ထားပါသည်</h2>
            <p style="color:#8888aa;margin-bottom:20px;">Admin မှ ပြန်ဖွင့်သည်အထိ စောင့်ပါ</p>
            <button onclick="location.reload()" style="padding:12px 24px;background:#2AABEE;color:#fff;border:none;border-radius:10px;font-size:14px;">🔄 ပြန်စစ်မည်</button>
          </div>
        </div>
      `;
    }
  } catch (e) { console.log(e); }
}

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
  } catch (e) { showRegister(); }
}

async function loadBalance() {
  if (!user) return;
  try {
    const res = await fetch(API_URL + "/api/balance", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ user_id: user.id })
    });
    const data = await res.json();
    currentBalance = data.balance;
    document.getElementById("balance").innerText = data.balance.toLocaleString();
    return data.balance;
  } catch (e) { console.log(e); }
}

function selectPay(method, btn) {
  selectedPay = method;
  document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("payInfo").style.display = "block";
  document.getElementById("selectedMethod").innerText = method;
}

async function submitTopup() {
  if (!selectedPay) return showToast("ငွေလွှဲနည်းလမ်း ရွေးပါ", "error");
  const amount = document.getElementById("topupAmount").value;
  if (!amount || amount < 1000) return showToast("အနည်းဆုံး ၁,၀၀၀ ကျပ်", "error");
  const receiptFile = document.getElementById("receipt").files[0];
  if (!receiptFile) return showToast("ပြေစာ တင်ပါ", "error");
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
      showToast("✅ Admin ဆီ ပို့ပြီး\n💰 " + parseInt(amount).toLocaleString() + " Ks\n⏳ အတည်ပြုတဲ့အထိ စောင့်ပါ", "success");
      setTimeout(() => showWallet(), 1500);
    } catch (err) { showToast("Error: " + err.message, "error"); }
  };
  reader.readAsDataURL(receiptFile);
}

window.onload = async () => {
  if (user) {
    await checkAppStatus();
    await checkUser();
  } else {
    hideAll();
    document.getElementById("registerView").style.display = "block";
  }
};