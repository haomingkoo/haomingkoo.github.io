(() => {
  const endpoint = document.querySelector('meta[name="portfolio-chat-endpoint"]')?.content;
  const dialog = document.getElementById('portfolioChat');
  const launcher = document.getElementById('chatLauncher');
  const close = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const log = document.getElementById('chatLog');
  const submit = form.querySelector('button[type="submit"]');
  const history = [];
  const session = crypto.randomUUID();
  const maxHistoryItems = 6;
  const requestTimeoutMs = 25_000;

  function positionChat() {
    const portrait = document.querySelector('.portrait-col');
    const bounds = portrait?.getBoundingClientRect();
    const portraitVisible = bounds && bounds.bottom > 96 && bounds.top < innerHeight - 96;
    dialog.classList.toggle('avoid-portrait', Boolean(portraitVisible) && innerWidth > 520);
  }

  // Tuck the floating launcher away whenever it would sit on the hero text or portrait.
  const heroParts = [...document.querySelectorAll('.hero-text > *, .portrait-col .portrait-base')];
  let tuckScheduled = false;
  function syncLauncher() {
    tuckScheduled = false;
    const b = launcher.getBoundingClientRect();
    const range = document.createRange();
    const near = (r) => r.left < b.right + 8 && r.right > b.left - 8 && r.top < b.bottom + 8 && r.bottom > b.top - 8;
    const covers = heroParts.some((el) => {
      if (el.tagName === 'IMG' || el.classList.contains('cta-row')) return near(el.getBoundingClientRect());
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        range.selectNodeContents(walker.currentNode);
        if ([...range.getClientRects()].some(near)) return true;
      }
      return false;
    });
    launcher.classList.toggle('is-tucked', covers);
  }
  function scheduleLauncher() {
    if (tuckScheduled) return;
    tuckScheduled = true;
    requestAnimationFrame(syncLauncher);
  }
  addEventListener('scroll', scheduleLauncher, { passive: true });
  addEventListener('resize', scheduleLauncher, { passive: true });
  addEventListener('load', scheduleLauncher);
  scheduleLauncher();

  function message(text, role, sources = []) {
    const item = document.createElement('div');
    item.className = `chat-message ${role}`;
    item.textContent = text;
    log.append(item);
    if (sources.length) {
      const links = document.createElement('div');
      links.className = 'chat-sources';
      sources.forEach(({ label, url }) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = label;
        links.append(link);
      });
      log.append(links);
    }
    log.scrollTop = log.scrollHeight;
  }

  function openChat() {
    positionChat();
    if (!dialog.open) dialog.show();
    launcher.setAttribute('aria-expanded', 'true');
    input.focus();
  }

  function closeChat() {
    dialog.close();
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  launcher.addEventListener('click', openChat);
  document.querySelectorAll('[data-chat-open]').forEach((button) => button.addEventListener('click', openChat));
  addEventListener('resize', () => { if (dialog.open) positionChat(); }, { passive: true });
  close.addEventListener('click', closeChat);
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeChat();
  });
  document.querySelectorAll('[data-chat-question]').forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.dataset.chatQuestion;
      form.requestSubmit();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    message(question, 'visitor');
    input.value = '';
    submit.disabled = true;
    log.setAttribute('aria-busy', 'true');
    try {
      if (!endpoint) throw new Error('Chat deployment is still being connected. Please use the project links or email Haoming.');
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Chat-Session': session },
        body: JSON.stringify({ question, history }),
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      const requestId = result.headers.get('X-Request-ID');
      let data;
      try {
        data = await result.json();
      } catch {
        throw new Error(`The guide returned an unreadable response${requestId ? ` (reference ${requestId.slice(0, 8)})` : ''}.`);
      }
      if (!result.ok) throw new Error(`${data.error || 'The guide is temporarily unavailable.'}${requestId ? ` (reference ${requestId.slice(0, 8)})` : ''}`);
      message(data.answer, 'guide', data.sources);
      history.push({ role: 'user', content: question }, { role: 'assistant', content: data.answer });
      history.splice(0, Math.max(0, history.length - maxHistoryItems));
    } catch (error) {
      const text = error.name === 'TimeoutError'
        ? 'The guide took too long to respond. Its outcome is unavailable, so please try again.'
        : error.message;
      message(text, 'guide');
    } finally {
      submit.disabled = false;
      log.setAttribute('aria-busy', 'false');
      input.focus();
    }
  });
})();
