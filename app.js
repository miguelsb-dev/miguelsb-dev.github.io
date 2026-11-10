(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var modal = document.getElementById("photo-modal");
  var open = document.getElementById("photo-open");
  var close = document.getElementById("photo-close");
  var year = document.getElementById("year");
  var lastToggle = 0;

  if (year) year.textContent = String(new Date().getFullYear());

  function savedTheme() {
    try {
      var stored = localStorage.getItem("portfolio-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    if (!toggle) return;
    var dark = theme === "dark";
    toggle.textContent = dark ? "☀" : "☾";
    toggle.setAttribute("aria-label", dark ? "Activar tema claro" : "Activar tema oscuro");
    toggle.title = dark ? "Tema claro" : "Tema oscuro";
  }

  function persist(theme) {
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch (e) {}
  }

  applyTheme(savedTheme());

  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest ? event.target.closest("#theme-toggle") : null;
    if (!target) return;
    event.preventDefault();
    var now = Date.now();
    if (now - lastToggle < 400) return;
    lastToggle = now;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    persist(next);
  });

  function showModal() {
    if (!modal) return;
    modal.hidden = false;
    if (close) close.focus();
  }

  function hideModal() {
    if (!modal) return;
    modal.hidden = true;
    if (open) open.focus();
  }

  if (open) open.addEventListener("click", showModal);
  if (close) close.addEventListener("click", hideModal);
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-close")) hideModal();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) hideModal();
  });
})();
