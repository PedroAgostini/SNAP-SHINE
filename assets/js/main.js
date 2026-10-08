/* Snap Shine Clean — interactions */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const staticMode = new URLSearchParams(location.search).has('static');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- header + menu ---------- */
  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuBtn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    menuBtn.querySelector('.sr').textContent = open ? 'Close menu' : 'Open menu';
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- image skeletons end when the photo lands ---------- */
  $$('.svc-media img, .ph img, .why-photo img').forEach((img) => {
    const box = img.closest('.svc-media, .ph, .why-photo');
    const done = () => box.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });

  /* ---------- magnetic CTAs (mouse only) ---------- */
  if (finePointer && !reduceMotion) {
    $$('.btn-sun, .btn-royal').forEach((btn) => {
      let frame = 0;
      btn.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          btn.style.setProperty('--mx', (dx * 10).toFixed(1) + 'px');
          btn.style.setProperty('--my', (dy * 8).toFixed(1) + 'px');
        });
      });
      btn.addEventListener('pointerleave', () => {
        cancelAnimationFrame(frame);
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- hero: the clean pass ---------- */
  const glass = $('[data-glass]');
  if (glass) initGlass(glass);

  function initGlass(glass) {
    const img = $('[data-glass-photo]', glass);
    const canvas = $('[data-glass-fog]', glass);
    const sq = $('[data-squeegee]', glass);
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (reduceMotion || staticMode || !ctx) { glass.classList.add('no-fog'); return; }

    const COLS = 28, ROWS = 18;
    const swept = new Uint8Array(COLS * ROWS);
    let W = 0, H = 0, dpr = 1, clean = false, busy = false, interacted = false;
    let last = null, idleTimer = null, started = false;

    // seeded random so the grime looks the same after a resize
    const rand = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const bladeH = () => Math.max(150, H * 0.38);

    function size() {
      const r = glass.getBoundingClientRect();
      W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paintFog() {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      const ready = img.complete && img.naturalWidth > 0;
      if (ready) {
        // cheap, cross-browser blur: draw tiny, scale up
        const iw = img.naturalWidth, ih = img.naturalHeight, br = W / H;
        let sw = iw, sh = ih, sx = 0, sy = 0;
        if (iw / ih > br) { sw = ih * br; sx = (iw - sw) / 2; } else { sh = iw / br; sy = (ih - sh) / 2; }
        const small = document.createElement('canvas');
        small.width = Math.max(16, Math.round(W / 22)); small.height = Math.max(16, Math.round(H / 22));
        small.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, small.width, small.height);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(small, 0, 0, W, H);
        ctx.fillStyle = 'rgba(196, 188, 170, 0.62)';
      } else {
        ctx.fillStyle = 'rgba(210, 220, 230, 0.92)';
      }
      ctx.fillRect(0, 0, W, H);

      const r = rand(424242);
      for (let i = 0; i < 26; i++) { // smudges
        const x = r() * W, y = r() * H, rad = 40 + r() * 140;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(128, 108, 78, ${0.08 + r() * 0.1})`);
        g.addColorStop(1, 'rgba(128, 108, 78, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < Math.round(W * H / 380); i++) { // dust
        ctx.fillStyle = `rgba(86, 70, 48, ${0.08 + r() * 0.18})`;
        ctx.beginPath(); ctx.arc(r() * W, r() * H, 0.4 + r() * 1.6, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 90; i++) { // condensation beads, lit from the top-left
        const x = r() * W, y = r() * H, rad = 1.5 + Math.pow(r(), 2) * 6;
        ctx.fillStyle = 'rgba(40, 46, 70, 0.16)'; // refraction edge, lower right
        ctx.beginPath(); ctx.arc(x + rad * .18, y + rad * .22, rad, 0, Math.PI * 2); ctx.fill();
        const g = ctx.createRadialGradient(x - rad * .35, y - rad * .4, 0, x, y, rad);
        g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(.35, 'rgba(240,244,248,.38)'); g.addColorStop(1, 'rgba(220,228,236,.18)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 34; i++) { // drip streaks
        const x = r() * W, y = r() * H * 0.5, len = 40 + r() * H * 0.45;
        const g = ctx.createLinearGradient(x, y, x, y + len);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.4, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1 + r() * 2.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r() - .5) * 6, y + len); ctx.stroke();
      }
      // re-clear what was already wiped
      ctx.globalCompositeOperation = 'destination-out';
      const cw = W / COLS, ch = H / ROWS;
      for (let i = 0; i < swept.length; i++) if (swept[i]) ctx.fillRect((i % COLS) * cw - 1, Math.floor(i / COLS) * ch - 1, cw + 2, ch + 2);
    }

    function wipe(x0, y0, x1, y1, h) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(x0, y0 - h / 2); ctx.lineTo(x1, y1 - h / 2);
      ctx.lineTo(x1, y1 + h / 2); ctx.lineTo(x0, y0 + h / 2);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(x1 - 7, y1 - h / 2, 14, h);
      mark(Math.min(x0, x1) - 7, Math.min(y0, y1) - h / 2, Math.max(x0, x1) + 7, Math.max(y0, y1) + h / 2);
    }

    function mark(ax, ay, bx, by) {
      const cw = W / COLS, ch = H / ROWS;
      for (let r = 0; r < ROWS; r++) {
        const cy = (r + 0.5) * ch; if (cy < ay || cy > by) continue;
        for (let c = 0; c < COLS; c++) {
          const cx = (c + 0.5) * cw; if (cx >= ax && cx <= bx) swept[r * COLS + c] = 1;
        }
      }
      let n = 0; for (let i = 0; i < swept.length; i++) n += swept[i];
      if (!clean && n / swept.length > 0.9) finish();
    }

    function placeSqueegee(x, y, h, dir) {
      const w = h * 140 / 320;
      sq.style.width = w + 'px';
      const bladeX = w * (20 / 140);
      // the handle trails behind the direction of travel
      const flip = dir > 0 ? -1 : 1;
      const tx = flip === 1 ? x - bladeX : x + bladeX - w;
      sq.style.transform = `translate(${tx}px, ${y - h / 2}px) scaleX(${flip})`;
    }

    function finish() {
      clean = true; busy = false;
      clearTimeout(idleTimer);
      glass.classList.remove('show-hint');
      glass.classList.add('is-clean');
    }

    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function stroke(yf, dir, dur = 950) {
      return new Promise(resolve => {
        const h = bladeH(), off = h * 140 / 320 + 24; // start and end fully outside the glass
        const xa = dir > 0 ? -off : W + off, xb = dir > 0 ? W + off : -off;
        let prev = null, t0 = null;
        const step = (ts) => {
          if (clean) return resolve();
          if (t0 === null) t0 = ts;
          const t = Math.min(1, (ts - t0) / dur), e = ease(t);
          const x = xa + (xb - xa) * e, y = yf * H + Math.sin(t * Math.PI) * H * 0.025;
          placeSqueegee(x, y, h, dir);
          if (prev) wipe(prev.x, prev.y, x, y, h);
          prev = { x, y };
          if (t < 1) requestAnimationFrame(step); else resolve();
        };
        requestAnimationFrame(step);
      });
    }

    async function autoPlay() {
      if (started) return; started = true; busy = true;
      await new Promise(r => setTimeout(r, 900));
      await stroke(0.2, 1);
      await stroke(0.5, -1);
      busy = false;
      if (clean) return;
      if (!finePointer) { busy = true; await stroke(0.8, 1); busy = false; return; }
      glass.classList.add('show-hint');
      idleTimer = setTimeout(async () => {
        if (clean || interacted) return;
        glass.classList.remove('show-hint');
        busy = true; await stroke(0.8, 1); busy = false;
      }, 4200);
    }

    // pointer wiping: hover with a mouse, drag with touch/pen
    canvas.addEventListener('pointermove', (e) => {
      if (clean || busy) return;
      if (e.pointerType !== 'mouse' && e.buttons === 0) { last = null; return; }
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top, h = Math.max(130, H * 0.3);
      if (!interacted) { interacted = true; clearTimeout(idleTimer); glass.classList.remove('show-hint'); }
      const dir = last ? (Math.sign(x - last.x) || last.dir) : 1;
      placeSqueegee(x, y, h, dir);
      if (last) wipe(last.x, last.y, x, y, h);
      last = { x, y, dir };
    });
    canvas.addEventListener('pointerleave', () => { last = null; });
    canvas.addEventListener('pointerup', () => { last = null; });

    size();
    paintFog();
    if (!(img.complete && img.naturalWidth)) img.addEventListener('load', paintFog, { once: true });

    new ResizeObserver(() => { if (!clean) { size(); paintFog(); } }).observe(glass);

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { io.disconnect(); autoPlay(); }
    }, { threshold: 0.35 });
    io.observe(glass);
  }

  /* ---------- before / after ---------- */
  const ba = $('[data-ba]');
  if (ba) {
    const stage = $('.ba-stage', ba);
    const range = $('[data-ba-range]', ba);
    const before = $('[data-ba-before]', ba);
    const after = $('[data-ba-after]', ba);
    const thumbs = $$('.ba-thumb', ba);
    thumbs.forEach(tab => tab.style.setProperty('--photo-ratio', Number(tab.dataset.width) / Number(tab.dataset.height)));
    let draggable = false, dragging = false;
    const setPosition = value => {
      const position = draggable ? Math.max(0, Math.min(100, value)) : 50;
      stage.style.setProperty('--pos', position + '%');
      range.value = Math.round(position);
    };
    const fromPointer = event => {
      const rect = stage.getBoundingClientRect();
      return (event.clientX - rect.left) / rect.width * 100;
    };
    const select = (index, focus = false) => {
      const tab = thumbs[index];
      dragging = false;
      draggable = tab.dataset.comparison === 'draggable';
      stage.classList.toggle('is-fixed', !draggable);
      stage.dataset.comparison = draggable ? 'draggable' : 'fixed';
      stage.style.setProperty('--photo-ratio', Number(tab.dataset.width) / Number(tab.dataset.height));
      stage.setAttribute('aria-labelledby', tab.id);
      range.disabled = !draggable;
      range.hidden = !draggable;
      setPosition(50);
      before.src = tab.dataset.before;
      after.src = tab.dataset.after;
      before.alt = tab.dataset.room + ' before cleaning';
      after.alt = tab.dataset.room + ' after cleaning';
      [before, after].forEach(image => { image.width = Number(tab.dataset.width); image.height = Number(tab.dataset.height); });
      thumbs.forEach((button, i) => {
        button.classList.toggle('is-active', i === index);
        button.setAttribute('aria-selected', String(i === index));
        button.tabIndex = i === index ? 0 : -1;
      });
      if (focus) {
        tab.focus({preventScroll: true});
        tab.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'instant'});
      }
    };
    range.addEventListener('input', () => setPosition(Number(range.value)));
    stage.addEventListener('pointerdown', event => {
      if (!draggable || (event.pointerType === 'mouse' && event.button !== 0)) return;
      dragging = true;
      stage.setPointerCapture(event.pointerId);
      setPosition(fromPointer(event));
    });
    stage.addEventListener('pointermove', event => { if (draggable && dragging) setPosition(fromPointer(event)); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => stage.addEventListener(type, () => { dragging = false; }));
    thumbs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % thumbs.length;
        if (event.key === 'ArrowLeft') next = (index + thumbs.length - 1) % thumbs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = thumbs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
    select(0);
  }

  /* ---------- carousels: native swipe on touch, drag + arrows with a mouse ---------- */
  $$('[data-carousel]').forEach((track) => {
    let down = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        // let scroll-snap settle the strip on the nearest item
        const left = track.scrollLeft;
        track.classList.remove('is-dragging');
        track.scrollLeft = left;
      }
    });
    // a drag must not count as a click on the thumbnail under the pointer
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());

    const wrap = track.closest('[data-carousel-wrap]');
    if (!wrap) return;
    const prev = $('[data-car-prev]', wrap), next = $('[data-car-next]', wrap);
    const step = () => track.clientWidth * 0.75;
    const sync = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* ---------- quote form ---------- */
  const form = $('[data-form]');
  if (form) initForm(form);

  function initForm(form) {
    const steps = $$('[data-step]', form);
    const progress = $$('[data-progress] li', form);
    const status = $('[data-step-status]', form);
    const back = $('[data-back]', form);
    const next = $('[data-next]', form);
    const submit = $('[data-submit]', form);
    const label = $('.btn-label', submit);
    const success = $('[data-form-success]', form);
    const error = $('[data-form-error]', form);
    const names = ['Service', 'Location', 'Details', 'Contact'];
    let current = 0;

    // input masks: (941) 555-0123 for phone, 5 digits for ZIP, tidy name and email
    const masks = {
      phone: (v) => {
        let d = v.replace(/\D/g, '');
        if (d.length === 11 && d[0] === '1') d = d.slice(1);
        d = d.slice(0, 10);
        if (d.length < 4) return d.length ? '(' + d : '';
        if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
        return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
      },
      zip: (v) => v.replace(/\D/g, '').slice(0, 5),
      name: (v) => v.replace(/[^A-Za-zÀ-ÿ' .-]/g, '').replace(/\s{2,}/g, ' ').replace(/(^|[\s-])([a-zà-ÿ])/g, (m, s, ch) => s + ch.toUpperCase()),
      email: (v) => v.replace(/\s/g, '').toLowerCase(),
    };
    $$('[data-mask]', form).forEach((el) => {
      const fn = masks[el.dataset.mask];
      el.addEventListener('input', () => {
        const before = el.value, pos = el.selectionStart, masked = fn(before);
        if (masked === before) return;
        el.value = masked;
        if (el.type !== 'email' && document.activeElement === el) {
          const at = Math.max(0, Math.min(masked.length, pos + masked.length - before.length));
          try { el.setSelectionRange(at, at); } catch (e) { /* input type without a selection API */ }
        }
      });
    });

    const check = (el) => {
      const wrap = el.closest('.field');
      const ok = el.checkValidity();
      if (wrap) wrap.classList.toggle('is-invalid', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      return ok;
    };
    const fieldsOf = (step) => $$('input, select, textarea', step);
    const validStep = (i) => {
      const bad = fieldsOf(steps[i]).filter((el) => !check(el));
      if (bad.length) bad[0].focus();
      return !bad.length;
    };

    const show = (i, focus = true) => {
      current = i;
      steps.forEach((s, n) => { s.hidden = n !== i; });
      progress.forEach((li, n) => { li.classList.toggle('is-active', n === i); li.classList.toggle('is-done', n < i); });
      back.hidden = i === 0;
      next.hidden = i === steps.length - 1;
      submit.hidden = i !== steps.length - 1;
      status.textContent = 'Step ' + (i + 1) + ' of ' + steps.length + ': ' + names[i];
      if (focus) { const first = fieldsOf(steps[i])[0]; if (first) first.focus({ preventScroll: true }); }
    };

    next.addEventListener('click', () => { if (validStep(current)) show(current + 1); });
    back.addEventListener('click', () => show(current - 1));
    $$('input[type=radio]', form).forEach((r) => r.addEventListener('change', () => check(r)));
    fieldsOf(form).forEach((el) => {
      el.addEventListener('blur', () => { if (el.value && el.type !== 'radio') check(el); });
      el.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('is-invalid')) check(el); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (current < steps.length - 1) { if (validStep(current)) show(current + 1); return; } // Enter acts as Next
      // Test environment: never send data or display a false success confirmation.
      if (form.hasAttribute('data-submission-disabled')) return;
      error.hidden = true;
      if (!validStep(current)) return;

      submit.disabled = true; label.textContent = 'Sending…';
      try {
        const action = form.getAttribute('action');
        if (!action) throw new Error('Form endpoint is not configured');
        const res = await fetch(action, { method: form.getAttribute('method') || 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('Request failed');
        success.hidden = false; success.focus();
        form.reset(); show(0, false);
      } catch (err) {
        error.hidden = false;
      } finally {
        submit.disabled = false; label.textContent = 'Schedule My Cleaning';
      }
    });

    show(0, false);
  }

  /* ---------- motion (GSAP) ---------- */
  window.addEventListener('load', () => {
    if (reduceMotion || staticMode || !window.gsap) return;
    const { gsap } = window;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    const ease = 'expo.out';

    gsap.from('[data-hero-title] .line > span', { yPercent: 110, duration: 1.2, ease, stagger: 0.09 });
    gsap.from('[data-hero-fade]', { y: 24, opacity: 0, filter: 'blur(6px)', duration: 1.1, ease, stagger: 0.1, delay: 0.35, clearProps: 'filter' });
    gsap.from('.hero-photo', { scale: 1.12, duration: 2.2, ease, clearProps: 'transform' });
    gsap.from('.hero-wm', { rotate: -40, opacity: 0, duration: 2, ease });

    if (!window.ScrollTrigger) return;

    // headings wipe in left to right, like a squeegee pass
    $$('[data-wipe]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(-20% 100% -20% 0)' }, {
        clipPath: 'inset(-20% -5% -20% 0)', duration: 1.2, ease,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }, clearProps: 'clipPath'
      });
    });

    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: (els) => gsap.fromTo(els, { y: 48, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease, stagger: 0.1, overwrite: true, clearProps: 'transform,opacity' })
    });

    // how it works: the path draws itself, the steps arrive in order
    const path = $('[data-steps-path]');
    if (path && getComputedStyle(path.parentNode).display !== 'none') {
      const len = path.getTotalLength();
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '[data-steps]', start: 'top 80%', end: 'bottom 60%', scrub: 0.6 }
      });
    }
    gsap.from('.step', { y: 40, opacity: 0, duration: 1, ease, stagger: 0.18, clearProps: 'transform,opacity', scrollTrigger: { trigger: '[data-steps]', start: 'top 80%', once: true } });

    // watermarks drift with the scroll
    $$('.watermark').forEach((wm) => {
      gsap.to(wm, { rotate: 40, yPercent: -12, ease: 'none', scrollTrigger: { trigger: wm.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
})();
