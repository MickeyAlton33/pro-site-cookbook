#!/usr/bin/env bash
# Scaffold a Next.js + Tailwind v4 + shadcn + GSAP + Playwright site wired for Claude Code.
# usage: new-site.sh <dir-or-path>          e.g. new-site.sh ~/sites/coffee-roastery
# Flags verified 2026-11-14 against create-next-app 16.4.6, shadcn 4.23.0, skills 1.8.1.
set -euo pipefail
TARGET="${1:?usage: new-site.sh <dir-or-path>}"
TEMPLATES="$(cd "$(dirname "${BASH_SOURCE[0]}")/../templates" && pwd)"

[[ -e "$TARGET" ]] && { echo "ERROR: $TARGET already exists" >&2; exit 1; }
PARENT="$(dirname "$TARGET")"; mkdir -p "$PARENT"
FREE_GB=$(df -g "$PARENT" | awk 'NR==2{print $4}')
(( FREE_GB >= 3 )) || { echo "ERROR: only ${FREE_GB} GB free on disk; need ~3 GB (node_modules + browser)." >&2; exit 1; }

# --import-alias "@/*": shadcn's components.json and the Design contract (@/components/ui) need it.
# --yes: take defaults for anything not passed (React Compiler / Turbopack prompts) so this never blocks.
npx create-next-app@latest "$TARGET" --ts --tailwind --app --eslint --src-dir --use-npm \
  --import-alias "@/*" --yes
cd "$TARGET"

npx shadcn@latest init -d                         # -d = --template=next --preset=base-nova
npx shadcn@latest mcp init --client claude        # writes project .mcp.json
npx skills add shadcn/ui --skill shadcn --agent claude-code --yes || true   # shadcn project-context skill
npm i gsap @gsap/react lenis
npm i -D @playwright/test

# Visual-regression setup (3 review widths, production build).
cp "$TEMPLATES/playwright.config.ts" ./playwright.config.ts
mkdir -p tests && cp "$TEMPLATES/visual.spec.ts" tests/visual.spec.ts
npm pkg set scripts.test:visual="playwright test"
printf '\n# pro-site\n/test-results/\n/playwright-report/\n/.review/\n/.lighthouse/\n' >> .gitignore

# create-next-app 16 writes AGENTS.md (Next's "read node_modules/next/dist/docs first" rules) and no CLAUDE.md.
# Keep the Design contract on top and import AGENTS.md so Claude Code still sees Next's rules.
if [[ -f CLAUDE.md ]]; then
  { cat "$TEMPLATES/CLAUDE.md"; printf '\n\n---\n\n'; cat CLAUDE.md; } > CLAUDE.md.new && mv CLAUDE.md.new CLAUDE.md
else
  cp "$TEMPLATES/CLAUDE.md" ./CLAUDE.md
fi
if [[ -f AGENTS.md ]] && ! grep -q '^@AGENTS.md' CLAUDE.md; then
  printf '\n## Framework rules\n@AGENTS.md\n' >> CLAUDE.md
fi

git add -A && git commit -q -m "Scaffold: Next.js + Tailwind + shadcn + GSAP + Playwright"

# Browser build matching this project's @playwright/test (~200 MB). Last, so a failed download can't block the scaffold.
npx playwright install chromium || echo "WARN: 'npx playwright install chromium' failed (disk space / network?) — rerun it before 'npm run test:visual'."
echo "SCAFFOLD_OK $(pwd)"
