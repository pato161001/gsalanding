/* Gray Spark — static runtime shim.
   Replaces the component runtime for the behaviours the markup relies on.
   Vanilla, no dependencies. */
(function () {
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- reveal on scroll --- */
  var rev = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || RM) {
    rev.forEach(function (e) { e.classList.add('in'); e.style.opacity = 1; e.style.transform = 'none'; });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (e) { io.observe(e); });
  }

  /* --- staggered children --- */
  document.querySelectorAll('[data-stagger]').forEach(function (p) {
    Array.prototype.forEach.call(p.children, function (c, i) {
      c.style.transitionDelay = (i * 70) + 'ms';
    });
  });

  /* --- counters --- */
  function runCount(el) {
    var raw = (el.textContent || '').trim();
    var m = raw.match(/(\D*)(\d[\d,]*)(.*)/);
    if (!m || RM) return;
    var pre = m[1], target = parseInt(m[2].replace(/,/g, ''), 10), post = m[3];
    var t0 = null, dur = 1300;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(target * e).toLocaleString('en-IN') + post;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cts = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    cts.forEach(function (e) { cio.observe(e); });
  }

  /* --- pinned scroll sections: cross-fade layers + captions --- */
  document.querySelectorAll('[id^="gs-"]').forEach(function (sec) {
    var layers = sec.querySelectorAll('[data-layer]');
    var caps   = sec.querySelectorAll('[data-cap]');
    var num    = sec.querySelector('[data-railnum]');
    var bar    = sec.querySelector('[data-railbar]');
    if (!layers.length) return;

    function update() {
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      var p = Math.min(Math.max(-r.top / total, 0), 0.9999);
      var i = Math.floor(p * layers.length);
      layers.forEach(function (l, n) { l.style.opacity = (n === i) ? 1 : 0; });
      caps.forEach(function (c, n) {
        c.style.opacity = (n === i) ? 1 : 0;
        c.style.transform = (n === i) ? 'none' : 'translateY(14px)';
        c.style.pointerEvents = (n === i) ? 'auto' : 'none';
      });
      if (num) num.textContent = String(i + 1).padStart(2, '0');
      if (bar) bar.style.transform = 'scaleX(' + (p) + ')';
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  });

  /* --- video lightbox --- */
  var box = document.createElement('div');
  box.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.94);display:none;align-items:center;justify-content:center;padding:24px';
  box.innerHTML = '<button aria-label="Close" style="position:absolute;top:18px;right:20px;background:none;border:1px solid rgba(255,255,255,.3);color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:18px">&times;</button><div style="width:min(1100px,100%);aspect-ratio:16/9"></div>';
  document.body.appendChild(box);
  var frameHost = box.lastChild, closeBtn = box.querySelector('button');
  function close() { box.style.display = 'none'; frameHost.innerHTML = ''; document.body.style.overflow = ''; }
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.querySelectorAll('[data-yt]').forEach(function (el) {
    el.style.cursor = 'pointer';
    el.addEventListener('click', function (e) {
      var id = el.getAttribute('data-yt'); if (!id) return;
      e.preventDefault();
      frameHost.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id +
        '?autoplay=1" style="width:100%;height:100%;border:0" allow="autoplay; fullscreen" allowfullscreen></iframe>';
      box.style.display = 'flex'; document.body.style.overflow = 'hidden';
    });
  });

  /* --- mobile nav --- */
  var burger = document.querySelector('[data-burger]'), nav = document.querySelector('[data-nav]');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* --- dismiss the loader --- */
  var loader = document.querySelector('#gs-loader, [data-preloader], #preloader, .preloader');
  if (loader) {
    loader.style.opacity = 0;
    loader.style.pointerEvents = 'none';
    setTimeout(function () { loader.remove(); }, 700);
  }
})();
