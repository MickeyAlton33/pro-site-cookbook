---
name: pro-site
description: Ask Regular/default or Pro-site before building a new website or substantially redesigning an existing site or live URL, including requests to capture content and make multiple animated/3D design options. Pro-site runs the design, build, screenshot-review, and production-quality workflow in Claude Code or Codex. Excludes small fixes, individual components, in-app dashboards, and content-extraction-only tasks.
---

# Pro-site

Use this workflow before other design skills for a new-site or substantial redesign request. Preserve
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

For small edits, bug fixes, individual components, extraction/analysis without
design work, or quoted design examples in a troubleshooting/setup task, continue
normally. For a new site or substantial site/landing-page
redesign, **including an existing URL or project**, ask once before fetching source
content, scaffolding, or starting design work:

**How should I build this site — Regular (default) or Pro-site?**

- **Pro-site (Recommended)** — use the art-directed workflow: design directions,
  build, phone/tablet/desktop screenshot review, and production quality gates.
- **Regular** — build in the current workspace using the usual workflow.

Skip the question only if the user explicitly chose Regular/default or Pro-site for
this task, including a choice in an earlier turn. Invoking this skill by name,
requesting a "wow"/professional site, 3D, animations, five options, or Vercel deployment
does **not** choose a mode. Do not silently choose Pro-site from the requested polish.
If no suitable question tool is available, ask in plain text and end the turn. If
the host offers an asynchronous question tool, leave dependent work pending until
the answer arrives. Do not treat a missing answer as authorization to choose.
Regular ends this workflow. If the requested stack conflicts with the Next.js scaffold,
explain that constraint and resolve it before running the script.

## 2. Scaffold and brief

In Codex, ensure the one-time stack is present: run
`bash "<base>/scripts/setup-codex.sh" core` and
`bash "<base>/scripts/setup-codex.sh" skills` if not already set up. These preserve
existing definitions and skills. Do not authenticate optional services merely to
build a local site. For full-stack setup/repair, use `pro-site-setup` if available.

For a redesign, capture the supplied site's content and relevant assets after the
mode choice, preserving the brief's content and credit/source URLs. If the user
wants the existing project redesigned in place, inspect it and use its stack;
skip the new-project scaffold, preserve its instructions, and adapt the review/gates
to it. Do not overwrite an existing contract or source tree.

For a new project or separate redesign variants, use the user's destination,
otherwise `~/sites/<slug>` (1–3 kebab-case words).
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

## 3. Design directions and requested variants

Read the installed `frontend-design` skill for the taste layer. Keep the user's
chosen direction and this project's OKLCH contract when applying its guidance.

Default to three divergent directions, or use the user's requested count (e.g. at
least five means five or more, never three). For each: name, mood, self-hostable display/text fonts
(never Inter as display), 3–5 OKLCH colors, layout sketch, and one signature motion
moment. Ground them in the brief. Optional inspiration tools are a parts bin.
For a single final design, ask for a choice or mix and wait. If the user explicitly
asks to build/deploy **all** options, build all of the requested variants after the
mode choice; do not require a single winner. Reuse an explicit prior direction.
Preserve requests for 3D and motion; choose appropriate libraries such as Three.js
or R3F when needed and apply the same accessibility/performance gates. Cookbook
defaults do not prohibit an explicitly requested technique.
Proceed autonomously within the authorized task after the required choice; ask only
for missing information that blocks progress or actions requiring new authorization.

## 4. Build and review

Let `P` be the absolute project path. Check scaffold completion (or the existing
project for an in-place redesign), then apply the following to each requested variant:

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
`claude`. If deployment is already authorized (e.g. "upload all to Vercel"), deploy
the requested variants to that provider after checks and report their URLs; do not
ask for the same authorization again. Otherwise offer deployment. Provider login
or access problems remain real blockers and must be reported.
