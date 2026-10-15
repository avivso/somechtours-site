// THE FLIGHT AND COUNTRY PAGES (Admin desk for Aviv, 2026-10-16; DRAFT, waits for his wording).
//
// Search Console (22.8-13.10) shows the site already sitting at position 9-17 for flight searches between cities we
// have route pages for ("טיסה מהאנוי לדה נאנג", "טיסה מבנגקוק לצ'אנג מאי", "טיסה מלימה לקוסקו"), with no page that is
// about the flight. These pages are: /flights/ (how a flight is booked in the chat), one page per flight pair, and one
// page per country explaining its transport and linking every route guide there.
//
// They wear the route pages' own shell (top bar, footer, route.css), read from a built route page so the two can never
// drift, and they are written in plain facts: durations as "about", no prices, the provider never named.
//
//   node build-pages.mjs        (after build-routes.mjs)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const SITE = "https://somechtours.com";
const WA_NUMBER = "972559171333";
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// The shell: everything of a built route page except its own <title>, metas, JSON-LD and main column.
const shellSrc = readFileSync("routes/hanoi-da-nang/index.html", "utf8");
const headTail = shellSrc.slice(shellSrc.indexOf('<link rel="icon"'), shellSrc.indexOf("</head>")).replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, "");
const top = shellSrc.slice(shellSrc.indexOf('<div class="top"'), shellSrc.indexOf('<div class="wrap" role="main">'));
const foot = shellSrc.slice(shellSrc.indexOf("<footer>"));
const WA_ICON = (top.match(/<svg[\s\S]*?<\/svg>/) ?? [""])[0];

// Route guides by country, as build-routes.mjs groups them; the Hebrew title read from each built page.
const COUNTRY_ROUTES = {
  th: ["bangkok-chiang-mai", "chiang-mai-pai", "chiang-mai-chiang-rai", "bangkok-ayutthaya", "bangkok-kanchanaburi", "bangkok-koh-samui",
    "bangkok-koh-phangan", "bangkok-koh-tao", "koh-samui-koh-phangan", "koh-phangan-koh-tao", "bangkok-phuket", "bangkok-krabi", "phuket-koh-phi-phi", "krabi-koh-lanta"],
  vn: ["hanoi-sapa", "hanoi-ha-long", "hanoi-ninh-binh", "hanoi-da-nang", "hue-hoi-an", "da-nang-hoi-an", "ho-chi-minh-da-lat", "ho-chi-minh-mui-ne"],
};
const titleOf = (slug) => {
  const f = `routes/${slug}/index.html`;
  if (!existsSync(f)) throw new Error(`no route page ${slug}`);
  return (readFileSync(f, "utf8").match(/<h1>([^<]+)<\/h1>/) ?? [])[1].replace(/^איך מגיעים /, "");
};

function page({ path, title, h1, description, crumbs, body, faq, waText }) {
  const url = `${SITE}${path}`;
  const ld = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ name: "סוכן הטיול הגדול", item: `${SITE}/` }, ...crumbs.map(([n, p]) => ({ name: n, item: `${SITE}${p}` }))].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })) },
    ...(faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "he", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
  ];
  const html = `<!doctype html><html lang="he" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)} | סוכן הטיול הגדול</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta property="og:type" content="article"><meta property="og:site_name" content="סוכן הטיול הגדול">
<meta property="og:title" content="${esc(h1)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/brand/og-1200x630.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="he_IL">
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join("\n")}
${headTail}</head><body>
${top}<div class="wrap" role="main">
<nav class="crumb" aria-label="מיקום באתר"><a href="/">בית</a>${crumbs.slice(0, -1).map(([n, p]) => ` · <a href="${p}">${esc(n)}</a>`).join("")}</nav>
<h1>${esc(h1)}</h1>
${body}
${faq?.length ? `<h2 class="sec">שאלות נפוצות</h2>\n<ul class="know">${faq.map(([q, a]) => `<li><b>${esc(q)}</b><br>${esc(a)}</li>`).join("")}</ul>` : ""}
<div class="ask">
  <p>רוצים לראות מה יוצא בפועל בתאריך שלכם? כתבו לנו ונשלח לכם את האפשרויות עם שעות ומחיר סופי.</p>
  <a class="cta" href="${waLink(waText)}">${WA_ICON}לבדוק בוואטסאפ</a>
</div>
</div>
${foot}`;
  mkdirSync(path.slice(1), { recursive: true });
  writeFileSync(`${path.slice(1)}index.html`, html);
  return url;
}

