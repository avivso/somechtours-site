import { existsSync, readFileSync, readdirSync } from "node:fs";
let bad = 0;
const fail = (m) => { console.log("  FAIL " + m); bad++; };
const slugs = readdirSync("routes", { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
const bodies = new Map();

for (const slug of slugs) {
  const h = readFileSync(`routes/${slug}/index.html`, "utf8");
  if (/[—–]/.test(h)) fail(`${slug}: em/en dash`);
  // no prices, in any currency, anywhere. A stale number here would contradict the bot.
  if (/[₪$€£฿]|\bILS\b|\bTHB\b|\d[\d,.]*\s*(שקל|שקלים|בהט)|(שקל|שקלים|בהט)\s*\d/.test(h))
    fail(`${slug}: looks like a price`);
  if (!h.includes("wa.me/972559171333")) fail(`${slug}: no WhatsApp CTA`);
  if (!h.includes("מה עם טיסה?")) fail(`${slug}: no flight section`);
  // never name the supplier
  if (/12Go|12go/i.test(h)) fail(`${slug}: supplier leak`);
  // A Latin letter welded to a Hebrew one is always a typo, never intent. Caught "קרונג תep" after a
  // careless sed ate a character mid-word and the page still rendered, still validated, still lied.
  for (const m of h.matchAll(/[\u0590-\u05FF][A-Za-z]|[A-Za-z][\u0590-\u05FF]/g))
    fail(`${slug}: Latin letter inside a Hebrew word near ${JSON.stringify(h.slice(Math.max(0, m.index - 25), m.index + 15))}`);
  const ld = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  if (ld.length !== 3) fail(`${slug}: expected 3 JSON-LD blocks, got ${ld.length}`);
  // Every related link must resolve to a page that exists. Removing a route (Malaysia) must not be
  // able to leave a link pointing at a 404 from four other pages.
  for (const m of h.matchAll(/href="\/routes\/([a-z\-]+)\/"/g))
    if (!existsSync(`routes/${m[1]}/index.html`)) fail(`${slug}: link to missing route ${m[1]}`);
  for (const m of ld) { try { JSON.parse(m[1]); } catch (e) { fail(`${slug}: bad JSON-LD (${e.message})`); } }
  const faq = JSON.parse(ld[0][1]);
  if (!faq.mainEntity.some(q => q.name.startsWith("האם אפשר לטוס"))) fail(`${slug}: flight Q missing from FAQPage`);
  // the flight paragraph must never promise the BOT will book it
  const air = faq.mainEntity.find(q => q.name.startsWith("האם אפשר לטוס")).acceptedAnswer.text;
  if (/נמכור לכם טיסה|אנחנו מוכרים את הטיסה/.test(air)) fail(`${slug}: implies we sell flights`);
  const sells = /אנחנו לא מוכרים|לא מוכרים את הטיסה|הבוט לא מוכר טיסות/.test(air);
  const noFlight = h.includes('class="air none"');
  if (!sells && !noFlight) fail(`${slug}: a bookable flight is described without saying a person handles it`);
  bodies.set(slug, (h.match(/<p[^>]*>(.*?)<\/p>/gs) || []).join(" ").replace(/<[^>]+>/g, " "));
}

// scaled-content guard: near-identical pages get filtered by Google, so measure real overlap
const sh = (t) => { const w = t.split(/\s+/).filter(Boolean); const s = new Set();
  for (let i = 0; i + 7 <= w.length; i++) s.add(w.slice(i, i + 7).join(" ")); return s; };
const S2 = new Map([...bodies].map(([k, v]) => [k, sh(v)]));
let worst = 0, pair = "";
for (const [a, sa] of S2) for (const [b, sb] of S2) {
  if (a >= b) continue;
  let inter = 0; for (const x of sa) if (sb.has(x)) inter++;
  const j = inter / Math.min(sa.size, sb.size);
  if (j > worst) { worst = j; pair = `${a} vs ${b}`; }
}
console.log(`  max pairwise 7-word overlap: ${(worst * 100).toFixed(1)}%  (${pair})`);
if (worst > 0.30) fail(`pages too similar: ${pair}`);

// THE INDEX. Its cards used to be the first sentence of each page's meta description, so their shape
// was whatever the prose opened with and it drifted between batches. They are generated from the
// pages' own durations now, and this guards the shape so the drift cannot come back quietly.
{
  const h = readFileSync("routes/index.html", "utf8");
  if (/[—–]/.test(h)) fail("index: em/en dash");
  if (/[₪$€£฿]|\bILS\b|\bTHB\b|\d[\d,.]*\s*(שקל|שקלים|בהט)|(שקל|שקלים|בהט)\s*\d/.test(h))
    fail("index: looks like a price");
  for (const m of h.matchAll(/[\u0590-\u05FF][A-Za-z]|[A-Za-z][\u0590-\u05FF]/g))
    fail(`index: Latin letter inside a Hebrew word near ${JSON.stringify(h.slice(Math.max(0, m.index - 25), m.index + 15))}`);
  // The reader has to know the rows open a page. Aviv, 2026-08-29: "make it easier to understand
  // they need to be clicked in order to enter their specific page."
  if (!/לחצו על קו/.test(h)) fail("index: nothing tells the reader the rows are clickable");

  const cards = [...h.matchAll(/<li><a href="\/routes\/([a-z\-]+)\/">([\s\S]*?)<\/a><\/li>/g)];
  if (cards.length !== slugs.length) fail(`index: ${cards.length} cards for ${slugs.length} pages`);
  const linked = new Set();
  for (const [, slug, inner] of cards) {
    if (linked.has(slug)) fail(`index: ${slug} listed twice`);
    linked.add(slug);
    if (!existsSync(`routes/${slug}/index.html`)) fail(`index: card for missing route ${slug}`);
    for (const cls of ["rt-name", "rt-time", "rt-go"])
      if (!inner.includes(`class="${cls}"`)) fail(`index: ${slug} card has no ${cls}`);
    // One shape for every card, or the list stops being scannable: "10 עד 12 שעות", "כ-3 שעות",
    // "45 עד 60 דקות". Halves are allowed; anything finer belongs on the page, not in the list.
    const t = /<span class="rt-time">([^<]*)<\/span>/.exec(inner);
    if (!t) fail(`index: ${slug} card has no journey time`);
    else if (!/^(כ-\d+(\.5)? שעות|\d+(\.5)? עד \d+(\.5)? שעות|כ-\d+ דקות|\d+ עד \d+ דקות)$/.test(t[1]))
      fail(`index: ${slug} journey time is off-format: ${JSON.stringify(t[1])}`);
  }
  for (const slug of slugs) if (!linked.has(slug)) fail(`index: ${slug} is not listed`);
  // Every card sits inside a country heading, and every heading has cards.
  const groups = [...h.matchAll(/<h2 class="grp">([^<]+)<span>/g)].map((m) => m[1]);
  if (!groups.length) fail("index: routes are not grouped by country");
  const ungrouped = h.split(/<h2 class="grp">/)[0];
  if (/<li><a href="\/routes\//.test(ungrouped)) fail("index: a card sits above the first country heading");
  console.log(`  index: ${cards.length} cards in ${groups.length} countries (${groups.join(", ")})`);
}

const noFlight = slugs.filter(s => readFileSync(`routes/${s}/index.html`, "utf8").includes('class="air none"'));
console.log(`  ${slugs.length} pages, ${noFlight.length} say there is no useful flight:`);
console.log("    " + noFlight.join("\n    "));
console.log(bad ? `\nFAIL: ${bad} problem(s)` : `\nOK: ${slugs.length} pages clean`);
process.exit(bad ? 1 : 0);
