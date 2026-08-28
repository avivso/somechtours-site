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

const noFlight = slugs.filter(s => readFileSync(`routes/${s}/index.html`, "utf8").includes('class="air none"'));
console.log(`  ${slugs.length} pages, ${noFlight.length} say there is no useful flight:`);
console.log("    " + noFlight.join("\n    "));
console.log(bad ? `\nFAIL: ${bad} problem(s)` : `\nOK: ${slugs.length} pages clean`);
process.exit(bad ? 1 : 0);
