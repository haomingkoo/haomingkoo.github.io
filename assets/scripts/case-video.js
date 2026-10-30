// App launch videos: load near the viewport, autoplay muted while visible, poster plus play button under reduced motion.
// .is-hover plays muted on mouse hover instead of autoplaying. Inside a gallery, only the active slide plays.
// A deliberate play (button or tap) starts with sound unless the viewer turned sound off this session.
// A seek bar along the bottom moves to any point; it appears once the video has loaded.
// The full-screen button enlarges the whole player, controls included; iPhone Safari falls back to its own player.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const KEY = 'hk-video-sound';
  const wantSound = () => { try { return sessionStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } };
  const rememberSound = (on) => { try { sessionStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {} };
  const ICON_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const ICON_FULL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_EXIT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const fullscreenEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const ICON_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const all = [];

  document.querySelectorAll('.case-video').forEach((wrap) => {
    const video = wrap.querySelector('video');
    const play = wrap.querySelector('.video-play');
    const controls = wrap.querySelector('.video-controls');
    let sound = wrap.querySelector('.video-sound');
    if (!sound && controls) {
      sound = document.createElement('button');
      sound.className = 'video-sound';
      sound.type = 'button';
      controls.appendChild(sound);
    }
    const full = document.createElement('button');
    full.className = 'video-full';
    full.type = 'button';
    if (controls) controls.appendChild(full);
    const seek = document.createElement('input');
    seek.className = 'video-seek';
    seek.type = 'range';
    seek.min = '0';
    seek.max = '1000';
    seek.value = '0';
    seek.setAttribute('aria-label', 'Seek');
    wrap.appendChild(seek);
    const hoverOnly = wrap.classList.contains('is-hover');
    const hidden = () => Boolean(wrap.closest('.gallery-slide:not(.is-active)'));
    let loaded = false;
    let userPaused = false;
    let visible = false;
    let deliberate = false; // true once the viewer pressed play or tapped the video; muted previews don't count
    all.push(video);

    const load = () => {
      if (loaded) return;
      loaded = true;
      video.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; });
      video.load();
    };
    const syncSound = () => {
      if (!sound) return;
      const on = !video.muted;
      sound.hidden = false;
      sound.innerHTML = on ? ICON_ON : ICON_OFF;
      sound.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
      sound.setAttribute('aria-pressed', String(on));
    };
    const sync = () => {
      const playing = !video.paused;
      if (playing) wrap.classList.add('is-started');
      const showPause = playing && deliberate;
      wrap.classList.toggle('is-playing', showPause);
      play.setAttribute('aria-label', showPause ? 'Pause video' : 'Play video');
    };
    const start = (withSound) => {
      load();
      video.muted = !withSound;
      if (withSound) { video.volume = 1; all.forEach((v) => { if (v !== video && !v.muted) v.muted = true; }); }
      syncSound();
      video.play().catch(() => { if (withSound) { video.muted = true; syncSound(); video.play().catch(() => {}); } });
    };
    const autoplay = () => { if (visible && !hoverOnly && !userPaused && !reduce.matches && !hidden() && video.paused) start(false); };

    // Deliberate play: the button, or a tap/click on the video itself.
    play.addEventListener('click', () => {
      if (!deliberate || video.paused) {
        // first deliberate play, or resume: play with the viewer's sound choice (a preview already running just gains sound)
        deliberate = true; userPaused = false; start(wantSound()); sync();
      } else { userPaused = true; video.pause(); }
    });
    video.addEventListener('click', () => play.click());
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('volumechange', syncSound);
    const syncSeek = () => {
      if (!video.duration) return;
      wrap.classList.add('has-seek');
      seek.value = String(Math.round((video.currentTime / video.duration) * 1000));
      seek.style.setProperty('--seek', `${seek.value / 10}%`);
      seek.setAttribute('aria-valuetext', `${Math.round(video.currentTime)} of ${Math.round(video.duration)} seconds`);
    };
    video.addEventListener('loadedmetadata', syncSeek);
    video.addEventListener('timeupdate', syncSeek);
    seek.addEventListener('input', () => {
      if (!video.duration) return;
      deliberate = true;
      video.currentTime = (seek.value / 1000) * video.duration;
      wrap.classList.add('is-started');
      syncSeek();
    });
    wrap.addEventListener('gallery:show', autoplay);

    if (hoverOnly) {
      wrap.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !reduce.matches && video.paused) start(false); });
      wrap.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !deliberate) video.pause(); });
    }

    const syncFull = () => {
      const on = fullscreenEl() === wrap;
      wrap.classList.toggle('is-fullscreen', on);
      full.innerHTML = on ? ICON_EXIT : ICON_FULL;
      full.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
    };
    syncFull();
    ['fullscreenchange', 'webkitfullscreenchange'].forEach((type) => document.addEventListener(type, syncFull));
    full.addEventListener('click', () => {
      if (fullscreenEl() === wrap) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const enter = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
      if (enter) enter.call(wrap);
      else if (video.webkitEnterFullscreen) { load(); video.webkitEnterFullscreen(); }
      if (!deliberate || video.paused) play.click(); // asking for full screen counts as a deliberate play, so it gains sound
    });

    if (sound) {
      syncSound();
      sound.addEventListener('click', () => {
        const on = video.muted;
        rememberSound(on);
        if (on) { deliberate = true; userPaused = false; start(true); sync(); } else { video.muted = true; syncSound(); }
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
