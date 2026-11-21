
// ========================================
// MINECRAFT NEON HUB PRO
// Frontend prototype
// ========================================

const $ = id => document.getElementById(id);

let currentUser = null;
let authMode = "register";

let users = JSON.parse(localStorage.getItem("nh_users") || "[]");
let news = JSON.parse(localStorage.getItem("nh_news") || "[]");
let messages = JSON.parse(localStorage.getItem("nh_messages") || "[]");

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ========================================
// ТЕМА
// ========================================

function loadTheme() {
  const theme = localStorage.getItem("nh_theme") || "dark";

  document.body.classList.toggle("light", theme === "light");
  $("themeBtn").textContent = theme === "light" ? "🌙" : "☀️";
}

$("themeBtn").onclick = () => {
  const isLight = document.body.classList.toggle("light");

  localStorage.setItem("nh_theme", isLight ? "light" : "dark");
  $("themeBtn").textContent = isLight ? "🌙" : "☀️";
};

// ========================================
// АВТОРИЗАЦІЯ — ДЕМО-РЕЖИМ
// ========================================

function showAuth(mode = "register") {
  authMode = mode;

  $("authModal").classList.remove("hidden");
  $("authMessage").textContent = "";

  $("username").classList.toggle("hidden", mode !== "register");

  $("authSubmit").textContent = {
    register: "Створити акаунт",
    login: "Увійти",
    admin: "Перевірити доступ"
  }[mode];
}

function hideAuth() {
  $("authModal").classList.add("hidden");
}

$("loginBtn").onclick = () => {
  if (currentUser) {
    currentUser = null;
    $("loginBtn").textContent = "Увійти";
    updateProfile();
    return;
  }

  showAuth("login");
};

// Перемикання режимів
document.querySelectorAll(".tabs button").forEach((button, index) => {
  button.onclick = () => {
    showAuth(["register", "login", "admin"][index]);
  };
});

$("authForm").onsubmit = event => {
  event.preventDefault();

  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  const name = $("username").value.trim();

  if (authMode === "admin") {
    $("authMessage").textContent =
      "Адмін-вхід потребує серверної авторизації. Frontend-перевірка не захищає адмінку.";
    return;
  }

  if (!email || password.length < 8) {
    $("authMessage").textContent =
      "Введи правильну пошту та пароль від 8 символів.";
    return;
  }

  if (authMode === "register") {
    if (!name) {
      $("authMessage").textContent = "Введи Minecraft нік!";
      return;
    }

    if (users.some(user => user.email === email)) {
      $("authMessage").textContent = "Така пошта вже існує!";
      return;
    }

    // Демонстраційний профіль.
    // Пароль навмисно не зберігається.
    const user = {
      name,
      email,
      bio: "Гравець Minecraft",
      joined: new Date().toLocaleDateString("uk-UA"),
      role: "user"
    };

    users.push(user);
    save("nh_users", users);
    currentUser = user;

  } else {
    const user = users.find(item => item.email === email);

    if (!user) {
      $("authMessage").textContent =
        "Профіль не знайдений. Для справжнього входу потрібен сервер.";
      return;
    }

    $("authMessage").textContent =
      "Це демонстраційний профіль. Перевірка пароля потребує сервера.";
    return;
  }

  sessionStorage.setItem(
    "nh_demo_user",
    JSON.stringify(currentUser)
  );

  $("authForm").reset();
  hideAuth();
  updateProfile();
};

// ========================================
// ПРОФІЛЬ
// ========================================

function updateProfile() {
  const panel = $("profileInfo");
  panel.innerHTML = "";

  if (!currentUser) {
    panel.textContent = "Увійди, щоб побачити свій профіль.";
    $("loginBtn").textContent = "Увійти";
    $("admin").classList.add("hidden");
    return;
  }

  $("loginBtn").textContent = "Вийти";

  const title = document.createElement("h3");
  title.textContent = "👤 " + currentUser.name;

  const email = document.createElement("p");
  email.textContent = "Email: " + currentUser.email;

  const bio = document.createElement("p");
  bio.textContent = "Опис: " + currentUser.bio;

  const joined = document.createElement("p");
  joined.textContent = "Дата реєстрації: " + currentUser.joined;

  const logout = document.createElement("button");
  logout.textContent = "Вийти з акаунта";

  logout.onclick = () => {
    currentUser = null;
    sessionStorage.removeItem("nh_demo_user");
    updateProfile();
  };

  panel.append(title, email, bio, joined, logout);

  // Адмін-панель показується тільки для ролі,
  // яку має призначити довірений сервер.
  $("admin").classList.toggle(
    "hidden",
    currentUser.role !== "admin"
  );

  if (currentUser.role === "admin") {
    renderUsers();
  }
}

