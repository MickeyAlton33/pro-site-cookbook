#!/usr/bin/env node
// Hint the mode checkpoint for new sites and substantial redesigns.
// The skill checks conversation history; the hook never chooses a mode or blocks a turn.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

let input;
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
if (!input || typeof input !== "object" || Array.isArray(input)) process.exit(0);
const raw = String(input.prompt ?? "");
const cwd = String(input.cwd ?? process.cwd());
const codex = process.argv.includes("codex");
if (!raw.trim() || raw.trimStart().startsWith("/")) process.exit(0);

// Normalize common spelling variants without treating every URL as a design request.
const prompt = raw.normalize("NFKC")
  .replace(/\b(?:redisign|redisgn|redesgn|re-design)\b/gi, "redesign")
  .replace(/\b(?:deisgn|desgin)\b/gi, "design");
const url = /https?:\/\/[^\s<>"']+/i.test(prompt);
const site = /\b(?:web[ -]?sites?|sites?|landing[ -]?pages?|home[ -]?pages?|portfolio(?: site)?|micro-?sites?|one-?pager)\b/i.test(prompt)
  || /(אתר|דף נחיתה|עמוד נחיתה|דף בית)/.test(prompt);
const redesign = /\b(?:redesign|rebuild|rebrand|revamp|overhaul|reimagine)\b/i.test(prompt)
  || /(עיצוב מחדש|לעצב מחדש|תעצב מחדש|בנייה מחדש)/.test(prompt);
const design = /\b(?:design|redesign|rebuild|rebrand|revamp|overhaul|reimagine)\b/i.test(prompt)
  || /(עצב|לעצב|תעצב|עיצוב)/.test(prompt);
const build = design || /\b(?:build|create|make|craft|set ?up|launch|mock ?up)\b/i.test(prompt)
  || /\b(?:need|want)\s+(?:(?:a|an|new|brand-new|professional)\s+)*(?:website|site|landing page|portfolio)\b/i.test(prompt)
  || /(בנה|לבנות|תבנה|צור|ליצור|תיצור|תכין|להכין|רוצה|צריך)/.test(prompt);
const newSite = /\b(?:new|from scratch|from the ground up)\b/i.test(prompt)
  || /(חדש|מאפס)/.test(prompt);
const componentTarget = /\b(?:design|redesign|build|create|make|rebuild)\s+(?:(?:a|an|the|this|that|my|our|new|single)\s+)*(?:button|card|component|navbar|navigation|header|footer|hero|form|modal|icon|logo|API|database|schema|CLI|script)\b/i.test(prompt);
const nonDesignWork = /\b(?:scrap(?:e|er|ing)|crawl|recon|pentest|pen-test|exploit|vuln\w*|bug ?bounty|hack\w*|phish\w*|analy[sz]\w*|audit|reverse|deobfusc\w*|is (?:it )?down|outage|takeover)\b/i.test(prompt);
const siteDesignTarget = /\b(?:design|redesign|rebuild|rebrand|revamp|overhaul|reimagine|build|create|make)\s+(?:(?:a|an|the|this|that|my|our|new|brand-new|existing|current|professional)\s+)*(?:website\b|site\b|landing page\b|homepage\b|portfolio\b|https?:\/\/)/i.test(prompt);
// Content extraction followed by an explicit design/rebuild is still a design task.
if ((!site && !(url && design)) || !build || (componentTarget && !siteDesignTarget) || (nonDesignWork && !redesign && !siteDesignTarget)) process.exit(0);

let webProject = false;
try {
  const path = join(cwd, "package.json");
  if (existsSync(path)) {
    const pkg = JSON.parse(readFileSync(path, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    webProject = Object.keys(deps).some((d) => /^(next|vite|astro|react|react-dom|vue|nuxt|svelte|@sveltejs\/kit|gatsby|@remix-run\/.+|solid-js)$/.test(d));
  }
} catch { /* The model can inspect an unreadable project before proceeding. */ }
// Existing source does not exclude a requested redesign or a separate new site.
if (webProject && !redesign && !newSite) process.exit(0);

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext:
      "[pro-site hook] This appears to request a new website or substantial visual redesign, including a live URL. " +
      "If the design prompt is only a quoted example in a troubleshooting/setup task, continue that task instead. Otherwise: " +
      (codex
        ? "Read and follow the installed `pro-site` SKILL.md using its listed path. "
        : "Invoke the `pro-site` skill with the Skill tool. ") +
      "Before content capture, scaffolding, or design work, check whether this conversation already contains an explicit Regular/default or Pro-site choice for this task. " +
      "If not, ask 'How should I build this site — Regular (default) or Pro-site?' and WAIT for the answer. " +
      "Do not infer a Pro-site choice from 'wow', 'professional', 3D, animations, a requested option count, or deployment instructions. " +
      "Preserve the requested number of options, source content, stack, and deployment authorization after the mode is chosen. " +
      "Skip the question for small edits/components or an explicit existing mode choice.",
  },
}));