const P = (t) => `<p>${t}</p>`;
const way = (h, dur, text) => `<div class="way"><h2>${esc(h)}</h2>${dur ? `<p class="dur">${esc(dur)}</p>` : ""}<p>${text}</p></div>`;
const air = (h, dur, text) => `<div class="air"><h2>${esc(h)}</h2>${dur ? `<p class="dur">${esc(dur)}</p>` : ""}<p>${text}</p></div>`;
const know = (items) => `<h2 class="sec">מה שכדאי לדעת</h2>\n<ul class="know">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const links = (h, items) => `<h2 class="sec">${esc(h)}</h2>\n<ul class="near">${items.map(([t, p]) => `<li><a href="${p}">${esc(t)}</a></li>`).join("")}</ul>`;

// THE FLIGHT PAIRS: each the route page's own city pair, so the two pages link to each other.
const FLIGHTS = [
  {
    slug: "hanoi-da-nang", from: "האנוי", to: "דה נאנג", route: "hanoi-da-nang",
    description: "טיסה של כשעה ורבע עד שעה וחצי, עם יציאות לאורך כל היום. שדה התעופה של דה נאנג נמצא בתוך העיר. כמה זמן לוקחת הטיסה, מאיזה שדה יוצאים ומה עם מזוודה.",
    lede: "הטיסה מהאנוי לדה נאנג היא אחת הטיסות הפנימיות הנפוצות בווייטנאם: כשעה ורבע עד שעה וחצי באוויר, עם יציאות לאורך כל היום. הדרך היבשתית, ברכבת הלילה לאורך החוף, לוקחת בערך 16 עד 17 שעות.",
    blocks: [
      air("כמה זמן לוקחת הטיסה", "בערך שעה ורבע עד שעה וחצי באוויר", "את הטיסה מפעילות כמה חברות, ביניהן חברת התעופה הלאומית וחברות זולות. בהאנוי יוצאים משדה התעופה נוי באי, כ-45 דקות עד שעה נסיעה מהעיר העתיקה, תלוי בתנועה. שדה התעופה של דה נאנג נמצא בתוך העיר, כשלושה קילומטר מהמרכז."),
      way("ומה ברכבת?", "בערך 16 עד 17 שעות", `רכבת הלילה נוסעת לאורך החוף ועוברת במעבר האי ואן, קטע שנחשב לאחד היפים באסיה. כל הפרטים <a href="/routes/hanoi-da-nang/">במדריך מהאנוי לדה נאנג</a>.`),
      know(["בחברות הזולות מזוודה בבטן המטוס היא בדרך כלל בתשלום נפרד. בהצעה שלנו כתוב בדיוק מה כלול: תיק אישי, טרולי ומזוודה, עם המשקל.", "מדה נאנג להוי אן יש כשעה נסיעה. להוי אן אין שדה תעופה משלה.", "בעונת הגשמים במרכז וייטנאם (בערך ספטמבר עד דצמבר) עיכובים קורים יותר. כדאי לא לתכנן חיבור צמוד מדי."]),
    ],
    faq: [["כמה זמן טיסה מהאנוי לדה נאנג?", "בערך שעה ורבע עד שעה וחצי באוויר. עם הדרך לשדה ובדיקות הביטחון, כדאי לתכנן כחצי יום."], ["יש טיסה ישירה מהאנוי לדה נאנג?", "כן. יש טיסות ישירות לאורך כל היום."]],
  },
  {
    slug: "bangkok-chiang-mai", from: "בנגקוק", to: "צ'אנג מאי", route: "bangkok-chiang-mai",
    description: "טיסה של כשעה ורבע מאחד משני שדות התעופה של בנגקוק. מאיזה שדה יוצאים, כמה זמן לוקח, ומה ההבדל מרכבת הלילה.",
    lede: "מבנגקוק לצ'אנג מאי טסים בערך שעה ורבע. יש הרבה טיסות ביום, משני שדות התעופה של בנגקוק. היבשה, ברכבת לילה או באוטובוס, לוקחת בערך 10 עד 13 שעות.",
    blocks: [
      air("כמה זמן לוקחת הטיסה", "בערך שעה ורבע באוויר", "לבנגקוק שני שדות תעופה: סוברנבומי, השדה הבינלאומי הגדול, ודון מואנג, שממנו יוצאות רוב החברות הזולות. חשוב לבדוק מאיזה שדה יוצאת הטיסה שלכם, כי הנסיעה ביניהם לוקחת בערך שעה. שדה התעופה של צ'אנג מאי קרוב לעיר, בערך רבע שעה נסיעה מהעיר העתיקה."),
      way("ומה ביבשה?", "בערך 10 עד 13 שעות", `רכבת הלילה ואוטובוסי ה-VIP יוצאים בערב ומגיעים בבוקר. כל הפרטים <a href="/routes/bangkok-chiang-mai/">במדריך מבנגקוק לצ'אנג מאי</a>.`),
      know(["בהצעה שלנו כתוב מאיזה שדה בבנגקוק יוצאת הטיסה, כדי שלא תגיעו לשדה הלא נכון.", "בחברות הזולות מזוודה בבטן המטוס היא בדרך כלל בתשלום נפרד. בהצעה כתוב בדיוק מה כלול.", "מצ'אנג מאי ממשיכים הרבה לפאי ולצ'אנג ראי, ביבשה."]),
    ],
    faq: [["כמה זמן טיסה מבנגקוק לצ'אנג מאי?", "בערך שעה ורבע באוויר."], ["מאיזה שדה בבנגקוק טסים לצ'אנג מאי?", "משניהם: סוברנבומי ודון מואנג. החברות הזולות יוצאות בעיקר מדון מואנג, ולכן כדאי לבדוק בכרטיס."]],
  },
  {
    slug: "lima-cusco", from: "לימה", to: "קוסקו", route: "lima-cusco",
    description: "טיסה של כשעה וחצי לגובה 3,400 מטר. למה כדאי לטוס בבוקר, מה עם גובה, ומה ההבדל מהאוטובוס של כ-20 שעות.",
    lede: "מלימה לקוסקו טסים בערך שעה וחצי, ונוחתים בגובה של כ-3,400 מטר. באוטובוס הדרך לוקחת בערך 20 עד 22 שעות, ולכן רוב המטיילים טסים.",
    blocks: [
      air("כמה זמן לוקחת הטיסה", "בערך שעה וחצי באוויר", "על הקו טסות כמה חברות, וטיסות הבוקר הן הנפוצות. בקוסקו מזג האוויר אחר הצהריים גורם לפעמים לעיכובים, ולכן טיסת בוקר נוטה להיות בטוחה יותר. שדה התעופה של קוסקו קרוב לעיר, בערך 15 עד 20 דקות מהמרכז."),
      way("ומה באוטובוס?", "בערך 20 עד 22 שעות", `הדרך עולה מהחוף אל הרי האנדים, בלילה. כל הפרטים <a href="/routes/lima-cusco/">במדריך מלימה לקוסקו</a>.`),
      know(["קוסקו גבוהה, כ-3,400 מטר. הרבה אנשים מרגישים את הגובה ביום הראשון, ולכן כדאי לתכנן יום רגוע אחרי הנחיתה. זה מידע כללי, לא ייעוץ רפואי.", "בהצעה שלנו כתוב בדיוק מה כלול: תיק אישי, טרולי ומזוודה, עם המשקל.", "מקוסקו ממשיכים הרבה לפונו ולארקיפה."]),
    ],
    faq: [["כמה זמן טיסה מלימה לקוסקו?", "בערך שעה וחצי באוויר."], ["למה כדאי לטוס לקוסקו בבוקר?", "בקוסקו מזג האוויר אחר הצהריים גורם לפעמים לעיכובים, ולכן טיסת בוקר נוטה להיות בטוחה יותר."]],
  },
];

