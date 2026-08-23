(() => {
  const root = document.documentElement;

  const saved = localStorage.getItem('hk-theme');
  root.dataset.theme = saved || 'dark';
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('hk-theme', next);
  });

  const progress = document.getElementById('scrollProgress');
  let progressScheduled = false;
  addEventListener('scroll', () => {
    if (progressScheduled) return;
    progressScheduled = true;
    requestAnimationFrame(() => {
      progressScheduled = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, max))})`;
    });
  }, { passive: true });

  const clock = document.getElementById('clock');
  function tickClock() {
    const t = new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Singapore' });
    clock.textContent = `SGT · ${t}`;
  }
  tickClock();
  setInterval(tickClock, 30000);

})();
