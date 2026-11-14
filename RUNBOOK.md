# Runbook — Pro website design stack for Claude Code

One-time environment setup. Every command was run and verified on 2026-11-14 (Claude Code 2.1.325, Node 26, macOS). Where the vendor's current docs disagreed with older guides, the vendor wins and the difference is noted.

> **Sign-ins:** `claude mcp login <name>` needs a real terminal (it fails inside a Claude session with "stdin isn't a terminal"). Alternative: `/mcp` → server → *Authenticate* in an interactive session. All servers below support OAuth, so SSO accounts work — no API keys needed.

## Phase 0 — Preflight

```bash
claude --version; node -v; npm -v; git --version   # Node must be ≥ 20
df -h ~                                            # keep several GB free — a full disk breaks downloads (ENOSPC)
claude plugin marketplace list                     # needs claude-plugins-official
# if missing: claude plugin marketplace add anthropics/claude-plugins-official
```

## Phase 1 — Taste layer

```bash
claude plugin install frontend-design@claude-plugins-official
```

Optional, **at most one** extra taste skill. Bencium *Controlled* (WCAG + responsive rules up front) lives in `bencium/bencium-marketplace` at `bencium-controlled-ux-designer/skills/bencium-controlled-ux-designer/` — copy that folder into `~/.claude/skills/`. Its rule is "always ask before design decisions", which fights an autonomous pipeline, so hide it from automatic use and keep it as `/bencium-controlled-ux-designer`:

```jsonc
// ~/.claude/settings.json
"skillOverrides": { "bencium-controlled-ux-designer": "user-invocable-only" }
```

The pro-site skill still reads its `ACCESSIBILITY.md` / `RESPONSIVE-DESIGN.md` directly.

## Phase 2 — Current docs (Context7)

```bash
claude plugin install context7@claude-plugins-official
claude mcp login plugin:context7:context7          # plugin servers are named plugin:<plugin>:<server>
```

API-key alternative: header `Authorization: Bearer <key>` on `https://mcp.context7.com/mcp`. Don't pass it as `--header "...$KEY"` — your shell writes the literal key into `~/.claude.json`, and Claude Code reads credential env vars as empty in remote headers. Use a `headersHelper` command instead.

## Phase 3 — Visual feedback loop

**Chrome DevTools MCP** — use the direct server, not the plugin: the plugin's `.mcp.json` is replaced on every update, so privacy flags don't stick.

```bash
claude mcp add chrome-devtools --scope user -- npx chrome-devtools-mcp@latest \
  --no-usage-statistics --no-performance-crux --isolated
```

(If the `chrome-devtools-mcp@chrome-devtools-plugins` plugin is installed, disable it: `claude plugin disable chrome-devtools-mcp@chrome-devtools-plugins --scope user`.)

**Playwright MCP** (`@playwright/mcp`, not the deprecated `@modelcontextprotocol/server-playwright`):

```bash
claude mcp add playwright --scope user -- npx @playwright/mcp@latest
npx playwright install chromium
```

Verify: `claude mcp list` shows both connected. Note: the DevTools `lighthouse_audit` tool has **no Performance category** — the pipeline uses the Lighthouse CLI on the production build for that.

## Phase 4 — Figma

```bash
claude plugin install figma@claude-plugins-official
claude mcp login plugin:figma:figma
```

Remote server only (`https://mcp.figma.com/mcp`); ignore guides using `127.0.0.1:3845/sse`. Output is capped (~25k tokens): target specific frames, never whole pages.

## Phase 5 — Animation skills (official, GreenSock)

```bash
claude plugin marketplace add greensock/gsap-skills
claude plugin install gsap-skills@gsap-skills
```

Motion, Lenis, Three.js/R3F have no official skills — Context7 covers their current APIs.

## Phase 6 — Optional layers

| Layer | Command | Notes |
|---|---|---|
| Vercel (deploy + logs) | `claude mcp add --scope user --transport http vercel https://mcp.vercel.com` then `claude mcp login vercel` | OAuth. Generally available on all plans (no longer beta). |
| 21st (component inspiration) | `claude mcp add --scope user --transport http 21st https://21st.dev/api/mcp` then `claude mcp login 21st` | OAuth works; or `x-api-key: 21st_sk_…` from 21st.dev/mcp. Free tier: search free, 2 code retrievals/day. Parts bin, not a base. |
| fal (generated imagery) | per project: `add-mcp.sh fal` | Current endpoint `https://mcp.fal.ai/mcp-relay`, OAuth. The older `/mcp` + `Bearer $FAL_KEY` setup is outdated. Pay per run. |
| Webflow | per project: `add-mcp.sh webflow` | `https://mcp.webflow.com/mcp` (not `/sse`). OAuth + Bridge App. |
| Framer | per project: `add-mcp.sh framer` | `https://mcp.framer.com/mcp`, OAuth. |

Keep rarely used servers out of user scope — every user-scope server costs context in every session. `skills/pro-site/scripts/add-mcp.sh` adds them to the current project only.

## Phase 7 — The pro-site plugin

```bash
claude plugin marketplace add MickeyAlton33/pro-site-cookbook
claude plugin install pro-site@pro-site-cookbook
```

This provides the `pro-site` skill (mode question + pipeline), the scaffold script and templates, and the `design-reviewer` agent. Third-party marketplaces don't auto-update; refresh with `claude plugin marketplace update pro-site-cookbook`.

## Phase 8 — Permissions & hygiene

`~/.claude/settings.json` → `permissions.allow`:

```json
["Bash(npx playwright:*)", "Bash(npm run *)", "Bash(npx shadcn@latest:*)", "Bash(npx tsc:*)"]
```

`npm run *` auto-approves any script in any repo you open — narrow it if you clone untrusted code. Don't enable auto-update on third-party marketplaces without deciding to.

## Phase 9 — Verify

```bash
claude mcp list      # chrome-devtools, playwright ✔ connected; context7, figma, vercel, 21st ✔ after login
claude plugin list   # frontend-design, context7, figma, gsap-skills, pro-site enabled
```

Then in a new session: *"Design a landing page for <something>."* → you should get the Regular / Pro-site question.

## Gotchas collected while building this

- **create-next-app 16** dropped `--no-import-alias`; shadcn needs `@/*` anyway. Use `--import-alias "@/*" --yes`.
- **Next.js 16 writes `AGENTS.md`**, not `CLAUDE.md`. The scaffold appends `@AGENTS.md` to `CLAUDE.md` so Claude still loads Next's rules.
- **`npx skills add shadcn/ui`** is interactive; non-interactive form: `--skill shadcn --agent claude-code --yes`.
- **shadcn 4.x installs a `cn` package** (by shadcn, `shadcn-ui/cn`) instead of `clsx` + `tailwind-merge` — expected.
- **Subagent `tools:`** needs `mcp__<server>__*`; a bare `mcp__<server>` grants nothing and can stop the agent from launching.
- **Plugin MCP server names** are `plugin:<plugin>:<server>` — use that in `claude mcp login`.
- **Lighthouse CLI** won't create its output directory — `mkdir -p` first.
- **Playwright baselines**: emulate `reducedMotion: "reduce"` so GSAP settles and screenshots are stable.
