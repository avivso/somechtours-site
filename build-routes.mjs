// ROUTE PAGES: informational first, and factually about the WHOLE journey.
//
// Aviv, 2026-08-28: "its informational so for example bangkok to koh phangan is done alot of times
// through an inner flight to surat thani or koh samui. make sure all of the routes are factually
// correct for their explanation."
//
// That is the whole design constraint. A page that describes only the legs we happen to SELL is not
// informational, it is a catalogue with a Hebrew wrapper, and a traveller who reads it and then
// discovers everyone actually flies to Surat Thani will not trust the rest of it either. So each page
// describes how the journey is really made, including the options we do not sell, and is honest about
// which parts we handle.
//
// NO PRICES ANYWHERE, by Aviv's instruction. Durations, modes, stations, piers and departure patterns
// are stable facts; prices are not, and a stale number on a static page would also contradict the bot,
// which is the same failure that cost a day of work inside the product.
//
// Every route below was checked against live 12Go inventory before being written (all 27 candidates
// had real service) and then RESEARCHED for the real-world picture, because inventory tells you what
// is bookable, not what people actually do.
//
//   node build-routes.mjs
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const WA = "https://wa.me/972559171333";

const ROUTES = [
  {
    slug: "bangkok-koh-phangan",
    he: { from: "בנגקוק", to: "קופנגן" },
    title: "איך מגיעים מבנגקוק לקופנגן",
    desc: "אין קו ישיר לקופנגן. מגיעים דרך סוראט תאני או קו סמוי, ברכבת לילה, באוטובוס או בטיסה פנימית, ואז במעבורת. כל האפשרויות, כמה זמן כל אחת לוקחת ומה שווה לדעת.",
    // The lede is what an answer engine lifts. It must answer the question by itself.
    lede: "אין אוטובוס, רכבת או מעבורת שנוסעים ישירות מבנגקוק לקופנגן. כל הדרכים עוברות דרך היבשת בסוראט תאני או דרך קו סמוי, ומסתיימות במעבורת לנמל תונג סאלה שבקופנגן. ההבדל בין האפשרויות הוא בעיקר כמה מהמסלול עושים ביבשה וכמה באוויר.",
    ways: [
      { h: "רכבת לילה לסוראט תאני ואז מעבורת", t: "בערך 10 עד 12 שעות בסך הכל",
        p: "רכבת הלילה יוצאת מבנגקוק בערב ומגיעה לסוראט תאני בבוקר. משם הסעה קצרה לנמל דונסאק, ומשם מעבורת לתונג סאלה. חברות המעבורות מוכרות את זה ככרטיס משולב אחד, כך שלא צריך לתאם בעצמכם בין הרכבת להסעה למעבורת. זו האפשרות שחוסכת לילה במלון, כי את רוב הדרך עושים בשינה." },
      { h: "אוטובוס לילה ואז מעבורת", t: "בערך 10 עד 12 שעות בסך הכל",
        p: "אותו רעיון, עם אוטובוס במקום רכבת: יציאה מבנגקוק בערב, הגעה לאזור סוראט תאני בבוקר, הסעה לנמל ומעבורת. גם זה נמכר ככרטיס משולב. האוטובוס לרוב זול יותר מהרכבת ומגיע מעט מוקדם יותר, אבל שינה על רכבת נוחה יותר משינה על אוטובוס לרוב האנשים." },
      { h: "טיסה פנימית ואז מעבורת", t: "בערך 3 עד 4 שעות בסך הכל",
        p: "הרבה מטיילים עושים את זה כך: טיסה קצרה מבנגקוק לקו סמוי ואז מעבורת של כחצי שעה לקופנגן, או טיסה לסוראט תאני ואז מעבורת ארוכה יותר. זו הדרך המהירה ביותר בהפרש גדול. אנחנו לא מוכרים את הטיסה עצמה, אבל אם זה מה שאתם רוצים, נציג אנושי מהצוות שלנו ייכנס לשיחה ויסדר איתכם את זה, ואנחנו יכולים לסדר את המעבורת ואת הקטעים הקרקעיים משני הצדדים." },
    ],
    know: [
      "הנמל בצד היבשת הוא דונסאק, לא סוראט תאני עצמה. בין תחנת הרכבת או האוטובוס לנמל יש עוד נסיעה, וזו הסיבה שכרטיס משולב עדיף על הרכבת בנפרד.",
      "הנמל בקופנגן הוא תונג סאלה, וממנו לוקחים מונית או סונגטאו לחוף שלכם.",
      "ים סוער בעונת הגשמים יכול לבטל מעבורות. אם יש לכם טיסה בהמשך, כדאי לא לתכנן אותה צמוד ליום ההגעה.",
    ],
  },
  {
    slug: "bangkok-chiang-mai",
    he: { from: "בנגקוק", to: "צ'אנג מאי" },
    title: "איך מגיעים מבנגקוק לצ'אנג מאי",
    desc: "רכבת לילה או אוטובוס VIP. כמה זמן לוקחת כל אפשרות, מה ההבדל בין מחלקות השינה ברכבת, ומתי כדאי להזמין מראש.",
    lede: "יש שתי דרכים קרקעיות מבנגקוק לצ'אנג מאי, ושתיהן נוסעות בלילה: רכבת לילה, שלוקחת בערך 12 עד 13 שעות, ואוטובוס VIP, שלוקח בערך 9 עד 10 וחצי שעות. האוטובוס מהיר יותר, הרכבת נוחה יותר לשינה, ושתיהן חוסכות לילה במלון.",
    ways: [
      { h: "רכבת לילה", t: "בערך 12 עד 13 שעות",
        p: "יוצאת מבנגקוק בערב ומגיעה לצ'אנג מאי בבוקר. במחלקה שנייה עם מיזוג המושבים נפתחים למיטות בקומותיים עם וילון לפרטיות. במחלקה ראשונה יש תא סגור לשניים שאפשר לנעול ולכבות בו את האור, אבל יש מעט מאוד תאים כאלה והם נחטפים. הקרונות החדשים ברכבות 9 ו-10 הם המודרניים ביותר בקו, עם שקע חשמל לכל מקום." },
      { h: "אוטובוס VIP לילה", t: "בערך 9 עד 10 וחצי שעות",
        p: "יוצא בעיקר בין שבע לתשע וחצי בערב ומגיע בבוקר. באוטובוסי ה-VIP המושבים נפתחים כמעט לשכיבה, יש פחות מושבים בשורה ולכן יותר מקום לרגליים. זו האפשרות המהירה מבין השתיים, והיא לרוב גם הזולה." },
    ],
    know: [
      "המיזוג ברכבות הלילה בתאילנד חזק מאוד. שמיכה יש, אבל כדאי שיהיה משהו ארוך ללבוש.",
      "בעונה הגבוהה, ובעיקר סביב דצמבר, ינואר וסונגקראן באפריל, מיטות הרכבת נחטפות שבועיים עד חודש מראש. האוטובוס נשאר זמין הרבה יותר זמן.",
      "המחלקה הראשונה ברכבת אינה בהכרח שדרוג משמעותי לזוג. ההבדל האמיתי הוא דלת שנסגרת, לא נוחות המיטה.",
    ],
  },
  {
    slug: "delhi-rishikesh",
    he: { from: "דלהי", to: "רישיקש" },
    title: "איך מגיעים מדלהי לרישיקש",
    desc: "אוטובוס ישיר מקשמירי גייט, או רכבת להרידוואר ומשם מונית. זמנים, ההבדל בין התחנות, ומה שכדאי לדעת על הקטע האחרון.",
    lede: "המרחק מדלהי לרישיקש הוא בערך 230 קילומטר. אוטובוס ישיר מתחנת קשמירי גייט לוקח בערך שש עד שבע שעות ומגיע עד רישיקש עצמה. רכבת מגיעה מהר יותר אבל לרוב עוצרת בהרידוואר, ומשם צריך עוד נסיעה של כשעה.",
    ways: [
      { h: "אוטובוס ישיר", t: "בערך 6 עד 7 שעות",
        p: "יוצא מתחנת קשמירי גייט בדלהי, כולל אוטובוסי וולוו ממוזגים ואוטובוסי לילה. היתרון הגדול הוא שהוא מגיע לרישיקש עצמה, בלי החלפה בסוף. אוטובוס לילה מגיע בבוקר, מה שנוח אם אתם רוצים להתחיל את היום ברישיקש." },
      { h: "רכבת להרידוואר ואז מונית", t: "בערך 4 וחצי עד 6 שעות ברכבת, ועוד כשעה",
        p: "לרישיקש יש תחנת רכבת משלה, אבל הרבה מהרכבות הארוכות מסתיימות בהרידוואר. משם נסיעה של 45 עד 60 דקות במונית או בטוק טוק. הרכבות המהירות בקו הן מהנוחות בהודו, והקטע האחרון הוא מה שמוסיף את הזמן." },
    ],
    know: [
      "רישיקש והרידוואר הן שתי ערים שונות במרחק של כשעה. אם הכרטיס שלכם אומר הרידוואר, זו לא טעות, אבל תכננו את הקטע האחרון.",
      "בתקופת קנוואר יאטרה, בדרך כלל בסוף יולי ותחילת אוגוסט, הכבישים בין הרידוואר לרישיקש נסגרים או מוסטים והנסיעה מתארכת מאוד. אם אתם נוסעים אז, שאלו אותנו לפני שאתם קובעים.",
      "מאז שנפתח הכביש המהיר דלהי-דהרדון הנסיעה ברכב פרטי התקצרה מאוד, אבל האוטובוסים הציבוריים לא בהכרח משתמשים בו לכל אורכו.",
    ],
  },
  {
    slug: "mumbai-goa",
    he: { from: "מומבאי", to: "גואה" },
    title: "איך מגיעים ממומבאי לגואה",
    desc: "רכבת קונקן או אוטובוס לילה. ההבדל בין תחנת מדגאון לתחנת תיווים, איזו מהן קרובה לצפון גואה, וכמה זמן כל אפשרות לוקחת.",
    lede: "רכבת קונקן היא הדרך הנפוצה ממומבאי לגואה, והיא לוקחת בערך 10 עד 14 שעות תלוי ברכבת. יש גם אוטובוסי לילה שלוקחים בערך אותו זמן. השאלה החשובה יותר מהאפשרות עצמה היא באיזו תחנה בגואה אתם יורדים.",
    ways: [
      { h: "רכבת לילה בקו קונקן", t: "בערך 10 עד 14 שעות",
        p: "הרכבות הלילה יוצאות ממומבאי בערב ומגיעות לגואה בבוקר, ורובן חוצות את הקו היפה של קונקן. יש גם רכבת יום מהירה יותר. הרכבות עוצרות גם בתיווים וגם במדגאון, וזה ההבדל שחשוב לכם: תיווים היא התחנה של צפון גואה, ומדגאון של דרום גואה." },
      { h: "אוטובוס לילה", t: "בערך 10 עד 13 שעות",
        p: "אוטובוסי סליפר עם מיטות אמיתיות ווילון, שיוצאים ממומבאי בערב ומגיעים בבוקר. היתרון על פני הרכבת הוא שאוטובוס יכול להוריד אתכם קרוב יותר לחוף שאליו אתם נוסעים, בלי תחנת רכבת באמצע." },
    ],
    know: [
      "אם אתם נוסעים לארמבול, לאנג'ונה או לוואגטור, כלומר לצפון גואה, תיווים היא התחנה שלכם ולא מדגאון. ההפרש ביניהן הוא נסיעה של יותר משעה.",
      "רכבות קונקן מתמלאות מוקדם, במיוחד בעונה ובסופי שבוע. זו אחת הרכבות שכדאי לסגור מראש ולא ביום הנסיעה.",
      "בעונת המונסון הקו יפה במיוחד, אבל גם צפויים עיכובים. אל תתכננו טיסה מגואה באותו יום שאתם מגיעים.",
    ],
  },
  {
    slug: "hanoi-sapa",
    he: { from: "האנוי", to: "סאפה" },
    title: "איך מגיעים מהאנוי לסאפה",
    desc: "אוטובוס סליפר בכביש המהיר או רכבת לילה ללאו קאי. כמה זמן כל אחת לוקחת דלת לדלת, ולמה רוב המטיילים בוחרים היום באוטובוס.",
    lede: "לסאפה אין תחנת רכבת. אוטובוס סליפר או לימוזין ואן נוסעים ישירות מהאנוי לסאפה בכביש המהיר ולוקחים בערך חמש וחצי עד שבע שעות. רכבת הלילה מגיעה רק ללאו קאי, ומשם עוד כשעה בהסעה, כך שדלת לדלת היא בערך תשע עד עשר שעות.",
    ways: [
      { h: "אוטובוס סליפר או לימוזין ואן", t: "בערך 5 וחצי עד 7 שעות",
        p: "נוסעים בכביש המהיר נוי באי-לאו קאי ישירות לסאפה, עם עצירת מנוחה אחת בדרך. יש גרסאות עם מיטות ממש וגרסאות ואן קטן ונוח יותר. זו הדרך המהירה, והיא הפכה להיות הבחירה של רוב המטיילים מאז שהכביש המהיר נפתח." },
      { h: "רכבת לילה ללאו קאי ואז הסעה", t: "בערך 8 שעות ברכבת, ועוד כשעה",
        p: "יוצאת מהאנוי בערב ומגיעה ללאו קאי בבוקר, בתאי שינה של ארבעה או שניים. משם הסעה של כשעה במעלה ההר לסאפה. איטית יותר, אבל היא חוסכת לילה במלון ואין בה את הפיתולים של הכביש ההררי." },
    ],
    know: [
      "הרכבת לא מגיעה לסאפה. מי שמזמין רכבת בלבד מוצא את עצמו בלאו קאי בשש בבוקר בלי הקטע האחרון, אז ודאו שההסעה כלולה.",
      "אם אתם רגישים לנסיעות מפותלות, הקטע האחרון בכביש ההררי לסאפה מורגש בכל אחת מהאפשרויות.",
      "בחורף בסאפה קר באמת, לפעמים מתחת לעשר מעלות. האוטובוסים והרכבות מחוממים חלקית בלבד.",
    ],
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const page = (r) => {
  const url = `https://somechtours.com/routes/${r.slug}/`;
  // FAQPage from the route's own questions: each "way" is a question a traveller really asks, and the
  // answer stands alone so an answer engine can lift it without the surrounding page.
  const faq = {
    "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "he",
    mainEntity: [
      { "@type": "Question", name: r.title + "?", acceptedAnswer: { "@type": "Answer", text: r.lede } },
      ...r.ways.map((w) => ({ "@type": "Question", name: `${w.h} מ${r.he.from} ל${r.he.to} - כמה זמן וממה זה מורכב?`,
        acceptedAnswer: { "@type": "Answer", text: `${w.t}. ${w.p}` } })),
    ],
  };
  const crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "סוכן הטיול הגדול", item: "https://somechtours.com/" },
      { "@type": "ListItem", position: 2, name: "מסלולים", item: "https://somechtours.com/routes/" },
      { "@type": "ListItem", position: 3, name: `${r.he.from} ל${r.he.to}`, item: url },
    ],
  };
  return `<!doctype html><html lang="he" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(r.title)} | סוכן הטיול הגדול</title>
<meta name="description" content="${esc(r.desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta property="og:type" content="article"><meta property="og:site_name" content="סוכן הטיול הגדול">
<meta property="og:title" content="${esc(r.title)}"><meta property="og:description" content="${esc(r.desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="https://somechtours.com/brand/logo.png">
<meta property="og:locale" content="he_IL">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" href="/brand/icon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="/brand/icon-192.png">
<link rel="preload" href="/brand/fonts/heebo-hebrew.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">${JSON.stringify(faq)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
<link rel="stylesheet" href="/routes/route.css">
</head><body>
<div class="wrap">
<header><a class="home" href="/"><img src="/brand/logo-white.png" alt="סוכן הטיול הגדול" width="132" height="70"></a></header>
<nav class="crumb"><a href="/">בית</a> · <a href="/routes/">מסלולים</a></nav>
<h1>${esc(r.title)}</h1>
<p class="lede">${esc(r.lede)}</p>
${r.ways.map((w) => `<div class="way"><h2>${esc(w.h)}</h2><p class="dur">${esc(w.t)}</p><p>${esc(w.p)}</p></div>`).join("\n")}
<h2 class="sec">מה שכדאי לדעת</h2>
<ul class="know">${r.know.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
<div class="ask">
  <p>רוצים לראות מה יוצא בפועל בתאריך שלכם? כתבו לנו ונשלח לכם את האפשרויות עם שעות ומחיר סופי.</p>
  <a class="cta" href="${WA}">לבדוק את הקו הזה בוואטסאפ</a>
</div>
<p class="legal"><a href="/faq/">שאלות ותשובות</a> · <a href="/routes/">כל המסלולים</a> · <a href="/terms/">תנאי שימוש</a></p>
</div>
</body></html>
`;
};

