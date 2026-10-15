/* MEASUREMENT, ONLY WITH CONSENT (Aviv, 2026-10-15: the ad now sends people to the site, and the ad must learn which
   visits became real WhatsApp leads). Nothing third-party loads until the visitor taps "אישור"; "דחייה" means nothing
   ever loads, and the choice is kept on this device only (localStorage). "הגדרות עוגיות" in the footer asks again.
   The IDs are Aviv's to supply; while one is empty, that tag never loads even with consent. */
(function () {
  var CFG = {
    GA4: "",        /* "G-XXXXXXX"   Google Analytics 4 */
    ADS: "",        /* "AW-XXXXXXX"  Google Ads */
    ADS_LEAD: "",   /* "AW-XXXXXXX/abcDEF" the Google Ads conversion for a WhatsApp click */
    PIXEL: ""       /* "1234567890"  Meta Pixel */
  };
  var KEY = "st-consent-v1";
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var loaded = false;

  function load() {
    if (loaded) return; loaded = true;
    var gid = CFG.GA4 || CFG.ADS;
    if (gid) {
      var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + gid;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag("consent", "default", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
      gtag("js", new Date());
      if (CFG.GA4) gtag("config", CFG.GA4);
      if (CFG.ADS) gtag("config", CFG.ADS);
    }
    if (CFG.PIXEL) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", CFG.PIXEL); fbq("track", "PageView");
    }
  }

  /* A tap on any WhatsApp link (or the hero box) is the lead the ad optimises for. Without consent, nothing is sent. */
  window.stLead = function (where) {
    if (get() !== "yes") return;
    if (window.gtag) {
      gtag("event", "whatsapp_click", { link_location: where || "", transport_type: "beacon" });
      if (CFG.ADS_LEAD) gtag("event", "conversion", { send_to: CFG.ADS_LEAD });
    }
    if (window.fbq) fbq("track", "Lead", { content_name: where || "" });
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (a) window.stLead(a.getAttribute("data-where") || location.pathname);
  }, true);

  function bar() {
    if (document.getElementById("st-consent")) return;
    var css = "#st-consent{position:fixed;inset:auto 12px 12px 12px;z-index:50;max-width:560px;margin:0 auto;background:#fff;color:#111;border:1px solid #e3e6e4;border-radius:16px;box-shadow:0 10px 30px -10px rgba(17,17,17,.25);padding:14px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font:400 14.5px/1.5 Rubik,system-ui,sans-serif;direction:rtl}" +
      "#st-consent p{margin:0;flex:1 1 260px}#st-consent a{color:#0E7A41}#st-consent .b{display:flex;gap:8px;flex:0 0 auto}" +
      "#st-consent button{font:600 14.5px Rubik,system-ui,sans-serif;border-radius:999px;padding:9px 18px;cursor:pointer;border:1.5px solid #111;background:#fff;color:#111}#st-consent button.y{background:#111;color:#fff}";
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement("div"); d.id = "st-consent"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "עוגיות");
    d.innerHTML = '<p>נשמח להשתמש בעוגיות של Google ו-Meta כדי למדוד ביקורים ולשפר את הפרסום שלנו. <a href="/cookies/">פרטים</a></p><div class="b"><button type="button" class="y">אישור</button><button type="button" class="n">דחייה</button></div>';
    document.body.appendChild(d);
    d.querySelector(".y").onclick = function () { set("yes"); d.remove(); load(); };
    d.querySelector(".n").onclick = function () { set("no"); d.remove(); };
  }
  window.stCookieSettings = function () {
    var was = get(); try { localStorage.removeItem(KEY); } catch (e) {}
    if (was === "yes") { location.reload(); return; } /* tags already running stop only with a fresh page */
    bar();
  };

  var c = get();
  if (c === "yes") load();
  else if (c !== "no") (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", bar) : bar());
})();