const built = [];
// /flights/
built.push(page({
  path: "/flights/", title: "טיסות בצ׳אט: מחיר סופי בשקלים", h1: "טיסות בצ׳אט: כותבים לאן, מקבלים מחיר סופי",
  description: "כותבים בוואטסאפ מאיפה ולאן ומתי. המערכת סורקת את הטיסות ומאתרת את הזולה ביותר, ונציג אנושי שולח לכם מחיר סופי בשקלים.",
  crumbs: [["טיסות", "/flights/"]], waText: "היי! הגעתי מהאתר ואשמח לבדוק טיסה",
  body: [
    `<p class="lede">כותבים לנו בוואטסאפ מאיפה ולאן, תאריכים, כמה נוסעים והאם יש מזוודה. המערכת סורקת את הטיסות ומאתרת את הזולה ביותר, ונציג אנושי מאשר אותה ושולח לכם מחיר סופי בשקלים.</p>`,
    way("איך זה עובד", "", "כותבים לאן ומתי. מקבלים הצעה אחת ברורה: שעות, עצירות, מה כלול בכבודה, ומחיר סופי בשקלים. המחיר בתוקף ל-30 דקות. אם מתאים, ממלאים פרטי נוסעים, משלמים בקישור מאובטח, והכרטיס מגיע לאותה שיחה."),
    know(["המחיר שאנחנו שולחים הוא הסכום הסופי בשקלים, כולל העמלה שלנו.", "בכל הצעה כתוב בדיוק מה כלול בכבודה: תיק אישי, טרולי ומזוודה, עם המשקל.", "תשלום בכרטיס אשראי או בביט, בקישור מאובטח. אנחנו לא רואים את פרטי האשראי.", "תנאי הביטול של כל כרטיס מופיעים בהצעה לפני התשלום, והפרטים המלאים בתנאי השירות."]),
    links("טיסות פנים נפוצות", FLIGHTS.map((f) => [`טיסה מ${f.from} ל${f.to}`, `/flights/${f.slug}/`])),
  ].join("\n"),
  faq: [["אתם מזמינים טיסות מישראל?", "כן, וגם טיסות בתוך המדינות שאתם מטיילים בהן. כותבים מאיפה ולאן ומתי."], ["המחיר סופי?", "כן. המחיר שאנחנו שולחים הוא הסכום הסופי בשקלים, כולל העמלה שלנו."]],
}));
for (const f of FLIGHTS) built.push(page({
  path: `/flights/${f.slug}/`, title: `טיסה מ${f.from} ל${f.to}`, h1: `טיסה מ${f.from} ל${f.to}`, description: f.description,
  crumbs: [["טיסות", "/flights/"], [`מ${f.from} ל${f.to}`, `/flights/${f.slug}/`]], waText: `היי! הגעתי מהאתר ואשמח לבדוק טיסה מ${f.from} ל${f.to}`,
  body: [`<p class="lede">${esc(f.lede)}</p>`, ...f.blocks].join("\n"), faq: f.faq,
}));

