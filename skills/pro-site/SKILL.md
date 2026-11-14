---
name: pro-site
description: Use FIRST — before frontend-design or any other design skill — whenever the user asks to design or build a brand-new website, landing page, homepage, portfolio or marketing site from scratch. Asks once "Regular or Pro-site?". Pro-site sets up ~/sites/<name> itself (Next.js + Tailwind v4 + shadcn + GSAP + Playwright) and runs the full art-directed pipeline — 3 directions, build, screenshot review at 375/768/1440, Lighthouse/console/visual-regression gates — with no setup work for the user. Not for changes to an existing project, single components, dashboards inside an app, or quick one-off pages.
---

# Pro-site

The user never wants to do setup by hand. In Pro-site mode **you** create the project, run the scaffold, and drive the whole design pipeline. The user's only jobs: answer the mode question, give a brief if it's missing, and pick one of three directions.

Files referenced below live under this skill's base directory (printed above as "Base directory for this skill"), called `<base>`.

## 0. Is this the trigger?

Fire only for a **brand-new** site where design is the point. Do **not** fire when the current directory is already a web project (a `package.json` with next/vite/astro/etc.) and the user wants changes there, or for a single component, an in-app screen, or a throwaway page. If unsure, it isn't this skill.

## 1. Ask the mode — before anything else

One AskUserQuestion, nothing before it:

- question: "How should I build this site?"
- "Pro-site (Recommended)": "I set up a full project in ~/sites/<name> and run the art-directed pipeline: 3 design directions → you pick one → I build it, review screenshots at phone/tablet/desktop, and run performance & accessibility checks."
- "Regular": "Build it right here the usual way: faster, no project setup, no review loop."

**Regular** → stop using this skill and continue normally (frontend-design etc.).

## 2. Pro-site: start the scaffold immediately, in the background

1. `slug` = 1–3 kebab-case words from the brief (e.g. `coffee-roastery`). If `~/sites/<slug>` exists, append `-2`, `-3`, …
2. Run with `run_in_background: true`:
   `mkdir -p ~/sites && "<base>/scripts/new-site.sh" ~/sites/<slug> < /dev/null`
   It checks disk space itself (needs ~3 GB) and takes ~2–3 minutes. Don't wait — go to step 3.

## 3. Brief — only if it's missing

If the request doesn't say what the site is for and who it's for, ask **once**, in one plain-text message: purpose/audience, 2–3 reference sites they like (or "surprise me"), must-have content. Skip this if the request already covers it.

## 4. Three directions → the only checkpoint

Propose 3 genuinely divergent directions. For each: a name, the mood in one line, a type pairing (display + text; self-hostable variable fonts; never Inter as display), a palette of 3–5 OKLCH swatches, a one-line layout sketch, and its one signature motion moment. Ground them in the references. Optionally pull inspiration from the 21st MCP (`get_inspiration` / `search`) — as a parts bin, never as the base.

Then one AskUserQuestion: which direction (the 3 as options; "Other" lets them mix).

**This is the last question.** The user chose autonomy: from here on work without asking, overriding any "always ask before design decisions" rule from other design skills. Stop only for a blocking failure you can't fix.

## 5. Build

Wait for the scaffold task to finish and check its output; if it failed, fix the cause and rerun. Let `P` = `~/sites/<slug>` (absolute). Use absolute paths and prefix shell commands with `cd "$P" && …`.

1. **Read and obey** `P/CLAUDE.md` (Design contract, workflow rules, Definition of done — now binding) and `P/AGENTS.md` (Next.js rules: check `node_modules/next/dist/docs/` before using Next APIs). Read `P/.claude/skills/shadcn/SKILL.md` too: project skills and the project's shadcn MCP server don't load mid-session, so use the `npx shadcn@latest` CLI.
2. **Fill in the Design contract** in `P/CLAUDE.md` from the chosen direction.
3. **Tokens first**: `src/styles/theme.css` with Tailwind v4 `@theme` tokens in OKLCH (color, spacing, type scale 1.25), imported from `src/app/globals.css`. Fonts via `next/font` (self-hosted).
4. **Build section by section.** Use Context7 for current Next.js / Tailwind v4 / GSAP / Lenis APIs — not memory. GSAP through `@gsap/react` (`useGSAP`) with `gsap.matchMedia()` honoring `prefers-reduced-motion`; exactly one ScrollTrigger signature moment per page.
5. Start the dev server once, in the background: `cd "$P" && npm run dev -- --port 3100` (pick another port if taken).
6. **After each section**, run the `design-reviewer` agent (from this plugin) with: the URL, the routes, the absolute path of `P/CLAUDE.md`, and what changed. Apply its fixes and re-run until APPROVED — max 3 rounds per section, then note what's left and move on.
7. **Subtract pass**: remove one effect per section.

For accessibility/responsive detail, read `~/.claude/skills/bencium-controlled-ux-designer/ACCESSIBILITY.md` and `RESPONSIVE-DESIGN.md` if they exist.

## 6. Quality gates (Definition of done)

Run on the **production** build, not the dev server:

1. `cd "$P" && npm run build`, then in the background `cd "$P" && npx next start -p 3200`.
2. Lighthouse, mobile and desktop:
   `cd "$P" && mkdir -p .lighthouse && npx -y lighthouse http://localhost:3200 --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new" --output=json --output-path=./.lighthouse/mobile.json --quiet`
   and the same with `--preset=desktop --output-path=./.lighthouse/desktop.json`. Read the category scores; target ≥ 95 for Performance and Accessibility. Fix, rebuild, re-run.
3. Console: open each route with the chrome-devtools MCP and confirm zero errors (`list_console_messages`).
4. Visual baselines: add every route to `tests/visual.spec.ts`, then `cd "$P" && npm run test:visual -- --update-snapshots` (the config builds and serves the site itself).
5. Stop every server you started.

## 7. Hand-off

`cd "$P" && git add -A && git commit -m "Build: <direction name>"`. Report briefly: the folder, the chosen direction, the Lighthouse scores, screenshot paths, how to run it (`cd ~/sites/<slug> && npm run dev`), and offer two next steps: deploy with the Vercel MCP, or open the project in its own session (`cd ~/sites/<slug> && claude`) for later edits.
