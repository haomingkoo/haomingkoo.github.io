(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-project-gallery]').forEach((gallery) => {
    const slides = [...gallery.querySelectorAll('.gallery-slide')];
    const tabs = [...gallery.querySelectorAll('.gallery-tab')];
    const counter = gallery.querySelector('.gallery-counter');
    const label = gallery.querySelector('.gallery-label');
    const previous = gallery.querySelector('[data-gallery-previous]');
    const next = gallery.querySelector('[data-gallery-next]');
    let activeIndex = 0;
    let timer;
    let inView = false;

    const render = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
        slide.classList.toggle('is-before', slideIndex < activeIndex);
        slide.setAttribute('aria-hidden', slideIndex === activeIndex ? 'false' : 'true');
        slide.querySelectorAll('a').forEach((link) => { link.tabIndex = slideIndex === activeIndex ? 0 : -1; });
      });
      tabs.forEach((tab, tabIndex) => tab.setAttribute('aria-current', tabIndex === activeIndex ? 'true' : 'false'));
      counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      label.textContent = slides[activeIndex].dataset.galleryLabel;
    };

    const stop = () => clearInterval(timer);
    const start = () => {
      stop();
      if (!reduceMotion && inView && !document.hidden) timer = setInterval(() => render(activeIndex + 1), 6500);
    };
    const choose = (index) => { render(index); start(); };

    previous.addEventListener('click', () => choose(activeIndex - 1));
    next.addEventListener('click', () => choose(activeIndex + 1));
    tabs.forEach((tab, index) => tab.addEventListener('click', () => choose(index)));
    gallery.addEventListener('pointerenter', stop);
    gallery.addEventListener('pointerleave', start);
    gallery.addEventListener('focusin', stop);
    gallery.addEventListener('focusout', start);

    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start(); else stop();
    }, { threshold: .35 }).observe(gallery);

    document.addEventListener('visibilitychange', start);
    render(0);
  });
})();
