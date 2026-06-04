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