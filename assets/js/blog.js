/* Blog index: newest first, 3-column grid, paginated (?page=N). Posts come from blog-posts.js. */
(() => {
  const PER_PAGE = 9;
  const grid = document.querySelector('[data-blog-grid]');
  const pager = document.querySelector('[data-blog-pager]');
  const status = document.querySelector('[data-blog-status]');
  const count = document.querySelector('[data-blog-count]');
  const heading = document.querySelector('#blog-heading');
  if (!grid || !pager) return;

  const posts = (window.SNAP_POSTS || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const pages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (iso) => { const [y, m, d] = iso.split('-').map(Number); return months[m - 1] + ' ' + d + ', ' + y; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pageFromUrl = () => {
    const n = parseInt(new URLSearchParams(location.search).get('page'), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, 1), pages) : 1;
  };

  const card = (p) => `
    <article class="post-card">
      <a class="post-media" href="${esc(p.url)}" tabindex="-1" aria-hidden="true">
        <img data-placeholder="stock" src="${esc(p.image)}?w=800&q=75&auto=format&fit=crop" alt="" loading="lazy" width="800" height="500">
      </a>
      <div class="post-body">
        <p class="post-meta">
          <span class="post-cat">${esc(p.category)}</span>
          <span>${p.readMin} min read</span>
          <time datetime="${p.date}">${fmt(p.date)}</time>
        </p>
        <h2 class="post-title"><a href="${esc(p.url)}">${esc(p.title)}</a></h2>
        <p class="post-excerpt">${esc(p.excerpt)}</p>
        <a class="btn btn-sun btn-sm post-btn" href="${esc(p.url)}" aria-label="Read article: ${esc(p.title)}">Read Article <svg class="ic"><use href="#i-arrow"/></svg></a>
      </div>
    </article>`;

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
    const slice = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    grid.innerHTML = slice.length ? slice.map(card).join('') : '<p class="blog-empty">New articles are coming soon.</p>';
    pager.innerHTML = pagerHtml(page);
    const summary = posts.length ? `${(page - 1) * PER_PAGE + 1}\u2013${Math.min(page * PER_PAGE, posts.length)} of ${posts.length} articles` : '0 articles';
    if (count) count.textContent = summary;
    if (status) status.textContent = `Page ${page} of ${pages}. ${summary}.`;
    document.title = (page > 1 ? 'Blog, page ' + page : 'Blog') + ' | Snap Shine Clean';
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

  // Keep the blog's compact navigation dismissible without making it a modal.
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const menuBtn = document.querySelector('[data-menu-btn]');
  const closeMenu = () => { if (menu && !menu.hidden) menuBtn.click(); };
  document.addEventListener('click', (event) => {
    if (!header?.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', (event) => {
    if (!header?.contains(event.target)) closeMenu();
  });
  window.matchMedia('(max-width: 1240px)').addEventListener('change', (event) => {
    if (!event.matches) closeMenu();
  });
})();
