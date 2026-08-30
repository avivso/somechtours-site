// REFERRAL LINKS. One line per partner, so adding an influencer is data rather than HTML.
//
// Aviv, 2026-08-28: he has spoken to two travel influencers and wants "a specific link that sends a
// message to the bot with their name on it so i can know where the lead came from and pay them
// accordingly."
//
// WHY A PAGE AND NOT A RAW wa.me LINK. Three reasons, all practical:
//
//   1. A SHORT LINK AND A GOOD OPENING MESSAGE ARE MUTUALLY EXCLUSIVE ON A RAW wa.me LINK, and this
//      is the argument that actually decides it. Hebrew costs six characters per letter once URL
//      encoded, so the natural sentence below turns a wa.me link into 248 characters of noise, which
//      is unusable in a bio. Dropping the sentence gets it to 37 but sends the customer's first
//      message as a bare word. Through this page you get both: 21 characters on the outside, the full
//      sentence on the inside, because the encoding happens after the redirect where nobody sees it.
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
import { writeFileSync, mkdirSync, readFileSync, readdirSync, existsSync, rmSync } from "node:fs";

const WA_NUMBER = "972559171333";

// How a generated page identifies itself. The overwrite check below trusts THIS and nothing else,
// so it can never mistake a real page for one of ours.
const MARKER = "<!--somechtours-referral-->";

// slug: what goes in the URL. name: how the customer refers to them, in the opening line.
//
// These live at the ROOT (somechtours.com/opali), not under a /go/ prefix. Aviv wanted the shorter,
// speakable form. The prefix was doing one real job, namespacing partner names away from real pages,
// so that job is now done by the assertion below instead of by a folder.
//
// `via` is how the name attaches to "הגעתי", and it is spelled out per partner rather than inferred.
// Hebrew will not let one rule cover both: "דרך" is a word and takes a space, while the one-letter
// prefixes (מ, ל, ב) fuse to the word itself — "מבר ושני", never "מ בר ושני". Getting that wrong in a
// sentence the customer sends AS THEIR OWN is exactly the kind of thing that makes them retype it,
// and the attribution dies with the retype. No default: a new partner has to say which one they take.
//
// MIRRORED IN bot/src/referrals.ts. That file reads what these pages produce and is what a commission
// is computed from, so a partner added here and not there is a link whose sales are never attributed.
// Separate repos with separate deploys, so the coupling is a hardcoded list on each side plus
// referral-smoke, which rebuilds this exact sentence from its own copy and asserts it still resolves.
const PARTNERS = [
  { slug: "opli", name: "אופלי", via: "דרך " }, // Aviv shortened the URL, 2026-08-30; the NAME she is credited by is unchanged
  { slug: "barandshany", name: "בר ושני", via: "מ" }, // a pair, so "מבר ושני" reads better than "דרך בר ושני" (Aviv, 2026-08-30)
];

// The opening line. Kept SHORT and natural, because the customer sees it in their own chat and can
// edit it: a paragraph of marketing copy in their mouth reads as spam and gets deleted, taking the
// attribution with it.
//
// NOTHING IN THE BOT PARSES THIS. Checked, 2026-08-30: there is no referral matcher in src, so the
// attribution is Aviv reading "הגעתי מבר ושני" in the chat and knowing where they came from. That is
// why the wording is free to vary per partner — and also why it must stay recognisable to a human
// skimming an inbox, which is the only reader it has.
//
// No emoji, and one flowing sentence rather than two clauses (Aviv, 2026-08-29). Words the customer
// is about to send AS THEIR OWN have to sound like them, and a smiley someone else put in their
// mouth is the tell that they did not write it.
const opener = (p) => `היי! הגעתי ${p.via}${p.name} ואשמח לבדוק כרטיס`;

const page = (p) => {
  const wa = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(opener(p))}`;
  return `<!doctype html>${MARKER}<html lang="he" dir="rtl"><head>
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

// A PARTNER NAME MUST NEVER SHADOW A REAL PAGE.
//
// This is the whole reason the /go/ prefix existed. Removing it puts partner slugs in the same
// namespace as /routes/, /faq/, /terms/ and everything else at the root, so an influencer called
// "faq" or a future page called after a partner would silently take each other's URL. Read the root
// rather than hardcoding a list, so this cannot go stale as the site grows.
// THE FIRST VERSION OF THIS CHECK DEFEATED ITSELF, and it overwrote /faq/ on the very first test.
// It excluded the partner slugs from the "already taken" set so a rebuild could overwrite its own
// output — which excused precisely the collision it existed to catch, because a partner named "faq"
// is in that exclusion list too. Only a page carrying OUR marker may be overwritten. Anything else
// at that path stops the build.
for (const p of PARTNERS) {
  if (!/^[a-z0-9-]+$/.test(p.slug)) {
    console.error(`REFUSING: "${p.slug}" must be lowercase letters, digits and hyphens only.`);
    process.exit(1);
  }
  if (!existsSync(p.slug)) continue;
  const index = `${p.slug}/index.html`;
  const ours = existsSync(index) && readFileSync(index, "utf8").includes(MARKER);
  if (!ours) {
    console.error(`REFUSING: "/${p.slug}" already exists at the site root and is NOT a referral page — it would be overwritten. Pick another slug.`);
    process.exit(1);
  }
}

// The old /go/ pages are removed rather than left to rot as a second live copy of the same link.
if (existsSync("go")) { rmSync("go", { recursive: true, force: true }); console.log("  removed the old /go/ pages"); }

// A PARTNER REMOVED FROM THE LIST ABOVE HAS THEIR PAGE REMOVED TOO.
//
// Renaming a slug used to leave the old directory serving forever, so /opali and /opli would both be
// live and only one of them would be in this file. The list is meant to BE the truth about which
// links exist; a page nothing here knows about is a link nobody can audit.
//
// Marker-gated, exactly like the collision check below: this only ever deletes a directory that
// carries our own generated marker, so it can never eat /faq or /routes however the list changes.
for (const dir of readdirSync(".", { withFileTypes: true })) {
  if (!dir.isDirectory() || PARTNERS.some((p) => p.slug === dir.name)) continue;
  const index = `${dir.name}/index.html`;
  if (!existsSync(index) || !readFileSync(index, "utf8").includes(MARKER)) continue;
  rmSync(dir.name, { recursive: true, force: true });
  console.log(`  removed /${dir.name}/, no longer in PARTNERS`);
}

for (const p of PARTNERS) {
  mkdirSync(p.slug, { recursive: true });
  writeFileSync(`${p.slug}/index.html`, page(p));
  console.log(`  /${p.slug}/  ->  ${p.name}`);
}
console.log(`built ${PARTNERS.length} referral link(s)`);
