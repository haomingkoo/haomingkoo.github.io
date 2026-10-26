// App screen recordings: load near the viewport, autoplay muted while visible, poster plus play button under reduced motion.
// .is-hover plays on mouse hover or the play button instead of autoplaying. Inside a gallery, only the active slide plays.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.case-video').forEach((wrap) => {
    const video = wrap.querySelector('video');
    const play = wrap.querySelector('.video-play');
    const sound = wrap.querySelector('.video-sound');
    const hoverOnly = wrap.classList.contains('is-hover');
    const hidden = () => Boolean(wrap.closest('.gallery-slide:not(.is-active)'));
    let loaded = false;
    let userPaused = false;
    let visible = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      video.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; });
      video.load();
    };
    const sync = () => {
      const playing = !video.paused;
      wrap.classList.toggle('is-playing', playing);
      if (playing) wrap.classList.add('is-started');
      play.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    };
    const start = () => { load(); video.play().catch(() => {}); };
    const autoplay = () => { if (visible && !hoverOnly && !userPaused && !reduce.matches && !hidden()) start(); };

    play.addEventListener('click', () => {
      if (video.paused) { userPaused = false; start(); } else { userPaused = true; video.pause(); }
    });
    video.addEventListener('click', () => play.click());
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    wrap.addEventListener('gallery:show', autoplay);

    if (hoverOnly) {
      wrap.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !reduce.matches) start(); });
      wrap.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') video.pause(); });
    }

    if (sound) {
      sound.hidden = false;
      sound.addEventListener('click', () => {
        video.muted = !video.muted;
        sound.setAttribute('aria-pressed', String(!video.muted));
        sound.textContent = video.muted ? 'Sound off' : 'Sound on';
        if (!video.muted && video.paused) { userPaused = false; start(); }
      });
    }

    if (!('IntersectionObserver' in window)) return;
    if (!hoverOnly) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) load(); });
      }, { rootMargin: '300px 0px' }).observe(wrap);
    }
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        visible = e.isIntersecting;
        if (visible) autoplay();
        else if (!video.paused) video.pause();
      });
    }, { threshold: 0.5 }).observe(wrap);
  });
})();