const indexPage = () => `<!doctype html><html lang="he" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>מסלולים: איך מגיעים מעיר לעיר | סוכן הטיול הגדול</title>
<meta name="description" content="מדריכים קצרים לקווים שמטיילים ישראלים נוסעים בהם בפועל: איך מגיעים, כמה זמן זה לוקח, ומה שכדאי לדעת לפני שקונים כרטיס.">
<link rel="canonical" href="https://somechtours.com/routes/">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website"><meta property="og:locale" content="he_IL">
<meta property="og:title" content="מסלולים: איך מגיעים מעיר לעיר">
<meta property="og:url" content="https://somechtours.com/routes/">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="preload" href="/brand/fonts/heebo-hebrew.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/routes/route.css">
</head><body><div class="wrap">
<header><a class="home" href="/"><img src="/brand/logo-white.png" alt="סוכן הטיול הגדול" width="132" height="70"></a></header>
<h1>מסלולים</h1>
<p class="lede">איך מגיעים בפועל מעיר לעיר: כל האפשרויות, כמה זמן כל אחת לוקחת, ומה שכדאי לדעת לפני שקונים כרטיס. בלי מחירים, כי הם משתנים.</p>
<ul class="routes">
${ROUTES.map((r) => `<li><a href="/routes/${r.slug}/"><strong>מ${r.he.from} ל${r.he.to}</strong><span>${esc(r.desc.split(".")[0])}</span></a></li>`).join("\n")}
</ul>
<p class="legal"><a href="/faq/">שאלות ותשובות</a> · <a href="/">לעמוד הבית</a></p>
</div></body></html>
`;

