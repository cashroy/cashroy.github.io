// Shared behaviour: landing logo -> header, scroll progress, reveal-on-scroll, small motions.
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (/[?&]motion\b/.test(location.search)) reduce = false;   // ?motion: preview the animations anyway
  var nav = document.querySelector(".nav");

  // ---- thin scroll-progress line under the header ----------------------------------------
  var bar = null;
  if (nav) {
    bar = document.createElement("span");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    nav.appendChild(bar);
  }

  // ---- screenshots drift slightly against the scroll -----------------------------------------
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot-img"));

  // ---- landing: the big logo flies into the header as you scroll -------------------------
  // The big logo is the real thing at full size (crisp); it's scaled DOWN onto the header logo.
  var mega = document.querySelector(".mega");
  var brand = document.querySelector(".nav .brand");
  var fly = null;
  function measure() {
    if (!fly) return;
    mega.style.transform = "translate(-50%, -50%)";          // natural size and centre
    var m = mega.getBoundingClientRect();
    var b = brand.getBoundingClientRect();
    var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;  // without scrollbars, like position: fixed
    fly.x = b.left + b.width / 2 - vw / 2;
    fly.y = b.top + b.height / 2 - vh / 2;
    fly.s = m.width > 0 ? b.width / m.width : 1;
    update();
  }
  if (mega && brand) {
    document.body.classList.add("has-intro");
    fly = { x: 0, y: 0, s: 1 };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

  function update() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 8);
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";
    }
    if (fly) {
      var p = Math.min(1, Math.max(0, y / (window.innerHeight * 0.6)));
      var e = reduce ? (p > 0.02 ? 1 : 0) : ease(p);
      var s = 1 + (fly.s - 1) * e;
      mega.style.transform = "translate(-50%, -50%) translate(" + (fly.x * e).toFixed(2) + "px, " +
                             (fly.y * e).toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      document.body.style.setProperty("--intro", e.toFixed(3));
      document.body.classList.toggle("intro-done", p >= 1);
    }
    if (shots.length && !reduce && window.innerWidth > 720) {
      shots.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var mid = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty("--py", (mid * -18).toFixed(1) + "px");
      });
    }
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  window.addEventListener("resize", function () { if (fly) measure(); else update(); });

  // ---- reveal on scroll, with automatic stagger for lists --------------------------------
  document.querySelectorAll(".features, .steps, .contact, .cards").forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (el, i) {
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i * 0.07).toFixed(2) + "s");
    });
  });
  var watched = document.querySelectorAll(".reveal, .features, .steps, .contact, .section-head");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    watched.forEach(function (el) { io.observe(el); });
  } else {
    watched.forEach(function (el) { el.classList.add("in"); });
  }

  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  if (fly) measure(); else update();
})();
