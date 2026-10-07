/* GraySpark — mobile menu.
   Builds a menu button + full-screen menu from the page's own header links once
   support.js has rendered the page. Styling lives in vendor/mobile.css; below
   900px the inline nav is hidden and this menu takes over. No dependencies. */
(function () {
  "use strict";

  var MQ = window.matchMedia("(max-width: 900px)");

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  var TOKENS = ["--bg", "--fg", "--surface", "--surface2", "--muted", "--muted2", "--border", "--accent", "--accent-fg", "--display", "--body", "--mono"];
  function syncTheme() {
    var root = document.getElementById("gs-root");
    if (!root) return;
    var cs = getComputedStyle(root);
    for (var i = 0; i < arguments.length; i++) {
      var n = arguments[i];
      TOKENS.forEach(function (t) { var v = cs.getPropertyValue(t); if (v) n.style.setProperty(t, v.trim()); });
    }
  }

  function build() {
    var root = document.getElementById("gs-root");
    var header = root && root.querySelector("header");
    var nav = header && header.querySelector(".nav-links");
    if (!nav) return false;
    if (document.getElementById("gs-drawer")) return true;

    var row = header.firstElementChild;
    var logo = row && row.querySelector("a");
    var cta = row && row.lastElementChild;
    var links = [].slice.call(nav.querySelectorAll("a"));

    // Menu links: Home first (the logo's target), then the page's own nav, in order.
    var items = [{ href: logo ? logo.getAttribute("href") : "index.html", text: "Home", active: false }];
    links.forEach(function (a) {
      items.push({ href: a.getAttribute("href"), text: a.textContent.trim(), active: !!a.style.color });
    });
    if (!items.some(function (i) { return i.active; }) && /^#/.test(items[0].href)) items[0].active = true;

    var drawer = el("div", { id: "gs-drawer", "class": "gs-drawer", role: "dialog", "aria-modal": "true", "aria-label": "Site menu", "aria-hidden": "true" });
    var list = el("nav", { "class": "gs-drawer-nav", "aria-label": "Main" });
    items.forEach(function (it, i) {
      var a = el("a", { href: it.href }, '<span class="n">' + String(i + 1).padStart(2, "0") + "</span><span></span>");
      a.lastChild.textContent = it.text;
      if (it.active) { a.className = "is-active"; a.setAttribute("aria-current", "page"); }
      list.appendChild(a);
    });
    drawer.appendChild(list);

    var foot = el("div", { "class": "gs-drawer-foot" });
    var c = null;
    if (cta && cta.tagName === "A") {
      c = el("a", { href: cta.getAttribute("href"), "class": "gs-drawer-cta" });
      foot.appendChild(c);
    }
    function refreshCta() { // the label is templated, so read it from the live header each time
      var live = document.querySelector("#gs-root header > div > a:last-child");
      if (c && live) c.textContent = live.textContent.trim() + " →";
    }
    refreshCta();
    var tel = root.querySelector('.quick-contact a[href^="tel:"]');
    var mail = root.querySelector('.quick-contact a[href^="mailto:"]');
    var meta = el("div", { "class": "gs-drawer-meta" });
    if (tel) { var t = el("a", { href: tel.getAttribute("href") }); t.textContent = tel.getAttribute("href").replace("tel:", "").replace(/^(\+91)(\d{5})(\d{5})$/, "$1 $2 $3"); meta.appendChild(t); }
    if (mail) { var m = el("a", { href: mail.getAttribute("href") }); m.textContent = mail.getAttribute("href").replace("mailto:", ""); meta.appendChild(m); }
    if (meta.childNodes.length) foot.appendChild(meta);
    drawer.appendChild(foot);

    var btn = el("button", { type: "button", "class": "gs-burger", "aria-controls": "gs-drawer", "aria-expanded": "false", "aria-label": "Open menu" }, "<span></span><span></span><span></span>");

    // Mounted on <body>, outside the runtime's render root (which it may
    // re-create), so theme tokens are copied across from #gs-root.
    document.body.appendChild(drawer);
    document.body.appendChild(btn);
    syncTheme(drawer, btn);

    var lastFocus = null;
    function open() {
      syncTheme(drawer, btn);
      refreshCta();
      lastFocus = document.activeElement;
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      document.documentElement.classList.add("gs-menu-open");
      var first = list.querySelector("a");
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
    }
    function close(restoreFocus) {
      if (!drawer.classList.contains("is-open")) return;
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      document.documentElement.classList.remove("gs-menu-open");
      if (restoreFocus !== false) (lastFocus && lastFocus.focus ? lastFocus : btn).focus({ preventScroll: true });
    }

    btn.addEventListener("click", function () { drawer.classList.contains("is-open") ? close() : open(); });
    drawer.addEventListener("click", function (e) { if (e.target.closest("a")) close(false); });
    document.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") { // keep focus inside the menu + its button
        var f = [btn].concat([].slice.call(drawer.querySelectorAll("a")));
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    var onMQ = function () { if (!MQ.matches) close(false); };
    MQ.addEventListener ? MQ.addEventListener("change", onMQ) : MQ.addListener(onMQ);
    return true;
  }

  // support.js renders asynchronously; wait for the header to exist.
  function start() {
    build();
    var mo = new MutationObserver(function () { build(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 15000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
