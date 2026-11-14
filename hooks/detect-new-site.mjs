#!/usr/bin/env node
// UserPromptSubmit hook: if the prompt asks for a brand-new website, load the
// pro-site skill first (it asks "Regular or Pro-site?"). Silent otherwise. Never blocks.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
if (!input || typeof input !== "object" || Array.isArray(input)) process.exit(0);
const prompt = String(input.prompt ?? "");
const cwd = String(input.cwd ?? process.cwd());
const codex = process.argv.includes("codex");

if (!prompt.trim() || prompt.trimStart().startsWith("/")) process.exit(0);

// Already inside a web project? Then it's an edit, not a new site.
try {
  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (Object.keys(deps).some((d) => /^(next|vite|astro|react|react-dom|vue|nuxt|svelte|@sveltejs\/kit|gatsby|@remix-run\/.+|solid-js)$/.test(d))) process.exit(0);
  }
} catch { /* unreadable package.json → fall through */ }

const site =
  /\b(web ?sites?|landing ?pages?|home ?pages?|portfolio(?: site)?|marketing site|micro-?sites?|one-?pager|(?:personal|company|business|brand|product|event) site|site (?:for|about))\b/i.test(prompt) ||
  /(אתר|דף נחיתה|עמוד נחיתה|דף בית)/.test(prompt);
const build =
  /\b(design|redesign|build|create|make|craft|set ?up|launch|mock ?up|need|want)\b/i.test(prompt) ||
  /(עצב|לעצב|תעצב|בנה|לבנות|תבנה|צור|ליצור|תיצור|תכין|להכין|רוצה|צריך)/.test(prompt);
const notDesign =
  /\b(scrap(e|er|ing)|crawl|recon|pentest|pen-test|exploit|vuln\w*|bug ?bounty|hack\w*|phish\w*|analy[sz]\w*|audit|reverse|deobfusc\w*|is (it )?down|outage|takeover)\b/i.test(prompt);

if (site && build && !notDesign) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext:
        "[pro-site hook] This prompt looks like a request for a brand-new website. Unless it is clearly about something else, " +
        (codex
          ? "read and follow the installed `pro-site` SKILL.md using its listed path — before other design skills and before writing any files. "
          : "invoke the `pro-site` skill now with the Skill tool — before frontend-design or any other skill and before writing any files. ") +
        "It asks 'Regular or Pro-site?' unless the user already chose a mode. Preserve explicit user choices.",
    },
  }));
}
process.exit(0);
