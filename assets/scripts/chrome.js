(() => {
  const root = document.documentElement;
  const button = document.getElementById('themeSwitch');
  if (!button) return;
  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('hk-theme', next); } catch (e) {}
  });
})();
