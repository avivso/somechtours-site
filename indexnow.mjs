// INDEXNOW: tell Bing, Yandex and the rest that a page changed, instead of waiting to be crawled.
//
// Google ignores IndexNow. Everyone else does not, and Bing in particular feeds more than its own
// search results now: it is an input to assistants that answer travel questions, which is the whole
// reason llms.txt exists on this site. A new route page that takes six weeks to be discovered is a
// page that did not exist during the trip someone was planning.
//
// The protocol is deliberately tiny. Prove you own the host by serving a key at
// https://somechtours.com/<key>.txt containing exactly that key, then POST the changed URLs. There
// is no account, no token and no dashboard.
//
//   node indexnow.mjs           submit every url in sitemap.xml
//   node indexnow.mjs <url>...  submit only these
//
// Run it after a deploy that changed page content. Submitting unchanged pages repeatedly is the one
// thing the protocol asks you not to do, so this is not wired into the build.
import { readFileSync, readdirSync } from "node:fs";

const HOST = "somechtours.com";

// The key IS the filename, so there is one source of truth and a renamed file cannot silently
// disagree with a hardcoded constant.
const keyFile = readdirSync(".").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("no IndexNow key file (<32 hex>.txt) in the site root");
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/, "");
const served = readFileSync(keyFile, "utf8").trim();
if (served !== key) {
  console.error(`key file ${keyFile} contains ${JSON.stringify(served)}, which is not its own name`);
  process.exit(1);
}

const urls = process.argv.length > 2
  ? process.argv.slice(2)
  : [...readFileSync("sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (!urls.length) { console.error("nothing to submit"); process.exit(1); }
for (const u of urls) {
  if (!u.startsWith(`https://${HOST}/`)) {
    console.error(`refusing: ${u} is not on ${HOST} (IndexNow rejects the whole batch for one stray host)`);
    process.exit(1);
  }
}

const body = { host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls };
const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// 200 accepted, 202 accepted but the key is still being verified. Both are fine; anything else is not.
const text = await res.text();
console.log(`${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`);
console.log(`submitted ${urls.length} url(s) as ${key}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);
