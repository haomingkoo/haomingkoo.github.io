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

  // Explorer reveal: hover opens a portal at the pointer; scrolling the hero away opens it from the chest.
  const portrait = document.querySelector('[data-explorer]');
  if (portrait && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const hero = portrait.closest('.hero');
    let hovering = false;
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const full = portrait.offsetHeight * 0.8;
      const progress = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.4)));
      const radius = hovering ? full : full * progress;
      if (!hovering) {
        portrait.style.setProperty('--portal-x', '50%');
        portrait.style.setProperty('--portal-y', '44%');
      }
      portrait.style.setProperty('--portal-radius', `${radius.toFixed(1)}px`);
      portrait.classList.toggle('is-transforming', radius > 1);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    portrait.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = portrait.getBoundingClientRect();
      portrait.style.setProperty('--portal-x', `${event.clientX - bounds.left}px`);
      portrait.style.setProperty('--portal-y', `${event.clientY - bounds.top}px`);
      hovering = true;
      schedule();
    }, { passive: true });
    portrait.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    addEventListener('scroll', schedule, { passive: true });
    update();
  }
})();
