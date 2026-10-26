// App screen recordings: load near the viewport, autoplay muted while visible, poster plus play button under reduced motion.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.case-video').forEach((wrap) => {
    const video = wrap.querySelector('video');
    const play = wrap.querySelector('.video-play');
    const sound = wrap.querySelector('.video-sound');
    let loaded = false;
    let userPaused = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      video.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; });
      video.load();
    };
    const sync = () => {
      const playing = !video.paused;
      wrap.classList.toggle('is-playing', playing);
      play.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    };
    const start = () => { load(); video.play().catch(() => {}); };

    play.addEventListener('click', () => {
      if (video.paused) { userPaused = false; start(); } else { userPaused = true; video.pause(); }
    });
    video.addEventListener('click', () => play.click());
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);

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
    new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) load(); });
    }, { rootMargin: '300px 0px' }).observe(wrap);
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !userPaused && !reduce.matches) start();
        if (!e.isIntersecting && !video.paused) video.pause();
      });
    }, { threshold: 0.5 }).observe(wrap);
  });
})();
