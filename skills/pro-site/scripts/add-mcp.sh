#!/usr/bin/env bash
# Claude defaults preserved. Codex writes only the current project's .codex/config.toml.
set -euo pipefail
AGENT=claude
if [[ "${1:-}" == --agent ]]; then AGENT="${2:-}"; shift; [[ $# -gt 0 ]] && shift; fi
[[ $# -gt 0 ]] || { echo 'usage: add-mcp.sh [--agent claude|codex] <server> [...]' >&2; exit 2; }
case "$AGENT" in
  codex) exec node "$(dirname "${BASH_SOURCE[0]}")/codex-mcp.mjs" "$@" ;;
  claude)
    for s in "$@"; do
      case "$s" in 21st|fal|webflow|framer) ;; *) echo "unknown server: $s (expected 21st|fal|webflow|framer)" >&2; exit 2 ;; esac
    done
    for s in "$@"; do
      case "$s" in
        21st) claude mcp add -s local --transport http 21st https://21st.dev/api/mcp ;;
        fal) claude mcp add -s local --transport http fal https://mcp.fal.ai/mcp-relay ;;
        webflow) claude mcp add -s project --transport http webflow https://mcp.webflow.com/mcp ;;
        framer) claude mcp add -s project --transport http framer https://mcp.framer.com/mcp ;;
      esac
    done
    echo "Added: $*. Authenticate with 'claude mcp login <name>', then restart Claude Code here."
    ;;
  *) echo "unknown agent: $AGENT (expected claude|codex)" >&2; exit 2 ;;
esac
