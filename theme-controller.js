/* Shared theme controller for the homepage and protected lesson viewer. */
(() => {
  "use strict";

  const COLOR_KEY = "timsons-lesson-theme-color";
  const DARK_KEY = "timsons-lesson-dark";
  const VALID_COLORS = ["color-1", "color-2", "color-3"];

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function read(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  }

  function applyColor(value) {
    const color = VALID_COLORS.includes(value) ? value : "color-2";
    document.querySelectorAll('link.alternate-style[title^="color-"]').forEach((link) => {
      if (link.title === color) link.removeAttribute("disabled");
      else link.setAttribute("disabled", "true");
    });

    document.querySelectorAll("[data-theme-color]").forEach((control) => {
      const selected = control.dataset.themeColor === color;
      control.setAttribute("aria-pressed", String(selected));
      control.classList.toggle("is-active", selected);
    });

    save(COLOR_KEY, color);
    return color;
  }

  function applyDark(enabled) {
    const isDark = Boolean(enabled);
    document.body.classList.toggle("dark", isDark);

    document.querySelectorAll(".day-night i, .lesson-dark-toggle i").forEach((icon) => {
      icon.classList.toggle("fa-sun", isDark);
      icon.classList.toggle("fa-moon", !isDark);
    });

    document.querySelectorAll(".day-night, .lesson-dark-toggle").forEach((control) => {
      control.setAttribute("aria-pressed", String(isDark));
      control.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      control.setAttribute("title", isDark ? "Light mode" : "Dark mode");
    });

    save(DARK_KEY, isDark ? "1" : "0");
  }

  function init() {
    const switcher = document.querySelector(".style-switcher");
    const switcherToggle = document.querySelector(".style-switcher-toggler");

    if (switcher && switcherToggle && switcherToggle.dataset.themeReady !== "true") {
      switcherToggle.dataset.themeReady = "true";
      switcherToggle.setAttribute("role", "button");
      switcherToggle.setAttribute("tabindex", "0");
      switcherToggle.setAttribute("aria-label", "Open theme settings");
      const toggleSwitcher = () => switcher.classList.toggle("open");
      switcherToggle.addEventListener("click", toggleSwitcher);
      switcherToggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleSwitcher();
        }
      });
      window.addEventListener("scroll", () => switcher.classList.remove("open"), { passive: true });
    }

    document.querySelectorAll(".day-night, .lesson-dark-toggle").forEach((control) => {
      if (control.dataset.themeReady === "true") return;
      control.dataset.themeReady = "true";
      control.setAttribute("role", "button");
      control.setAttribute("tabindex", "0");
      const toggleDark = () => applyDark(!document.body.classList.contains("dark"));
      control.addEventListener("click", toggleDark);
      control.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleDark();
        }
      });
    });

    document.querySelectorAll("[data-theme-color]").forEach((control) => {
      if (control.dataset.themeReady === "true") return;
      control.dataset.themeReady = "true";
      control.setAttribute("role", "button");
      control.setAttribute("tabindex", "0");
      control.addEventListener("click", () => applyColor(control.dataset.themeColor));
      control.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          applyColor(control.dataset.themeColor);
        }
      });
    });

    window.setActiveStyle = applyColor;
    applyColor(read(COLOR_KEY, "color-2"));
    applyDark(read(DARK_KEY, "0") === "1");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
