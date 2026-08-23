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
  let scrollScheduled = false;

  function syncLauncherSize() {
    launcher.classList.toggle('is-compact', scrollY > innerHeight * .6);
  }

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
  addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      syncLauncherSize();
    });
  }, { passive: true });
  syncLauncherSize();
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