// THE COUNTRY PAGES
const COUNTRIES = [
  {
    code: "th", slug: "thailand", he: "תאילנד",
    description: "אוטובוסים, רכבות לילה, מעבורות לאיים וטיסות פנים בתאילנד: מה מתאים לאיזה קטע, כמה זמן לוקח, ומדריך לכל מסלול.",
    lede: "בתאילנד מגיעים כמעט לכל מקום ביבשה: אוטובוסי VIP ורכבות לילה לצפון, ואוטובוס ומעבורת לאיים. בקטעים הארוכים טיסת פנים חוסכת יום שלם.",
    blocks: [
      way("אוטובוסים", "", "על הקווים הארוכים נוסעים אוטובוסי VIP עם מושבים שנפתחים כמעט לשכיבה. קווי הלילה יוצאים בערב ומגיעים בבוקר."),
      way("רכבות לילה", "", "רכבות הלילה לצפון, למשל לצ'אנג מאי, נוחות ומסודרות, עם מיטות במחלקה השנייה. ברכבת כדאי להזמין מראש, כי המיטות נגמרות."),
      way("מעבורות לאיים", "", "לקוסמוי, לקופנגן ולקו טאו מגיעים באוטובוס ומעבורת, בכרטיס משולב אחד. לפי פי מגיעים במעבורת מפוקט או מקראבי."),
      air("טיסות פנים", "", `בקטעים הארוכים, כמו בנגקוק לצ'אנג מאי או לפוקט, טיסה של כשעה מחליפה לילה שלם ביבשה. <a href="/flights/bangkok-chiang-mai/">טיסה מבנגקוק לצ'אנג מאי</a>.`),
    ],
  },
  {
    code: "vn", slug: "vietnam", he: "וייטנאם",
    description: "רכבת האיחוד, אוטובוסי שינה, ואני לימוזין וטיסות פנים בווייטנאם: מה מתאים לאיזה קטע, כמה זמן לוקח, ומדריך לכל מסלול.",
    lede: "וייטנאם ארוכה וצרה, ולכן רוב המטיילים נעים מצפון לדרום או הפוך. ביבשה נוסעים ברכבת האיחוד או באוטובוסי שינה. בקטעים הארוכים טסים.",
    blocks: [
      way("רכבת האיחוד", "", "הרכבת עוברת לאורך כל המדינה, מהאנוי לסייגון, עם תאי שינה של ארבעה או שישה. הקטע בין הואה לדה נאנג נחשב לאחד היפים באסיה."),
      way("אוטובוסי שינה וואני לימוזין", "", "אוטובוסי השינה, עם מיטות במקום מושבים, נוסעים בעיקר בלילה. לסאפה ולהא לונג נוסעים גם בוואני לימוזין, רכבים קטנים ונוחים יותר."),
      air("טיסות פנים", "", `מהאנוי לדה נאנג או לסייגון טסים בערך שעה עד שעתיים, במקום יום ברכבת. <a href="/flights/hanoi-da-nang/">טיסה מהאנוי לדה נאנג</a>.`),
    ],
  },
];
for (const c of COUNTRIES) built.push(page({
  path: `/${c.slug}/`, title: `תחבורה ב${c.he}: אוטובוסים, רכבות, מעבורות וטיסות`, h1: `איך מתניידים ב${c.he}`, description: c.description,
  crumbs: [[c.he, `/${c.slug}/`]], waText: `היי! הגעתי מהאתר ואשמח לבדוק כרטיס ב${c.he}`,
  body: [`<p class="lede">${esc(c.lede)}</p>`, ...c.blocks, links(`כל המסלולים ב${c.he}`, COUNTRY_ROUTES[c.code].map((s) => [titleOf(s), `/routes/${s}/`]))].join("\n"),
}));

console.log(`built ${built.length} pages:\n${built.join("\n")}`);
