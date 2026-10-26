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


/* Mobile hamburger menu */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.aside');
  const overlay = document.querySelector('.mobile-menu-overlay');
  if (!toggle || !sidebar || !overlay) return;

  function setMenuOpen(open) {
    sidebar.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    overlay.hidden = !open;
  }

  toggle.addEventListener('click', () => {
    setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  overlay.addEventListener('click', () => setMenuOpen(false));
  sidebar.querySelectorAll('.nav a, .sidebar-auth-actions a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) setMenuOpen(false);
  });
});
