#!/usr/bin/env bash
# Scaffold a site for Claude Code, Codex, or both. Defaults preserve Claude callers.
set -euo pipefail
usage() { echo 'usage: new-site.sh [--agent claude|codex|both] <dir-or-path>'; }
AGENT=claude
if [[ "${1:-}" == --help ]]; then usage; exit 0; fi
if [[ "${1:-}" == --agent ]]; then AGENT="${2:-}"; shift; [[ $# -gt 0 ]] && shift; fi
case "$AGENT" in claude|codex|both) ;; *) usage >&2; exit 2 ;; esac
[[ $# == 1 && -n "$1" && "$1" != -* ]] || { usage >&2; exit 2; }
TARGET="$1"
BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES="$BASE/templates"
for command in node npm npx git; do
  command -v "$command" >/dev/null || { echo "ERROR: missing $command" >&2; exit 1; }
done
node -e 'const [major,minor]=process.versions.node.split(".").map(Number); if (major<22 || (major===22 && minor<19)) { console.error("ERROR: Node >=22.19 required"); process.exit(1); }'
[[ ! -e "$TARGET" && ! -L "$TARGET" ]] || { echo "ERROR: $TARGET already exists" >&2; exit 1; }
PARENT="$(dirname "$TARGET")"
mkdir -p "$PARENT"
# POSIX 1K blocks work on Linux and macOS (df -g is BSD-only).
FREE_KB=$(df -Pk "$PARENT" | awk 'NR==2{print $4}')
[[ "$FREE_KB" =~ ^[0-9]+$ ]] && (( FREE_KB >= 3 * 1024 * 1024 )) || {
  echo 'ERROR: need ~3 GB free disk space (node_modules + browser).' >&2; exit 1;
}
TARGET="$(cd "$PARENT" && pwd)/$(basename "$TARGET")"
trap 'echo "ERROR: scaffold incomplete at $TARGET. Inspect the error and finish missing steps there; the script never overwrites an existing directory." >&2' ERR

# Pin compatible major versions; the generated package-lock.json pins exact installs.
npx --yes create-next-app@16 "$TARGET" --ts --tailwind --app --eslint --src-dir --use-npm \
  --import-alias "@/*" --yes
cd "$TARGET"
npx --yes shadcn@4 init -d
if [[ "$AGENT" == claude || "$AGENT" == both ]]; then
  npx --yes shadcn@4 mcp init --client claude
  npx --yes skills@1 add shadcn/ui --skill shadcn --agent claude-code --yes || echo 'WARN: shadcn skill install failed; use the shadcn CLI/docs.' >&2
fi
if [[ "$AGENT" == codex || "$AGENT" == both ]]; then
  node "$BASE/scripts/codex-mcp.mjs" shadcn context7 playwright
  npx --yes skills@1 add shadcn/ui --skill shadcn --agent codex --yes || echo 'WARN: shadcn skill install failed; use the shadcn CLI/docs.' >&2
fi
npm i gsap @gsap/react lenis
npm i -D @playwright/test lighthouse@13

cp "$TEMPLATES/playwright.config.ts" ./playwright.config.ts
mkdir -p tests scripts docs
cp "$TEMPLATES/visual.spec.ts" tests/visual.spec.ts
cp "$TEMPLATES/capture-review.mjs" scripts/capture-review.mjs
cp "$TEMPLATES/lighthouse.mjs" scripts/lighthouse.mjs
cp "$BASE/references/design-review.md" docs/design-review.md
npm pkg set scripts.test:visual="playwright test" scripts.review:capture="node scripts/capture-review.mjs" scripts.test:lighthouse="node scripts/lighthouse.mjs"
printf '\n# pro-site\n/test-results/\n/playwright-report/\n/.review/\n/.lighthouse/\n' >> .gitignore

# AGENTS.md is the single design contract. Preserve generated framework guidance.
if [[ -f AGENTS.md ]]; then
  { cat "$TEMPLATES/AGENTS.md"; printf '\n\n---\n\n'; cat AGENTS.md; } > AGENTS.md.new
  mv AGENTS.md.new AGENTS.md
else
  cp "$TEMPLATES/AGENTS.md" ./AGENTS.md
fi
# Preserve any existing Claude instructions; import the contract without a cycle.
if [[ -f CLAUDE.md ]]; then
  if ! grep -q '^@AGENTS.md' CLAUDE.md; then printf '\n## Project contract and framework rules\n@AGENTS.md\n' >> CLAUDE.md; fi
else
  cp "$TEMPLATES/CLAUDE.md" ./CLAUDE.md
fi

# Some parent workspaces suppress create-next-app's automatic git init.
[[ -d .git ]] || git init -q
if ! git add -A || ! git commit -q -m 'Scaffold: Next.js + Tailwind + shadcn + GSAP + Playwright'; then
  echo 'WARN: scaffold created but not committed. Configure git author identity and commit locally.' >&2
fi
npx playwright install chromium || echo "WARN: browser download failed; rerun 'npx playwright install chromium' before browser checks." >&2
echo "SCAFFOLD_OK $(pwd) (agent=$AGENT)"
