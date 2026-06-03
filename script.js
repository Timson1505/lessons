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

    const correctPassword = "Timson2025"; // Change this password

    const modal = document.getElementById("passwordModal");
    const content = document.getElementById("protectedContent");
    const input = document.getElementById("passwordInput");
    const button = document.getElementById("unlockBtn");
    const errorMsg = document.getElementById("errorMsg");

    function checkPassword() {
        if (input.value === correctPassword) {
            modal.style.display = "none";
            content.style.display = "block";
        } else {
            errorMsg.textContent = "Incorrect password!";
            input.value = "";
        }
    }

    button.addEventListener("click", checkPassword);

    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            checkPassword();
        }
    });
});