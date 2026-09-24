const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
if (user) {
  document.getElementById("greeting").innerText =
    "မင်္ဂလာပါ " + user.first_name + " 👋";
}

function buy(item) {
  tg.showAlert(item + " ကို ဝယ်ရန် အတည်ပြုပါ");
}

function closeApp() {
  tg.close();
}