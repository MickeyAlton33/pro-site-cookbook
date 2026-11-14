# Screenshot design review

Read the project's `AGENTS.md` design contract (and any existing `CLAUDE.md`
instructions). Review the running URL and each changed route, not just source code.

1. Capture full-page and above-the-fold screenshots at 375, 768, and 1440 px.
   Use an available browser MCP or `npm run review:capture -- <url> <route> ...`.
   Save images under the project's `.review/` and open them with an image-viewing tool.
2. Check visual hierarchy, spacing rhythm, type scale, contrast, grid alignment,
   originality, motion restraint, and the contract's tokens, fonts, and bans.
   Inspect the browser console and test keyboard navigation. Check normal motion
   as well as reduced motion; still screenshots alone cannot verify animation.
3. Return ranked, concrete fixes as `file:line → CSS/token/markup change`.
4. Return `APPROVED` or `CHANGES REQUIRED` with screenshot paths and any untested
   interactions. Never approve from code alone or invent a browser result.

In Claude Code, use the bundled `pro-site:design-reviewer` agent when available.
In Codex, delegate this review when the host supports delegation and it is permitted;
give the reviewer this checklist, the URL/routes, and the absolute contract path.
Otherwise perform the same review yourself. Label a self-review honestly.
No named Claude agent or particular MCP tool is required in Codex.
