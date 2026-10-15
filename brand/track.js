/* MEASUREMENT FOR THE ADS (Aviv, 2026-10-15: the ad sends people to the site and must learn which visits became real
   WhatsApp leads). Aviv's decision the same day: no consent bar. The tags load for everyone, and /cookies/ (linked from
   every footer) explains them and offers a working opt-out ("הפסקת מדידה"), kept on this device, after which no tag
   loads. The IDs are Aviv's to supply; while one is empty, that tag never loads. */
(function () {
  var CFG = {
    GA4: "G-VYY5XZ5JSP", /* Google Analytics 4: property somechtours.com, web stream "Site" */
    ADS: "",        /* "AW-XXXXXXX"  Google Ads */
    ADS_LEAD: "",   /* "AW-XXXXXXX/abcDEF" the Google Ads conversion for a WhatsApp click */
    PIXEL: "1804905007487330" /* Meta: the dataset "סוכן הטיול הגדול · הזמנות מהבוט", where the bot's Conversions API Purchase already lands */
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

  /* A tap on any WhatsApp link (or the hero box) is the lead the ad optimises for. After the opt-out, nothing is sent.
     GA4 batches hits and sends a few seconds later, so a tap that LEAVES the page lost its lead (seen live 2026-10-15:
     page_view arrived, whatsapp_click never did, even with a callback). So WhatsApp opens in a new tab (on a phone: the
     app), this page stays alive, and the batch goes out. If the browser blocks the new tab, the same tab goes. */
  window.stLead = function (where) {
    if (get() === "no") return;
    if (window.fbq) fbq("track", "Lead", { content_name: where || "" }, { eventID: "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) });
    if (window.gtag && (CFG.GA4 || CFG.ADS)) {
      gtag("event", "whatsapp_click", { link_location: where || "", transport_type: "beacon" });
      if (CFG.ADS_LEAD) gtag("event", "conversion", { send_to: CFG.ADS_LEAD });
    }
  };
  /* Opens WhatsApp beside this page, counting the lead; inside the tap, so no popup blocker objects. */
  window.stOpenWa = function (url, where) {
    var w = window.open(url, "_blank");
    window.stLead(where);
    if (w) { try { w.opener = null; } catch (e) {} } else location.href = url;
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    window.stOpenWa(a.href, a.getAttribute("data-where") || location.pathname);
  }, true);

  /* THE OPT-OUT on /cookies/ ("הפסקת מדידה"): kept on this device; from the next page on, no tag loads. */
  window.stOptOut = function () { set("no"); location.reload(); };
  window.stOptIn = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
  window.stMeasuring = function () { return get() !== "no"; };

  if (get() !== "no") load();
})();
