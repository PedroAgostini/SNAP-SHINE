// A fresh navigation URL supplements the Clear-Site-Data header from .htaccess.
// This utility does not delete cookies, local storage or server-side caches.
(() => {
  document.querySelectorAll('[data-refresh-link]').forEach((link) => {
    const target = new URL(link.getAttribute('href'), location.href);
    target.searchParams.set('preview', String(Date.now()));
    link.href = target.href;
  });
})();
