# pro-site-cookbook

A Claude Code plugin + runbook for building art-directed websites **without doing any setup yourself**.

Ask Claude for a brand-new site in any session and it asks one question:

> **How should I build this site?** — **Pro-site** or **Regular**

- **Regular** — Claude builds it right where you are, the usual way.
- **Pro-site** — Claude creates `~/sites/<name>`, scaffolds a Next.js + Tailwind v4 + shadcn + GSAP + Playwright project, and runs the whole pipeline itself:

```
brief (only if missing) → 3 divergent directions → you pick one   ← the only checkpoint
  → Design contract + OKLCH tokens → build section by section
  → design-reviewer agent screenshots 375 / 768 / 1440 and critiques, fixes until APPROVED
  → Lighthouse (mobile + desktop, production build) · zero console errors · Playwright visual baselines
  → commit → offer Vercel deploy
```

It stays quiet for edits to existing projects, single components, and in-app UI.

## Install

1. Set up the tool stack once — see **[RUNBOOK.md](RUNBOOK.md)** (MCP servers, skills, sign-ins, gotchas).
2. Install the plugin:

```bash
claude plugin marketplace add MickeyAlton33/pro-site-cookbook
claude plugin install pro-site@pro-site-cookbook
```

3. Restart Claude Code and ask for a site: *"Design a landing page for my coffee roastery."*

## What's inside

```
.claude-plugin/          plugin.json + marketplace.json
skills/pro-site/
  SKILL.md               trigger, mode question, the full Pro-site pipeline
  scripts/new-site.sh    scaffold (create-next-app 16 · shadcn · GSAP/Lenis · Playwright · CLAUDE.md)
  scripts/add-mcp.sh     per-project MCPs: 21st, fal, webflow, framer (OAuth)
  templates/CLAUDE.md    the Design contract + workflow + Definition of done
  templates/playwright.config.ts, visual.spec.ts   visual regression at the 3 review widths
hooks/detect-new-site.mjs   UserPromptSubmit hook: spots new-site requests (EN + HE) and starts pro-site first
agents/design-reviewer.md   art-director subagent (pro-site:design-reviewer); approves from screenshots only
RUNBOOK.md               the environment setup, with every command verified
```

## The Design contract

Every Pro-site project gets a `CLAUDE.md` that Claude treats as binding: tokens only from `theme.css` (Tailwind v4 `@theme`, OKLCH), max two self-hosted variable fonts on a 1.25 scale, a 12-column grid, GSAP only with one signature ScrollTrigger moment and `prefers-reduced-motion` respected, shadcn primitives with custom composition — and a ban list (purple-blue gradients, glassmorphism cards, emoji icons, "Trusted by" logo strips, stock 3D blobs, Inter as display).

## Requirements

macOS or Linux, Node ≥ 20, git, Chrome, Claude Code, ~3 GB free disk per site.

## License

MIT
