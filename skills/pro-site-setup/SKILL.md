---
name: pro-site-setup
description: Install, inspect, or repair the Pro-site cookbook's Codex tool stack, including MCP configuration, frontend-design and GSAP skills, optional UX references, and provider sign-ins. Use for Pro-site setup or migration, not to build a website.
---

# Pro-site Codex setup

`<base>` is the directory containing this file. The setup helper is
`<base>/../pro-site/scripts/setup-codex.sh`. Use the host shell to run it.

For a requested full setup:

1. Run `bash "<helper>" core` for user-level Context7, Playwright, and Chrome DevTools.
   Run `bash "<helper>" skills` for frontend-design and the eight official GSAP skills.
   Existing definitions/skills are preserved. These commands do not authenticate services.
2. Run `bash "<helper>" accounts` for Figma, Vercel, and 21st when requested or when
   reproducing the full cookbook stack. Then inspect `codex mcp list` and distinguish
   configuration from authentication. Do not copy credentials from Claude.
3. For fal, Webflow, or Framer, configure only a concrete project that needs them:
   `bash "<helper>" project "<project>" fal webflow framer` (select relevant names).
   Do not add these globally just to complete a checklist.
4. Optional Bencium accessibility/responsive guidance:
   `bash "<helper>" bencium`. This downloads only references plus license/provenance,
   keeping its broad "ask before every design decision" workflow out of auto-selection.
5. If the user requests sign-in, run `bash "<helper>" login <server> ...` from the
   intended project. Let the user complete provider consent; never report connected
   without checking. Do not run paid generation or deploy as an installation test.

Verify MCP initialization/tool discovery where possible. `codex mcp list` is a
configuration/auth inventory, not proof that every tool works. Check skill discovery
in a new session and report any untested or authentication-blocked integrations.

Global helpers are for one-time setup. The website scaffold also installs shadcn
and project definitions for a standalone skill install. Project config is loaded
only in a trusted project. MCPs and new skills may require a new session.
