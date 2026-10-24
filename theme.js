/* Global appearance controls shared by all Timson's Lessons pages */
(function () {
  'use strict';
  var root = document.documentElement;
  var keys = { theme: 'timsons-lessons-theme', palette: 'timsons-lessons-palette', panel: 'timsons-lessons-theme-panel' };
  var palettes = [
    { id: 'red', label: 'Red', color: '#f0183a' },
    { id: 'blue', label: 'Blue', color: '#4eafc0' },
    { id: 'green', label: 'Green', color: '#35b184' }
  ];

  function get(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } }
  function set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }

  function applyTheme(theme) {
    theme = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    if (document.body) document.body.classList.toggle('dark', theme === 'dark');
    set(keys.theme, theme);
    var toggle = document.getElementById('lessonDarkToggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.innerHTML = theme === 'dark'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 15.5A8.5 8.5 0 0 1 8.5 3.2 8.5 8.5 0 1 0 20.8 15.5Z"></path></svg>';
    }
  }
  function applyPalette(id) {
    if (!palettes.some(function (p) { return p.id === id; })) id = 'red';
    root.setAttribute('data-palette', id);
    set(keys.palette, id);
    document.querySelectorAll('[data-lesson-palette]').forEach(function (button) {
      var active = button.getAttribute('data-lesson-palette') === id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function buildControls() {
    if (!document.body || document.getElementById('lessonAppearance')) return;
    var savedPanel = get(keys.panel, 'open') !== 'closed';
    var wrap = document.createElement('div');
    wrap.id = 'lessonAppearance';
    wrap.className = 'lesson-appearance';
    wrap.innerHTML =
      '<div class="lesson-appearance-actions">' +
        '<button type="button" class="lesson-appearance-icon" id="lessonSettingsToggle" aria-label="Open theme colours" aria-expanded="' + savedPanel + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm9 5.1v-2.4l-2.2-.7a7.2 7.2 0 0 0-.7-1.7l1.1-2-1.7-1.7-2 1.1a7.2 7.2 0 0 0-1.7-.7L13.1 3h-2.4L10 5.2a7.2 7.2 0 0 0-1.7.7l-2-1.1-1.7 1.7 1.1 2a7.2 7.2 0 0 0-.7 1.7l-2.2.7v2.4l2.2.7a7.2 7.2 0 0 0 .7 1.7l-1.1 2 1.7 1.7 2-1.1a7.2 7.2 0 0 0 1.7.7l.7 2.2h2.4l.7-2.2a7.2 7.2 0 0 0 1.7-.7l2 1.1 1.7-1.7-1.1-2a7.2 7.2 0 0 0 .7-1.7Z"></path></svg>' +
        '</button>' +
        '<button type="button" class="lesson-appearance-icon" id="lessonDarkToggle" aria-label="Switch to dark mode" aria-pressed="false"></button>' +
      '</div>' +
      '<section class="lesson-colour-panel" id="lessonColourPanel" aria-label="Theme colours" ' + (savedPanel ? '' : 'hidden') + '>' +
        '<h2>Theme Colors</h2>' +
        '<div class="lesson-colour-options">' +
          palettes.map(function (p) { return '<button type="button" class="lesson-colour-dot" data-lesson-palette="' + p.id + '" aria-label="' + p.label + ' theme" title="' + p.label + '" style="--dot-color:' + p.color + '"></button>'; }).join('') +
        '</div>' +
      '</section>';
    document.body.appendChild(wrap);
    document.getElementById('lessonSettingsToggle').addEventListener('click', function () {
      var panel = document.getElementById('lessonColourPanel');
      var open = panel.hidden;
      panel.hidden = !open;
      this.setAttribute('aria-expanded', String(open));
      set(keys.panel, open ? 'open' : 'closed');
    });
    document.getElementById('lessonDarkToggle').addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    wrap.querySelectorAll('[data-lesson-palette]').forEach(function (button) {
      button.addEventListener('click', function () { applyPalette(this.getAttribute('data-lesson-palette')); });
    });
    applyTheme(get(keys.theme, 'light'));
    applyPalette(get(keys.palette, 'red'));
  }
  applyTheme(get(keys.theme, 'light'));
  applyPalette(get(keys.palette, 'red'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildControls);
  else buildControls();
})();