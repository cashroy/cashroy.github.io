// Shared behaviour: nav border on scroll, reveal-on-scroll with gentle stagger, image fade-in, footer year.
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");

  // ?motion previews the animations even when the system asks for reduced motion.
  if (/[?&]motion\b/.test(location.search)) root.classList.add("force-motion");

  var nav = document.querySelector(".nav");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Items in a row or list come in one after another (unless they set their own --d).
  document.querySelectorAll(".cards, .features, .steps, .shots").forEach(function (list) {
    var i = 0;
    Array.prototype.forEach.call(list.children, function (el) {
      if (el.classList.contains("reveal") && !el.style.getPropertyValue("--d"))
        el.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
      i++;
    });
  });

  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {        // (with reduced motion the reveal is a plain fade)
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Images fade in when they've loaded instead of popping in.
  {
    document.querySelectorAll("main img").forEach(function (img) {
      if (img.complete && img.naturalWidth) return;           // already there: leave it alone
      img.classList.add("js-fade");
      var done = function () { img.classList.add("loaded"); };
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ---- Landing (home): the big logo glides into the header as you scroll ----------------
  // The big logo is drawn at full size and scaled DOWN onto the header logo, so it stays crisp.
  // With reduced motion it doesn't move: it fades out while the header logo fades in.
  var mega = document.getElementById("mega");
  var brand = nav && nav.querySelector(".brand");
  if (mega && brand && root.classList.contains("js-intro")) {
    window.cvIntro = true;
    var still = !root.classList.contains("force-motion") &&
                window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fly = { x: 0, y: 0, s: 1 };
    var framed = false;

    var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

    var paint = function () {
      framed = false;
      var vh = root.clientHeight;
      var p = Math.min(1, Math.max(0, window.scrollY / (vh * 0.55)));   // done a bit past half a screen
      var e = easeInOut(p);
      if (still) {
        mega.style.transform = "translate(-50%, -50%)";
        mega.style.opacity = Math.max(0, 1 - p * 1.8).toFixed(3);
        brand.style.visibility = "visible";
        brand.style.opacity = Math.max(0, (p - 0.35) / 0.65).toFixed(3);
      } else {
        var s = 1 + (fly.s - 1) * e;
        mega.style.transform = "translate(-50%, -50%) translate(" + (fly.x * e).toFixed(2) + "px, " +
                               (fly.y * e).toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      }
      var links = Math.max(0, Math.min(1, (p - 0.55) / 0.45));
      root.style.setProperty("--p", p.toFixed(3));
      root.style.setProperty("--links", links.toFixed(3));
      root.classList.toggle("links-on", links > 0.5);
      root.classList.toggle("intro-done", p >= 1);
    };

    var measure = function () {
      mega.style.transform = "translate(-50%, -50%)";            // natural size, centred
      var m = mega.getBoundingClientRect();
      var b = brand.getBoundingClientRect();
      var vw = root.clientWidth, vh = root.clientHeight;          // like position: fixed (no scrollbars)
      fly.x = b.left + b.width / 2 - vw / 2;
      fly.y = b.top + b.height / 2 - vh / 2;
      fly.s = m.width > 0 ? b.width / m.width : 1;
      paint();
    };

    window.addEventListener("scroll", function () {
      if (!framed) { framed = true; requestAnimationFrame(paint); }
    }, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", function () { setTimeout(measure, 250); });
    window.addEventListener("pageshow", measure);                 // back/forward cache, restored scroll
    if (window.visualViewport) window.visualViewport.addEventListener("resize", measure);   // mobile bars
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure();

    // Keyboard users: tabbing into the header shows its links even at the top.
    nav.addEventListener("focusin", function () { root.classList.add("nav-focus"); });
    nav.addEventListener("focusout", function () { root.classList.remove("nav-focus"); });
  }
})();
