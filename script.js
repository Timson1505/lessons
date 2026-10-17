const phrases = ["teacher", "programmer"];
    let index = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const text = phrases[index];
      const element = document.getElementsByClassName('typing')[0]; // Select the first element

      if (isDeleting) {
        element.innerHTML = text.substring(0, charIndex - 1);
      } else {
        element.innerHTML = text.substring(0, charIndex + 1);
      }

      charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

      if (!isDeleting && charIndex === text.length + 1) {
        isDeleting = true;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        index = (index + 1) % phrases.length;
      }

      setTimeout(type, isDeleting ? 100 : 200);
    }

    document.addEventListener('DOMContentLoaded', type);


    /* === For Menu Links === */

  const buttons = document.querySelectorAll('.dropdown-title');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const list = btn.nextElementSibling;
      list.classList.toggle('open');
    });
  });

  /* ====== Passord Modal ====== */
  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("passwordModal");
    const input = document.getElementById("passwordInput");
    const button = document.getElementById("unlockBtn");
    const errorMsg = document.getElementById("errorMsg");
    const protectedContent = document.getElementById("protectedContent");

    const PASSWORD = "Timson2025";
    const STORAGE_KEY = "timson_unlocked";

    // If already unlocked before → skip modal
    if (localStorage.getItem(STORAGE_KEY) === "true") {
        modal.style.display = "none";
        protectedContent.style.display = "block";
    } else {
        modal.style.display = "flex";
        protectedContent.style.display = "none";
    }

    button.addEventListener("click", function () {
        const value = input.value;

        if (value === PASSWORD) {
            localStorage.setItem(STORAGE_KEY, "true"); // remember forever (until cleared)
            modal.style.display = "none";
            protectedContent.style.display = "block";
        } else {
            errorMsg.textContent = "Incorrect password";
        }
    });
});

// ===== Account modal UI =====
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("accountModal");
    const openButton = document.getElementById("openAccountModal");
    const closeButton = document.getElementById("closeAccountModal");
    const form = document.getElementById("accountForm");
    const submitButton = document.getElementById("accountSubmit");
    const status = document.getElementById("accountStatus");
    const password = document.getElementById("accountPassword");
    const tabs = document.querySelectorAll("[data-account-mode]");
    let mode = "login";

    if (!modal || !openButton || !form) return;

    function setMode(nextMode) {
        mode = nextMode;
        tabs.forEach(function (tab) {
            const active = tab.dataset.accountMode === mode;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
        });
        submitButton.textContent = mode === "login" ? "Log in" : "Create account";
        password.setAttribute("autocomplete", mode === "login" ? "current-password" : "new-password");
        status.textContent = "";
    }

    function openModal() {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        window.setTimeout(function () {
            const email = document.getElementById("accountEmail");
            if (email) email.focus();
        }, 30);
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        openButton.focus();
    }

    openButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);
    modal.querySelectorAll("[data-close-account]").forEach(function (element) {
        element.addEventListener("click", closeModal);
    });
    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            setMode(tab.dataset.accountMode);
        });
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        status.textContent = "Secure account sign-in is not connected yet. No account was created and no password was checked. Connect an authentication backend before using these forms.";
    });
});
