const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// အသုံးပြုသူ အမည်
const user = tg.initDataUnsafe?.user;
if (user) {
  document.getElementById("greeting").innerText =
    "မင်္ဂလာပါ " + user.first_name + " 👋";
}

// ဂိမ်း ရှာခြင်း
function filterGames() {
  const q = document.getElementById("search").value.toLowerCase();
  document.querySelectorAll(".game-card").forEach(card => {
    const name = card.dataset.name.toLowerCase();
    card.style.display = name.includes(q) ? "flex" : "none";
  });
}

// Category ရွေးခြင်း
function filterCat(cat, btn) {
  document.querySelectorAll(".cat").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.querySelectorAll(".game-card").forEach(card => {
    if (cat === "all" || card.dataset.cat === cat) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// ဝယ်ခြင်း
function buy(item) {
  tg.showAlert(item + " အတွက် စျေးနှုန်း မကြာမီ ထည့်သွင်းပါမည်။");
}

// ပိတ်ခြင်း
function closeApp() {
  tg.close();
}