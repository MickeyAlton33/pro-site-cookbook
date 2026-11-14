# pro-site-cookbook

A **Claude Code plugin and Codex plugin/skill** for building art-directed websites
without doing the project setup yourself.

Ask for a brand-new site and choose **Pro-site** or **Regular**. Pro-site creates
`~/sites/<name>` (or your chosen destination), scaffolds Next.js + Tailwind v4 +
shadcn + GSAP + Playwright, and drives the workflow:

```text
brief → three directions → you pick one
  → shared Design contract + OKLCH tokens → build section by section
  → screenshot review at 375 / 768 / 1440 → fix and review
  → production Lighthouse · console checks · visual regression
  → local commit → offer deployment
```

An existing mode/direction choice is respected. Regular uses the usual workflow.
Edits to existing sites, single components, and in-app UI skip the mode question.

## Codex

Install from GitHub with a current Codex CLI:

```bash
codex plugin marketplace add MickeyAlton33/pro-site-cookbook
codex plugin add pro-site@pro-site-cookbook
```

Then run the plugin's setup skill: `$pro-site:pro-site-setup Set up the Pro-site tool stack.`

Or install from a local checkout:

```bash
git clone https://github.com/MickeyAlton33/pro-site-cookbook.git
cd pro-site-cookbook
bash scripts/install-codex.sh
```

The local installer also configures Context7, Playwright, and Chrome DevTools for
Codex and installs missing frontend-design and official GSAP skills. Account-backed
services have separate setup/sign-in steps; see the full stack table below.

Start a new Codex session and ask:

```text
$pro-site:pro-site Design a landing page for my coffee roastery.
```

The plugin includes a new-site detection hook for English and Hebrew. Codex requires
review/trust before running plugin hooks; the skill also works through explicit
invocation or normal skill selection without the hook. For the IDE extension or
clients without plugin support, use `bash scripts/install-codex.sh --skill` instead.
Choose one installation method to avoid duplicate skills.

See **[Codex setup and verification](docs/CODEX.md)** for MCPs, updates, project
trust, standalone installs, and the full smoke test.

### Full original stack in Codex

| Original layer | Codex equivalent |
|---|---|
| frontend-design | Original Anthropic skill, installed for Codex |
| GreenSock skills | All eight official GSAP skills, installed for Codex |
| Context7, Playwright, Chrome DevTools | `setup-codex.sh core`; user-level MCPs, no provider sign-in |
| Figma, Vercel, 21st | `setup-codex.sh accounts`, then separate Codex OAuth |
| fal, Webflow, Framer | `setup-codex.sh project <path> <servers...>`; project-only, then provider setup/sign-in |
| Bencium accessibility/responsive guidance | `setup-codex.sh bencium`; reference-only download with license |
| shadcn | Project MCP + project skill from the scaffold |
| Lighthouse and visual regression | Generated CLI scripts and Playwright tests |

Here `setup-codex.sh` lives in `skills/pro-site/scripts/`. Configuration alone is not
a connection test; Claude sign-ins are not copied into Codex. The setup skill reports
which services still need authentication. Optional services are not used or billed
just to verify installation.

## Claude Code

Set up optional tools using **[RUNBOOK.md](RUNBOOK.md)**, then:

```bash
claude plugin marketplace add MickeyAlton33/pro-site-cookbook
claude plugin install pro-site@pro-site-cookbook
```

Restart Claude Code and ask: “Design a landing page for my coffee roastery.”
The existing Claude hook and `pro-site:design-reviewer` agent remain available.

## Shared project workflow

```bash
# Direct scaffold; omit --agent to preserve the original Claude default.
bash skills/pro-site/scripts/new-site.sh --agent codex ~/sites/coffee-roastery
# --agent both configures both clients.
```

Every project gets one **`AGENTS.md` Design contract** and a `CLAUDE.md` that imports
it. Generated Next.js instructions are preserved. The contract covers OKLCH tokens,
two self-hosted variable fonts, a 1.25 type scale, a 12-column grid, reduced motion,
one signature ScrollTrigger moment, shadcn composition, and the original design bans.

Codex receives project-local `.codex/config.toml` entries for shadcn, Context7, and
Playwright. Claude receives its shadcn `.mcp.json`. Neither scaffold changes Codex's
user configuration. Browser MCPs are optional: generated CLI scripts capture review
images, check console errors, run Lighthouse, and verify visual baselines.

| Project command | Purpose |
|---|---|
| `npm run dev` | Develop the site |
| `npm run review:capture -- http://localhost:3100 / /about` | Full/fold images at three widths; HTTP, overflow, and console checks |
| `npm run build` then `npm run start -- --port 3200` | Serve production output |
| `npm run test:lighthouse -- http://localhost:3200` | Mobile/desktop reports; fails below 95 Performance or Accessibility |
| `npm run test:visual -- --update-snapshots` | Create baselines for routes in `tests/visual.spec.ts` |
| `npm run test:visual` | Verify reviewed baselines against its own production server |

Screenshot capture is followed by actual image inspection, using an available
reviewer or an explicitly identified self-review. Missing tools and failed quality
gates are reported; they are never treated as a pass. Deployment is offered after
local validation and happens only when authorized.

## Repository layout

```text
.claude-plugin/              Claude plugin and marketplace
.codex-plugin/              Codex plugin manifest
.agents/plugins/            Codex marketplace
hooks/                      Shared detector, client-specific hook definitions
skills/pro-site/
  SKILL.md                  Shared workflow, client tool mapping
  agents/openai.yaml        Codex skill metadata
  references/design-review.md
  scripts/                  Scaffold and project MCP setup
  templates/                AGENTS.md, CLAUDE.md, browser/Lighthouse checks
agents/design-reviewer.md    Claude reviewer
scripts/install-codex.sh     Plugin or standalone skill installation
tests/                     Offline integration/regression tests
```

## Requirements and checks

macOS or Linux; Node **>=22.19** (a current LTS is recommended), npm, git, Claude Code
or Codex, internet for dependencies, and ~3 GB disk per site. Lighthouse needs Chrome
or `CHROME_PATH`; Playwright downloads its own Chromium. Linux may also need
`npx playwright install --with-deps chromium`.

Run repository checks with `node --test tests/*.test.mjs`. CI exercises the shared
scaffold and both client paths on Linux and macOS using isolated command fixtures.
The real scaffold/build/browser smoke procedure is in [docs/CODEX.md](docs/CODEX.md).

## License

MIT
