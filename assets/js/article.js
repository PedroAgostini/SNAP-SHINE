/* Article pages: reading progress bar and the table of contents that follows the reader. */
(() => {
  const body = document.querySelector('.article-body');
  const bar = document.querySelector('[data-read-progress]');
  if (body && bar) {
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = body.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(Math.max(-rect.top / Math.max(total, 1), 0), 1);
      bar.style.transform = `scaleX(${done})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
  }

  const links = [...document.querySelectorAll('[data-toc] a[href^="#"]')];
  const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if (!targets.length) return;

  // The active entry is the last section whose top has passed the upper third of the screen.
  const setActive = () => {
    const line = window.innerHeight * 0.33;
    let current = targets[0];
    for (const t of targets) if (t.getBoundingClientRect().top <= line) current = t;
    links.forEach((a) => {
      const on = a.hash === '#' + current.id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  };
  let frame = 0;
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; setActive(); }); }, { passive: true });
  setActive();
})();
