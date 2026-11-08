/* Timson's English Lessons — appearance controls */
(() => {
  const body = document.body;
  const switcher = document.querySelector(".style-switcher");
  const switcherToggle = document.querySelector(".style-switcher-toggler");
  const dayNight = document.querySelector(".day-night");
  const alternateStyles = [...document.querySelectorAll(".alternate-style")];
  const sidebarThemeToggle = document.querySelector(".sidebar-theme-toggle");
  const sidebarColorButtons = [...document.querySelectorAll("[data-theme-color]")];
  const validColors = ["color-1", "color-2", "color-3"];

  function setDarkMode(enabled, persist = true) {
    body.classList.toggle("dark", enabled);
    const icon = dayNight?.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-sun", enabled);
      icon.classList.toggle("fa-moon", !enabled);
    }
    if (sidebarThemeToggle) {
      sidebarThemeToggle.setAttribute("aria-pressed", String(enabled));
      const sidebarIcon = sidebarThemeToggle.querySelector("i");
      if (sidebarIcon) {
        sidebarIcon.classList.toggle("fa-sun", enabled);
        sidebarIcon.classList.toggle("fa-moon", !enabled);
      }
      const label = sidebarThemeToggle.querySelector("span");
      if (label) label.textContent = enabled ? "Light mode" : "Dark mode";
    }
    if (persist) {
      try { localStorage.setItem("timsons-theme-dark", String(enabled)); } catch (_) {}
    }
  }

  function setActiveStyle(color, persist = true) {
    if (!validColors.includes(color)) return;
    alternateStyles.forEach(style => {
      style.disabled = style.getAttribute("title") !== color;
    });
    sidebarColorButtons.forEach(button => {
      const active = button.dataset.themeColor === color;
      button.setAttribute("aria-pressed", String(active));
    });
    if (persist) {
      try { localStorage.setItem("timsons-theme-color", color); } catch (_) {}
    }
  }
  window.setActiveStyle = setActiveStyle;

  switcherToggle?.addEventListener("click", () => switcher?.classList.toggle("open"));
  window.addEventListener("scroll", () => switcher?.classList.remove("open"), { passive: true });
  dayNight?.addEventListener("click", () => setDarkMode(!body.classList.contains("dark")));
  sidebarThemeToggle?.addEventListener("click", () => setDarkMode(!body.classList.contains("dark")));
  sidebarColorButtons.forEach(button => {
    button.addEventListener("click", () => setActiveStyle(button.dataset.themeColor));
  });

  let savedDark = false;
  let savedColor = "color-2";
  try {
    savedDark = localStorage.getItem("timsons-theme-dark") === "true";
    const storedColor = localStorage.getItem("timsons-theme-color");
    if (validColors.includes(storedColor)) savedColor = storedColor;
  } catch (_) {}
  setActiveStyle(savedColor, false);
  setDarkMode(savedDark, false);
})();
