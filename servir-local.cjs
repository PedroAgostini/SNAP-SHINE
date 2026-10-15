/* Local preview with the same public routes as .htaccess. Node.js required. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.env.PORT || 4173);
const routes = { '/': 'index.html', '/blog': 'blog.html', '/clear-cache': 'clear-cache.html', '/privacy-policy': 'privacy-policy.html', '/terms-of-use': 'terms-of-use.html', '/redirect': 'redirect.html' };
const redirects = { '/index.html': '/', '/index': '/' };
for (const page of Object.keys(routes).slice(1)) redirects[page + '.html'] = redirects[page + '/'] = page;
// Removed article (same as .htaccess): its old addresses go to the blog.
for (const old of ['/post-construction-cleaning-bradenton', '/post-construction-cleaning-bradenton/', '/blog/post-construction-cleaning-bradenton', '/blog/post-construction-cleaning-bradenton/', '/artigos/post-construction-cleaning-bradenton.html']) redirects[old] = '/blog';
// Blog articles: artigos/<slug>.html is served at /blog/<slug>; old WordPress /<slug>/ addresses redirect there.
const articleSlug = (name) => /^[a-z0-9-]+$/.test(name) && fs.existsSync(path.join(__dirname, 'artigos', name + '.html')) ? name : null;
const articleRedirect = (pathname) => {
  const m = pathname.match(/^\/(?:artigos\/([a-z0-9-]+)(?:\.html)?|blog\/([a-z0-9-]+)(?:\.html|\/+)|([a-z0-9-]+)\/?)$/);
  const slug = m && articleSlug(m[1] || m[2] || m[3]);
  return slug ? '/blog/' + slug : null;
};
const mime = { '.vcf': 'text/vcard; charset=utf-8', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };
// Same as ErrorDocument 404 in .htaccess: the branded page with a real 404 status.
const notFound = (req, res) => fs.readFile(path.join(__dirname, '404.html'), (error, bytes) => {
  res.writeHead(404, { 'Content-Type': error ? 'text/plain; charset=utf-8' : mime['.html'], 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, nosnippet' });
  res.end(req.method === 'HEAD' ? undefined : error ? 'Not found' : bytes);
});
http.createServer((req, res) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { res.writeHead(400).end(); return; }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
  const target = redirects[url.pathname] || articleRedirect(url.pathname);
  if (target) { res.writeHead(301, { Location: target + url.search }).end(); return; }
  const article = url.pathname.startsWith('/blog/') && articleSlug(url.pathname.slice(6));
  const relative = routes[url.pathname] || (article ? `artigos/${article}.html` : url.pathname.slice(1));
  const file = path.resolve(__dirname, relative);
  const publicAsset = /^assets\/(?:css|js|icons|img|imagens-selecionadas|imagens-blog)\/[a-zA-Z0-9_/-]+\.(?:css|js|svg|png|webp)$/.test(relative);
  const publicInfo = /^(?:robots\.txt|sitemap(?:-pages|-blog)?\.xml|llms(?:-full)?\.txt|humans\.txt|site\.webmanifest|snap-shine-clean\.vcf|\.well-known\/security\.txt)$/.test(relative);
  if (!file.startsWith(__dirname + path.sep) || !(routes[url.pathname] || article || publicAsset || publicInfo)) { notFound(req, res); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { notFound(req, res); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, nosnippet' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  });
}).listen(port, '127.0.0.1', () => console.log(`Snap Shine: http://127.0.0.1:${port}/`));
