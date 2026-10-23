/* Shared dark mode and accent-colour selector for every lesson page */
(function () {
  'use strict';
  var root = document.documentElement;
  var storage = { theme: 'timsons-lessons-theme', palette: 'timsons-lessons-palette' };
  var palettes = ['pink', 'blue', 'green', 'purple', 'orange'];
  var labels = { pink: 'Pink', blue: 'Blue', green: 'Green', purple: 'Purple', orange: 'Orange' };

  function safeGet(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function applyTheme(theme) {
    theme = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    safeSet(storage.theme, theme);
    var button = document.getElementById('lessonThemeToggle');
    if (button) {
      button.textContent = theme === 'dark' ? '☀ Light mode' : '🌙 Dark mode';
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }
  }
  function applyPalette(palette) {
    if (palettes.indexOf(palette) < 0) palette = 'pink';
    root.setAttribute('data-palette', palette);
    safeSet(storage.palette, palette);
    var select = document.getElementById('lessonPaletteSelect');
    if (select) select.value = palette;
  }
  function buildControls() {
    if (!document.body || document.getElementById('lessonThemeTools')) return;
    var panel = document.createElement('aside');
    panel.id = 'lessonThemeTools';
    panel.className = 'lesson-theme-tools';
    panel.setAttribute('aria-label', 'Appearance settings');
    panel.innerHTML = '<span class="lesson-theme-label">Appearance</span>' +
      '<button type="button" id="lessonThemeToggle" class="lesson-theme-toggle" aria-pressed="false">🌙 Dark mode</button>' +
      '<label for="lessonPaletteSelect">Colour</label>' +
      '<select id="lessonPaletteSelect" aria-label="Choose accent colour">' +
      palettes.map(function (p) { return '<option value="' + p + '">' + labels[p] + '</option>'; }).join('') +
      '</select>';
    document.body.appendChild(panel);
    document.getElementById('lessonThemeToggle').addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    document.getElementById('lessonPaletteSelect').addEventListener('change', function (event) {
      applyPalette(event.target.value);
    });
    applyTheme(safeGet(storage.theme, 'light'));
    applyPalette(safeGet(storage.palette, 'pink'));
  }
  applyTheme(safeGet(storage.theme, 'light'));
  applyPalette(safeGet(storage.palette, 'pink'));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildControls);
  else buildControls();
})();