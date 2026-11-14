---
name: pro-site
description: Build a brand-new art-directed website, landing page, homepage, portfolio, or marketing site with Claude Code or Codex. Offers Regular or Pro-site mode; Pro-site scaffolds Next.js, shadcn, GSAP, and Playwright, proposes three directions, then builds and checks screenshots and production quality. Not for edits to existing sites, individual components, in-app dashboards, or throwaway pages.
---

# Pro-site

Use this workflow before other design skills for a matching new-site request. Preserve
explicit choices of mode, destination, stack, and deployment target. `<base>` is the
directory containing this `SKILL.md`; resolve scripts and references relative to it.
Do not assume a Claude plugin root or a particular home directory.

## Runtime

| Operation | Claude Code | Codex |
|---|---|---|
| Invoke explicitly | `/pro-site:pro-site` | `$pro-site:pro-site` (plugin), `$pro-site` (standalone), or `/skills` |
| Ask a choice | `AskUserQuestion` | Available user-input tool; otherwise plain text |
| Scaffold option | `--agent claude` | `--agent codex` |
| Project instructions | `CLAUDE.md` imports `AGENTS.md` | Read `AGENTS.md` directly |
| Project shadcn skill | `.claude/skills/shadcn/SKILL.md` | `.agents/skills/shadcn/SKILL.md` |
| Reviewer | `pro-site:design-reviewer` if available | Permitted subagent or self-review using the checklist below |

New project instructions, skills, and MCPs may not load into the current session.
Read the files explicitly and use the provided CLI/browser fallbacks until a new
session starts. Never call a Claude-only tool from Codex.

## 1. Scope and mode

For an existing web project or an edit, continue normally without a mode question.
For a new site, ask once: **How should I build this site?**

- **Pro-site (Recommended)** — create a full project, choose among three design
  directions, then build, review phone/tablet/desktop screenshots, and run quality gates.
- **Regular** — build in the current workspace using the usual workflow.

Skip the question if the user already chose a mode. If no question tool is available,
ask in plain text and end the turn; do not scaffold while a required choice is pending.
Regular ends this workflow. If the requested stack conflicts with the Next.js scaffold,
explain that constraint and resolve it before running the script.

## 2. Scaffold and brief

In Codex, ensure the one-time stack is present: run
`bash "<base>/scripts/setup-codex.sh" core` and
`bash "<base>/scripts/setup-codex.sh" skills` if not already set up. These preserve
existing definitions and skills. Do not authenticate optional services merely to
build a local site. For full-stack setup/repair, use `pro-site-setup` if available.

Use the user's destination, otherwise `~/sites/<slug>` (1–3 kebab-case words).
If it exists, pick `-2`, `-3`, etc.; never overwrite it. Run:

```bash
bash "<base>/scripts/new-site.sh" --agent codex "<absolute-project-path>" < /dev/null
```

Substitute `claude` for Claude Code, or `both` when both clients are requested.
Use the host's background execution mechanism if available, retain its task/session
handle, and check completion. While it runs, collect a brief only if missing:
purpose/audience, references (or “surprise me”), and must-have content.
The script needs Node >=22.19 and ~3 GB free disk. On failure, inspect the partial
project and finish the failed steps; rerunning over it is deliberately refused.

## 3. Three directions

Read the installed `frontend-design` skill for the taste layer. Keep the user's
chosen direction and this project's OKLCH contract when applying its guidance.

Propose three divergent directions: name, mood, self-hostable display/text fonts
(never Inter as display), 3–5 OKLCH colors, layout sketch, and one signature motion
moment. Ground them in the brief. Optional inspiration tools are a parts bin.
Ask for a choice or mix and wait. Reuse an explicit prior direction instead of asking
again. After the choice, proceed autonomously within the authorized task; ask only
for missing information that blocks progress or actions requiring new authorization.

## 4. Build and review

Let `P` be the absolute project path. Check scaffold completion, then:

1. Read `P/AGENTS.md`, `P/CLAUDE.md`, and the runtime's project shadcn skill if present.
   Follow generated Next.js guidance (including `node_modules/next/dist/docs/` when
   available). Fill the Design contract in `AGENTS.md` from the chosen direction.
2. Tokens first: `src/styles/theme.css`, Tailwind v4 `@theme`, OKLCH, 1.25 type scale;
   import it from `src/app/globals.css`. Use at most two self-hosted variable fonts
   through `next/font`. For offline builds, use licensed local font files.
3. Build section by section. Use Context7 or current official docs for Next.js,
   Tailwind, GSAP, and Lenis. Use `useGSAP`, `gsap.matchMedia()`, reduced motion, and
   one signature ScrollTrigger moment per page.
   Read relevant installed GSAP skills: `gsap-core`, `gsap-react`, and
   `gsap-scrolltrigger`; add timeline/performance/plugins/utils/framework guidance
   when needed. For optional UX checks, read Bencium's `ACCESSIBILITY.md` and
   `RESPONSIVE-DESIGN.md` from `$CODEX_HOME/pro-site/references/bencium`
   (default `~/.codex/pro-site/references/bencium`) if present, or the original
   `~/.claude/skills/bencium-controlled-ux-designer/` in Claude.
4. Start `npm run dev -- --port 3100` in `P` (choose a free port). Keep its process
   handle. After each section follow [design-review.md](references/design-review.md):
   capture and **open** full/fold screenshots at 375/768/1440, inspect console and
   keyboard behavior, apply concrete fixes. Up to three rounds per section, then
   record unresolved issues. Codex can run `npm run review:capture -- <url> / /about`
   without any browser MCP. A capture is not a design approval until images are read.
5. Subtract pass: remove one unnecessary effect per section.

## 5. Production quality gates

Run all commands in `P`. Use available process tools and stop only servers you started.

1. Run the project's lint command and `npm run build`. Start `npm run start -- --port
   3200` in the background, wait for readiness, then run
   `npm run test:lighthouse -- http://localhost:3200` (Chrome required).
   This saves mobile/desktop reports under `.lighthouse/` and fails if either
   Performance or Accessibility is below 95. Fix, rebuild, restart, and retest.
   After three rounds, report unresolved scores rather than claiming a pass.
2. Capture every route against that production URL with `npm run review:capture --
   http://localhost:3200 / /about`. Review images and `.review/results.json`.
   Console errors, uncaught exceptions, HTTP failures, and overflow fail the command.
3. Add every route to `tests/visual.spec.ts`. Create baselines with
   `npm run test:visual -- --update-snapshots`, inspect them, then run
   `npm run test:visual` without updating snapshots. This builds/serves its own
   production instance on 3300 (`PW_PORT` overrides it) and checks console errors.
4. Stop your dev and production processes. Report any unavailable browser, network,
   credentials, or failed gate accurately. Do not treat missing tools as a pass.

## 6. Handoff

Review `git status`, stage only task-owned changes, and create a local commit when
permitted. If git identity is missing, report it without changing global identity.
Report the path, direction, actual scores, review/screenshot paths, and how to run it:
`cd <project> && npm run dev`. For future edits open that folder with `codex` or
`claude`. Offer deployment through an available provider; deploy only if the user
has authorized it. Preserve an explicit provider choice.
