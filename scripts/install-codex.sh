#!/usr/bin/env bash
# Install from this checkout. No config overwrite and no automatic hook trust.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
case "${1:-}" in
  '')
    command -v codex >/dev/null || { echo 'Install Codex first, or use --skill for standalone discovery.' >&2; exit 1; }
    codex plugin marketplace add "$ROOT"
    codex plugin add pro-site@pro-site-cookbook
    bash "$ROOT/skills/pro-site/scripts/setup-codex.sh" core
    bash "$ROOT/skills/pro-site/scripts/setup-codex.sh" skills
    echo 'Installed. Start a new Codex session and use $pro-site:pro-site. Review/trust the optional detection hook in Codex to enable it.'
    ;;
  --skill)
    [[ $# -le 2 ]] || { echo 'usage: install-codex.sh --skill [skills-directory]' >&2; exit 2; }
    DEST="${2:-$HOME/.agents/skills}"
    mkdir -p "$DEST"
    if [[ -L "$DEST/pro-site" && "$(readlink "$DEST/pro-site")" == "$ROOT/skills/pro-site" ]]; then
      echo "Already installed: $DEST/pro-site"
    elif [[ -e "$DEST/pro-site" || -L "$DEST/pro-site" ]]; then
      echo "ERROR: $DEST/pro-site exists; left unchanged. Choose a different skills directory or resolve it manually." >&2
      exit 1
    else
      ln -s "$ROOT/skills/pro-site" "$DEST/pro-site"
      echo "Installed standalone skill: $DEST/pro-site. Keep this checkout; restart Codex if needed."
    fi
    ;;
  --help) echo 'usage: install-codex.sh [--skill [skills-directory]]' ;;
  *) echo 'usage: install-codex.sh [--skill [skills-directory]]' >&2; exit 2 ;;
esac
