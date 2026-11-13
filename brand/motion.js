/* Inner pages, 2026-11 redesign (Aviv approved 13.11): smooth scrolling (Lenis, vendored) and a soft rise as each block
   comes into view. Blocks already on screen at load show at once. Opacity and movement only, no blur: blur filters on
   many elements made scrolling lag on phones. Nothing runs for visitors who asked their device for reduced motion. */
(function () {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  var s = document.createElement("script");
  s.src = "/brand/lenis.min.js";
  s.onload = function () {
    if (!window.Lenis) return;
    var l = new Lenis({ duration: 1.25, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    (function f(t) { l.raf(t); requestAnimationFrame(f); })(0);
  };
  document.head.appendChild(s);
  if (!("IntersectionObserver" in window)) return;
  var els = [].slice.call(document.querySelectorAll("[role=main] > *, .wrap > h1, .wrap > .lede, .qa, .routes a, .know, .air, .way"));
  var show = function (e) { e.style.opacity = 1; e.style.transform = "none"; };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  els.forEach(function (e) {
    if (e.getBoundingClientRect().top < innerHeight * 0.95) return; // on screen already: leave it as it is
    e.style.opacity = 0; e.style.transform = "translateY(24px)";
    e.style.transition = "opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1)";
    io.observe(e);
  });
})();