const CSS = `@font-face{font-family:'Heebo';font-style:normal;font-weight:100 900;font-display:swap;src:url(/brand/fonts/heebo-hebrew.woff2) format('woff2');unicode-range:U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:'Heebo';font-style:normal;font-weight:100 900;font-display:swap;src:url(/brand/fonts/heebo-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
:root{--ink:#f2f2f2;--dim:#a9a9a9;--bg:#0a0a0a;--rule:#242424;--wa:#25D366}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);direction:rtl;font-family:"Heebo",system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.65}
.wrap{max-width:44rem;margin:0 auto;padding:28px 22px 72px}
header{padding:10px 0 22px;border-bottom:1px solid var(--rule);margin-bottom:18px}
header img{width:132px;height:auto;display:block}
.crumb{font-size:13px;color:var(--dim);margin:0 0 22px}
.crumb a{color:var(--dim);text-decoration:none}.crumb a:hover{color:#fff;text-decoration:underline}
h1{font-size:clamp(27px,5vw,40px);font-weight:900;line-height:1.2;margin:0 0 12px;text-wrap:balance}
.lede{color:#dcdcdc;font-size:18px;margin:0 0 34px;max-width:36em}
.way{padding:22px 0;border-top:1px solid var(--rule)}
.way h2{font-size:21px;font-weight:700;margin:0 0 4px;line-height:1.35;text-wrap:balance}
.way .dur{margin:0 0 10px;color:var(--wa);font-size:15px;font-weight:700}
.way p{margin:0;color:#dcdcdc}
.sec{font-size:21px;font-weight:700;margin:38px 0 12px;padding-top:22px;border-top:1px solid var(--rule)}
.know{margin:0;padding-inline-start:20px;color:#dcdcdc}.know li{margin-bottom:10px}
.ask{margin-top:40px;padding:24px;border:1px solid var(--rule);border-radius:14px}
.ask p{margin:0 0 16px;color:#dcdcdc}
.cta{display:inline-flex;align-items:center;gap:10px;background:var(--wa);color:#062d14;text-decoration:none;font-weight:800;font-size:17px;padding:14px 24px;border-radius:999px}
.routes{list-style:none;margin:0;padding:0}
.routes li{border-top:1px solid var(--rule)}
.routes a{display:block;padding:18px 0;text-decoration:none;color:var(--ink)}
.routes strong{display:block;font-size:20px;font-weight:700;margin-bottom:4px}
.routes span{color:var(--dim);font-size:15px}
.routes a:hover strong{color:var(--wa)}
.legal{color:var(--dim);font-size:14px;margin-top:36px}.legal a{color:var(--dim)}
@media(prefers-reduced-motion:no-preference){.cta{transition:transform .15s ease}.cta:hover{transform:translateY(-1px)}}
`;

mkdirSync("routes", { recursive: true });
writeFileSync("routes/route.css", CSS);
writeFileSync("routes/index.html", indexPage());
for (const r of ROUTES) {
  mkdirSync(`routes/${r.slug}`, { recursive: true });
  writeFileSync(`routes/${r.slug}/index.html`, page(r));
}

// The sitemap is rebuilt rather than appended to, so a removed route cannot linger in it.
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: "https://somechtours.com/", pri: "1.0", freq: "weekly" },
  { loc: "https://somechtours.com/faq/", pri: "0.8", freq: "monthly" },
  { loc: "https://somechtours.com/routes/", pri: "0.8", freq: "weekly" },
  ...ROUTES.map((r) => ({ loc: `https://somechtours.com/routes/${r.slug}/`, pri: "0.7", freq: "monthly" })),
  { loc: "https://somechtours.com/terms/", pri: "0.3", freq: "monthly" },
];
writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join("\n")}
</urlset>
`);

console.log(`built ${ROUTES.length} route pages + index + sitemap (${urls.length} urls)`);
for (const r of ROUTES) console.log(`  /routes/${r.slug}/  ${r.he.from} → ${r.he.to}`);