// Відновлення демонстраційного сеансу
try {
  currentUser = JSON.parse(
    sessionStorage.getItem("nh_demo_user") || "null"
  );
} catch {
  currentUser = null;
}

// ========================================
// ПОШУК ГРАВЦІВ
// ========================================

$("search").oninput = () => {
  const query = $("search").value.trim().toLowerCase();
  const result = $("searchResults");

  result.innerHTML = "";

  if (!query) return;

  const found = users.filter(user =>
    user.name.toLowerCase().includes(query)
  );

  if (!found.length) {
    result.textContent = "Гравців не знайдено.";
    return;
  }

  found.forEach(user => {
    const item = document.createElement("div");
    item.className = "user-item";
    item.textContent = "👤 " + user.name;
    result.append(item);
  });
};

// ========================================
// ЧАТ — ЛОКАЛЬНИЙ ДЕМО-РЕЖИМ
// ========================================

function renderMessages() {
  const box = $("messages");
  box.innerHTML = "";

  const welcome = document.createElement("p");
  welcome.className = "system-message";
  welcome.textContent = "Вітаємо у Minecraft Neon Hub!";
  box.append(welcome);

  messages.slice(-100).forEach(message => {
    const item = document.createElement("div");
    item.className = "message";

    const author = document.createElement("strong");
    author.textContent = message.author + ": ";

    const content = document.createElement("span");
    content.textContent = message.text;

    item.append(author, content);
    box.append(item);
  });

  box.scrollTop = box.scrollHeight;
}

$("chatForm").onsubmit = event => {
  event.preventDefault();

  if (!currentUser) {
    alert("Спочатку увійди в профіль!");
    showAuth("register");
    return;
  }

  const text = $("chatInput").value.trim();

  if (!text) return;

  messages.push({
    author: currentUser.name,
    text,
    date: Date.now()
  });

  save("nh_messages", messages);

  $("chatInput").value = "";
  renderMessages();
};

// ========================================
// НОВИНИ
// ========================================

function renderNews() {
  const list = $("newsList");
  list.innerHTML = "";

  if (!news.length) {
    const empty = document.createElement("p");
    empty.textContent = "Поки що новин немає.";
    list.append(empty);
    return;
  }

  news.forEach(item => {
    const card = document.createElement("article");
    card.className = "card";

    const heading = document.createElement("h3");
    heading.textContent = "📢 " + item.title;

    const description = document.createElement("p");
    description.textContent = item.text;

    card.append(heading, description);
    list.append(card);
  });
}

// ========================================
// АДМІН-ПАНЕЛЬ
// ========================================

function renderUsers() {
  $("userCount").textContent = users.length;

  const list = $("userList");
  list.innerHTML = "";

  users.forEach(user => {
    const item = document.createElement("div");
    item.className = "user-item";
    item.textContent = "👤 " + user.name + " — " + user.role;
    list.append(item);
  });
}

$("addNews").onclick = () => {
  if (!currentUser || currentUser.role !== "admin") {
    alert("Немає прав адміністратора!");
    return;
  }

  const title = $("announcement").value.trim();
  const text = $("newsText").value.trim();

  if (!title || !text) {
    alert("Заповни заголовок і текст!");
    return;
  }

  news.unshift({ title, text });

  save("nh_news", news);
  renderNews();

  $("announcement").value = "";
  $("newsText").value = "";
};

$("clearChat").onclick = () => {
  if (!currentUser || currentUser.role !== "admin") {
    alert("Немає прав адміністратора!");
    return;
  }

  if (!confirm("Очистити історію чату?")) return;

  messages = [];
  save("nh_messages", messages);
  renderMessages();
};

// ========================================
// ЗАПУСК
// ========================================

loadTheme();
updateProfile();
renderMessages();
renderNews();