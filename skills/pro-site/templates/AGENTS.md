# Project instructions — Claude Code and Codex

## Design contract (non-negotiable) — fill in before any UI code
The user's explicit brief and chosen mode take precedence over cookbook defaults
(including the number of variants, requested 3D techniques, and deployment scope).
- Direction: "<name the aesthetic>" — references: <3 URLs / Figma frame links>
- Tokens: ONLY variables from src/styles/theme.css (Tailwind v4 @theme, OKLCH). No raw hex, no ad-hoc spacing.
- Type: Display = <font>, Text = <font>; modular scale 1.25; max 2 families; self-hosted variable fonts.
- Icons: <Lucide | Phosphor> only.
- Layout: 12-col grid; asymmetric compositions allowed; no centered-card-grid sections by default.
- Motion: GSAP only; ONE signature ScrollTrigger moment per page; everything respects prefers-reduced-motion (gsap.matchMedia).
- Components: shadcn primitives from @/components/ui, custom composition on top. Allowed registries: @shadcn <+ others>.
- Banned: purple-blue gradients, glassmorphism cards, emoji icons, generic "Trusted by" logo strips, stock 3D blobs, Inter-as-display.

## Workflow rules
1. For a new visual identity or substantial redesign, use the agreed number of directions (default 3). Wait for a pick only when one final design is requested; build all variants if the user requested all. Reuse an already chosen direction for later pages and edits.
2. Tokens first (theme.css), then build section by section.
3. After each section: follow `docs/design-review.md`. Use the Claude `pro-site:design-reviewer` agent or a permitted Codex reviewer when available; otherwise review screenshots yourself. Apply fixes (max 3 rounds per section); report any unresolved issues.
4. Final "subtract" pass: remove one effect per section.
5. Use Context7 or official documentation for current Next.js / Tailwind v4 / GSAP / Lenis APIs. Follow generated framework guidance below as well.

## Definition of done
- Screenshot review APPROVED at 375/768/1440 (identify whether delegated or self-reviewed)
- Lighthouse ≥ 95 Performance and Accessibility on the production build, mobile + desktop (`npm run test:lighthouse`). Report lab metrics; Lighthouse alone does not establish field INP.
- Zero browser console errors and uncaught exceptions (browser MCP or Playwright)
- Review and commit Playwright baselines (`npm run test:visual -- --update-snapshots`), then verify with `npm run test:visual` without updating them
- Report actual results and remaining failures. Publishing or deploying requires the user's authorization.
