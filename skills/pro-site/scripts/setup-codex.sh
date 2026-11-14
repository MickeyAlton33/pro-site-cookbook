#!/usr/bin/env bash
# One-time Codex equivalents of RUNBOOK.md. Does not copy Claude credentials.
set -euo pipefail
BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
usage() {
  cat <<'USAGE'
usage: setup-codex.sh core|skills|accounts|bencium
       setup-codex.sh project <existing-project> <server> [...]
       setup-codex.sh login <server> [...]
core      Configure user-level Context7, Playwright, Chrome DevTools (no login).
skills    Install missing frontend-design and eight official GSAP skills for Codex.
accounts  Configure user-level Figma, Vercel, 21st; authenticate separately.
bencium   Download optional accessibility/responsive references, not its auto-trigger.
project   Configure any supported MCP in one existing project (e.g. fal webflow framer).
login     Start Codex OAuth for named servers in the current project/user context.
USAGE
}
MODE="${1:---help}"
[[ $# -eq 0 ]] || shift
case "$MODE" in
  core|skills|accounts|bencium) [[ $# -eq 0 ]] || { usage >&2; exit 2; } ;;
  project) [[ $# -ge 2 && -d "$1" ]] || { usage >&2; exit 2; } ;;
  login) [[ $# -gt 0 ]] || { usage >&2; exit 2; } ;;
  --help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac
case "$MODE" in
  core) node "$BASE/scripts/codex-mcp.mjs" --scope user context7 playwright chrome-devtools ;;
  accounts)
    node "$BASE/scripts/codex-mcp.mjs" --scope user figma vercel 21st
    echo 'Definitions installed, not authenticated. Run setup-codex.sh login figma vercel 21st when ready to sign in.'
    ;;
  project)
    cd "$1"; shift
    node "$BASE/scripts/codex-mcp.mjs" "$@"
    ;;
  skills)
    # Preserve existing installs/customizations. Only request missing named skills.
    # npx skills uses ~/.agents/skills; also recognize Codex's legacy location.
    skill_present() {
      [[ -f "$HOME/.agents/skills/$1/SKILL.md" || -f "${CODEX_HOME:-$HOME/.codex}/skills/$1/SKILL.md" ]]
    }
    if ! skill_present frontend-design; then
      npx --yes skills@1 add https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design/skills/frontend-design \
        --skill frontend-design --agent codex --global --yes
    else echo 'Keeping installed frontend-design'; fi
    MISSING=()
    for name in gsap-core gsap-frameworks gsap-performance gsap-plugins gsap-react gsap-scrolltrigger gsap-timeline gsap-utils; do
      if ! skill_present "$name"; then MISSING+=("$name"); fi
    done
    if [[ ${#MISSING[@]} -gt 0 ]]; then
      npx --yes skills@1 add greensock/gsap-skills --skill "${MISSING[@]}" --agent codex --global --yes
    fi
    echo 'Design/animation skills installed or preserved. Start a new Codex session to load them.'
    ;;
  bencium)
    DEST="${CODEX_HOME:-$HOME/.codex}/pro-site/references/bencium"
    if [[ -e "$DEST" || -L "$DEST" ]]; then
      for file in ACCESSIBILITY.md RESPONSIVE-DESIGN.md LICENSE SOURCE.txt; do
        [[ -f "$DEST/$file" ]] || { echo "ERROR: incomplete existing reference cache $DEST; left unchanged" >&2; exit 1; }
      done
      echo "Keeping existing references: $DEST"; exit 0
    fi
    WORK=$(mktemp -d)
    trap 'rm -rf "$WORK"' EXIT
    git clone --quiet --depth 1 https://github.com/bencium/bencium-marketplace.git "$WORK/source"
    SOURCE="$WORK/source/bencium-controlled-ux-designer/skills/bencium-controlled-ux-designer"
    mkdir "$WORK/references"
    cp "$SOURCE/ACCESSIBILITY.md" "$SOURCE/RESPONSIVE-DESIGN.md" "$WORK/source/LICENSE" "$WORK/references/"
    { echo 'https://github.com/bencium/bencium-marketplace'; git -C "$WORK/source" rev-parse HEAD; } > "$WORK/references/SOURCE.txt"
    mkdir -p "$(dirname "$DEST")"
    mv "$WORK/references" "$DEST"
    echo "Installed reference-only Bencium guidance: $DEST (no automatic design-decision prompts)."
    ;;
  login)
    for name in "$@"; do
      case "$name" in figma|vercel|21st|fal|webflow|framer|context7) ;; *) echo "Unsupported OAuth server: $name" >&2; exit 2 ;; esac
    done
    for name in "$@"; do codex mcp login "$name"; done
    ;;
esac
