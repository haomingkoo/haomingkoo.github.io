(() => {
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

})();
