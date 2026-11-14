# Project CLAUDE.md

## Design contract (non-negotiable) — fill in before any UI code
- Direction: "<name the aesthetic>" — references: <3 URLs / Figma frame links>
- Tokens: ONLY variables from src/styles/theme.css (Tailwind v4 @theme, OKLCH). No raw hex, no ad-hoc spacing.
- Type: Display = <font>, Text = <font>; modular scale 1.25; max 2 families; self-hosted variable fonts.
- Icons: <Lucide | Phosphor> only.
- Layout: 12-col grid; asymmetric compositions allowed; no centered-card-grid sections by default.
- Motion: GSAP only; ONE signature ScrollTrigger moment per page; everything respects prefers-reduced-motion (gsap.matchMedia).
- Components: shadcn primitives from @/components/ui, custom composition on top. Allowed registries: @shadcn <+ others>.
- Banned: purple-blue gradients, glassmorphism cards, emoji icons, generic "Trusted by" logo strips, stock 3D blobs, Inter-as-display.

## Workflow rules
1. Before any code on a new page: propose 3 divergent directions (mood, type pairing, layout sketch). Wait for my pick.
2. Tokens first (theme.css), then build section by section.
3. After each section: run the `pro-site:design-reviewer` subagent and apply its fixes until APPROVED.
4. Final "subtract" pass: remove one effect per section.
5. Use Context7 for current Next.js / Tailwind v4 / Motion / R3F APIs — don't rely on memory.

## Definition of done
- design-reviewer APPROVED at 375/768/1440
- Lighthouse ≥ 95 Performance and Accessibility on the production build (Lighthouse CLI, mobile + desktop); LCP/CLS/INP in green
- Zero console errors (Chrome DevTools MCP)
- Playwright visual-regression baselines committed (`npm run test:visual`)
