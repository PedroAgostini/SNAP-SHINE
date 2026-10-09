/* Blog pages. Index: the post cards are static HTML (newest first); this paginates them (?page=N).
   Every blog page: keeps the compact navigation dismissible without making it a modal. */
(() => {
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const menuBtn = document.querySelector('[data-menu-btn]');
  if (menu && menuBtn) {
    const closeMenu = () => { if (!menu.hidden) menuBtn.click(); };
    document.addEventListener('click', (event) => {
      if (!header?.contains(event.target)) closeMenu();
    });
    document.addEventListener('focusin', (event) => {
      if (!header?.contains(event.target)) closeMenu();
    });
    window.matchMedia('(max-width: 1240px)').addEventListener('change', (event) => {
      if (!event.matches) closeMenu();
    });
  }

  const PER_PAGE = 9;
  const grid = document.querySelector('[data-blog-grid]');
  const pager = document.querySelector('[data-blog-pager]');
  const status = document.querySelector('[data-blog-status]');
  const count = document.querySelector('[data-blog-count]');
  const heading = document.querySelector('#blog-heading');
  if (!grid || !pager) return;

  const cards = [...grid.querySelectorAll('.post-card')];
  const pages = Math.max(1, Math.ceil(cards.length / PER_PAGE));
  const baseTitle = document.title;
  const pageFromUrl = () => {
    const n = parseInt(new URLSearchParams(location.search).get('page'), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, 1), pages) : 1;
  };

  const pagerHtml = (page) => {
    if (pages < 2) return '';
    const link = (n, label, cls = '', extra = '') =>
      `<a class="pg ${cls}" href="?page=${n}" data-page="${n}" ${extra}>${label}</a>`;
    let out = page > 1
      ? link(page - 1, '<svg class="ic flip"><use href="#i-arrow"/></svg><span class="sr">Previous page</span>', 'pg-arrow')
      : '<span class="pg pg-arrow is-disabled" aria-hidden="true"><svg class="ic flip"><use href="#i-arrow"/></svg></span>';
    for (let n = 1; n <= pages; n++) {
      out += n === page
        ? `<span class="pg is-current" aria-current="page" aria-label="Page ${n}">${n}</span>`
        : link(n, n, '', `aria-label="Page ${n}"`);
    }
    out += page < pages
      ? link(page + 1, '<svg class="ic"><use href="#i-arrow"/></svg><span class="sr">Next page</span>', 'pg-arrow')
      : '<span class="pg pg-arrow is-disabled" aria-hidden="true"><svg class="ic"><use href="#i-arrow"/></svg></span>';
    return out;
  };

  const render = (page, scroll) => {
    cards.forEach((card, i) => { card.hidden = i < (page - 1) * PER_PAGE || i >= page * PER_PAGE; });
    pager.innerHTML = pagerHtml(page);
    const summary = cards.length ? `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, cards.length)} of ${cards.length} articles` : '0 articles';
    if (count) count.textContent = summary;
    if (status) status.textContent = `Page ${page} of ${pages}. ${summary}.`;
    document.title = page > 1 ? `${baseTitle} (page ${page})` : baseTitle;
    if (scroll) {
      heading?.focus({ preventScroll: true });
      grid.closest('section').scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start'
      });
    }
  };

  pager.addEventListener('click', (e) => {
    const a = e.target.closest('[data-page]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const n = Number(a.dataset.page);
    const url = new URL(location.href);
    if (n === 1) url.searchParams.delete('page');
    else url.searchParams.set('page', n);
    history.pushState({ page: n }, '', url);
    render(n, true);
  });
  window.addEventListener('popstate', () => render(pageFromUrl(), true));

  render(pageFromUrl(), false);
})();
