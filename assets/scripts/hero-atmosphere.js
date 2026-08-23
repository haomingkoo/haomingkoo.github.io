(() => {
  const canvas = document.getElementById('heroField');
  const hero = canvas?.closest('.hero');
  if (!canvas || !hero || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const context = canvas.getContext('2d');
  const portrait = hero.querySelector('.portrait-col');
  const pointer = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastDraw = 0;
  let visible = true;

  const fieldPoint = (line, progress, time) => {
    const angle = progress * Math.PI * 2;
    const base = Math.min(width, height);
    const radiusX = base * (.22 + line * .045);
    const radiusY = base * (.29 + line * .038);
    const pulse = Math.sin(angle * 3 + line * .74 + time * .18) * (8 + line * 1.6)
      + Math.cos(angle * 5 - line * .42 - time * .11) * 5;
    const pointerX = pointer.active ? (pointer.x / width - .5) * 22 : 0;
    const pointerY = pointer.active ? (pointer.y / height - .5) * 14 : 0;

    return {
      x: width * .73 + pointerX + Math.cos(angle) * (radiusX + pulse),
      y: height * .47 + pointerY + Math.sin(angle) * (radiusY + pulse * .55),
    };
  };

  const drawContour = (line, time, rgb) => {
    const steps = 96;
    context.beginPath();
    for (let step = 0; step <= steps; step += 1) {
      const point = fieldPoint(line, step / steps, time);
      if (step === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.closePath();
    context.strokeStyle = `rgba(${rgb},${.055 + line * .009})`;
    context.lineWidth = line % 3 === 0 ? 1.15 : .75;
    context.stroke();
  };

  const drawSignal = (line, phase, time, rgb) => {
    const progress = (phase + time * .018) % 1;
    const point = fieldPoint(line, progress, time);
    const trail = fieldPoint(line, (progress - .018 + 1) % 1, time);
    const gradient = context.createLinearGradient(trail.x, trail.y, point.x, point.y);
    gradient.addColorStop(0, `rgba(${rgb},0)`);
    gradient.addColorStop(1, `rgba(${rgb},.9)`);
    context.strokeStyle = gradient;
    context.lineWidth = 1.8;
    context.beginPath();
    context.moveTo(trail.x, trail.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    context.fillStyle = `rgba(${rgb},.92)`;
    context.shadowColor = `rgba(${rgb},.75)`;
    context.shadowBlur = 10;
    context.beginPath();
    context.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  };

  const drawTraces = (time, rgb) => {
    for (let row = 0; row < 3; row += 1) {
      const y = height * (.24 + row * .24);
      context.beginPath();
      context.moveTo(-40, y);
      context.bezierCurveTo(
        width * .22, y + Math.sin(time * .11 + row) * 14,
        width * .38, y - 24 + row * 10,
        width * .52, y + 4,
      );
      context.strokeStyle = `rgba(${rgb},${.035 + row * .008})`;
      context.lineWidth = .75;
      context.stroke();
    }
  };

  const resize = () => {
    const bounds = hero.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = (timestamp) => {
    frame = 0;
    if (!visible || document.hidden) return;
    if (timestamp - lastDraw < 32) {
      frame = requestAnimationFrame(draw);
      return;
    }

    lastDraw = timestamp;
    const time = timestamp / 1000;
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--hero-line-rgb').trim();
    context.clearRect(0, 0, width, height);
    drawTraces(time, rgb);
    for (let line = 0; line < 10; line += 1) drawContour(line, time, rgb);
    drawSignal(1, .06, time, rgb);
    drawSignal(4, .44, time, rgb);
    drawSignal(7, .76, time, rgb);
    frame = requestAnimationFrame(draw);
  };

  const start = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };

  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.active = true;
    hero.style.setProperty('--hero-shift-x', `${(pointer.x / width - .5) * 18}px`);
    hero.style.setProperty('--hero-shift-y', `${(pointer.y / height - .5) * 12}px`);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });

  portrait?.addEventListener('pointermove', (event) => {
    const bounds = portrait.getBoundingClientRect();
    portrait.style.setProperty('--portal-x', `${event.clientX - bounds.left}px`);
    portrait.style.setProperty('--portal-y', `${event.clientY - bounds.top}px`);
    portrait.classList.add('is-transforming');
    hero.classList.add('is-transforming');
  }, { passive: true });
  portrait?.addEventListener('pointerleave', () => {
    portrait.classList.remove('is-transforming');
    hero.classList.remove('is-transforming');
  });

  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }, { threshold: .05 }).observe(hero);
  document.addEventListener('visibilitychange', start);
  resize();
  start();
})();
