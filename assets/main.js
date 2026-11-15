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
})();
