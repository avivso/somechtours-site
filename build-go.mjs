// REFERRAL LINKS. One line per partner, so adding an influencer is data rather than HTML.
//
// Aviv, 2026-08-28: he has spoken to two travel influencers and wants "a specific link that sends a
// message to the bot with their name on it so i can know where the lead came from and pay them
// accordingly."
//
// WHY A PAGE AND NOT A RAW wa.me LINK. Three reasons, all practical:
//
//   1. It is typeable. Most of this traffic is Instagram Reels and YouTube, where a huge share of
//      viewers never tap a bio link. "somechtours.com/go/opali" can be said out loud in a video and
//      typed from memory; a wa.me number with a URL-encoded Hebrew query string cannot.
//   2. It is ours. The destination can change (a new number, a different opening line, a campaign
//      landing page) without the influencer editing their bio or re-cutting a video.
//   3. It is branded. A raw wa.me link with a phone number in it looks like a stranger's DM; this
//      looks like the business they were just told about.
//
// The prefilled message is the actual attribution: the customer lands in the chat with the text
// already written and just presses send, which also removes the "what do I even say to a bot"
// hesitation that is the biggest drop-off on a cold WhatsApp link.
//
//   node build-go.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const WA_NUMBER = "972559171333";

// slug: what goes in the URL. name: how the customer refers to them, in the opening line.
const PARTNERS = [
  { slug: "opali", name: "אופלי" },
];

// The opening line. Kept SHORT and natural, because the customer sees it in their own chat and can
// edit it — a paragraph of marketing copy in their mouth reads as spam and gets deleted, taking the
// attribution with it. "הגעתי דרך X" is the marker the bot matches on.
const opener = (name) => `היי! הגעתי דרך ${name} 🙂 אשמח לבדוק כרטיס`;

const page = (p) => {
  const wa = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(opener(p.name))}`;
  return `<!doctype html><html lang="he" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>פותחים וואטסאפ | סוכן הטיול הגדול</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="preload" href="/brand/fonts/heebo-hebrew.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:'Heebo';font-style:normal;font-weight:100 900;font-display:swap;src:url(/brand/fonts/heebo-hebrew.woff2) format('woff2');unicode-range:U+0307-0308,U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
:root{--ink:#f2f2f2;--dim:#a9a9a9;--bg:#0a0a0a;--rule:#242424;--wa:#25D366}
*{box-sizing:border-box}
body{margin:0;min-height:100dvh;display:grid;place-items:center;background:var(--bg);color:var(--ink);
  direction:rtl;font-family:"Heebo",system-ui,Arial,sans-serif;-webkit-font-smoothing:antialiased;padding:24px}
.card{width:100%;max-width:26rem;text-align:center}
.logo{width:150px;height:auto;margin:0 auto 26px;display:block}
h1{font-size:24px;font-weight:800;margin:0 0 10px;line-height:1.3}
p{color:#dcdcdc;margin:0 0 26px;font-size:16px;line-height:1.6}
.cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--wa);color:#062d14;
  text-decoration:none;font-weight:800;font-size:17px;padding:15px 28px;border-radius:999px;width:100%}
.cta svg{width:22px;height:22px}
.dots{display:flex;gap:6px;justify-content:center;margin:0 0 26px}
.dots i{width:7px;height:7px;border-radius:50%;background:var(--dim);opacity:.35;animation:b 1.2s infinite}
.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
@keyframes b{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
@media(prefers-reduced-motion:reduce){.dots i{animation:none;opacity:.5}}
.small{color:var(--dim);font-size:13px;margin:22px 0 0}
.small a{color:var(--dim)}
</style>
</head><body>
<div class="card">
  <img class="logo" src="/brand/logo-white.png" alt="סוכן הטיול הגדול">
  <h1>פותחים לכם את הוואטסאפ</h1>
  <p>ההודעה כבר מוכנה, רק צריך לשלוח אותה. נחזור אליכם עם האפשרויות והמחיר הסופי.</p>
  <div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>
  <a class="cta" id="go" href="${wa}">
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.2 1.25-1.96 1.41-.52.11-1.2.2-3.5-.75-2.94-1.22-4.83-4.2-4.98-4.4-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.7.8.61.39.7 1.33 2.44 1.45 2.61.12.18.2.39.04.62-.15.24-.23.38-.45.59-.22.2-.36.36-.52.58-.15.2-.31.42-.13.73.18.31.8 1.32 1.72 2.14 1.18 1.05 2.17 1.38 2.48 1.53.31.15.49.13.67-.08.18-.2.77-.9.98-1.21.2-.31.41-.26.68-.15.28.1 1.76.83 2.06.98.31.15.51.22.58.35.08.12.08.7-.16 1.38Z"/></svg>
    לפתיחת השיחה
  </a>
  <p class="small">לא נפתח מעצמו? לחצו על הכפתור. <a href="/">סוכן הטיול הגדול</a></p>
</div>
<script>
// Auto-forward, but not instantly: a beat of brand is worth more than 900ms, and an immediate jump
// from a video looks to the viewer like the link was broken. The button is always there, so a
// blocked redirect (in-app browsers block plenty) costs one tap rather than the lead.
setTimeout(function () { window.location.href = document.getElementById("go").href; }, 1400);
</script>
</body></html>
`;
};

for (const p of PARTNERS) {
  mkdirSync(`go/${p.slug}`, { recursive: true });
  writeFileSync(`go/${p.slug}/index.html`, page(p));
  console.log(`  /go/${p.slug}/  ->  ${p.name}`);
}
console.log(`built ${PARTNERS.length} referral link(s)`);
