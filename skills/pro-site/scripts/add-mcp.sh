#!/usr/bin/env bash
# Add rarely-used MCP servers to the CURRENT project only, so they don't load (and cost context) everywhere.
#   21st, fal        -> local scope   (personal accounts; stored in ~/.claude.json for this dir, never committed)
#   webflow, framer  -> project scope (.mcp.json, committed; only for client sites built in that tool)
# All four sign in with OAuth (SSO works) — afterwards run, in a real terminal:  claude mcp login <name>
# usage: add-mcp.sh 21st|fal|webflow|framer [...]
# Endpoints verified 2026-11-14 against each vendor's own docs.
set -euo pipefail
[[ $# -gt 0 ]] || { echo "usage: $(basename "$0") 21st|fal|webflow|framer [...]" >&2; exit 2; }
for s in "$@"; do
  case "$s" in
    21st)    claude mcp add -s local   --transport http 21st    https://21st.dev/api/mcp ;;
    fal)     claude mcp add -s local   --transport http fal     https://mcp.fal.ai/mcp-relay ;;
    webflow) claude mcp add -s project --transport http webflow https://mcp.webflow.com/mcp ;;   # + Bridge App
    framer)  claude mcp add -s project --transport http framer  https://mcp.framer.com/mcp ;;
    *) echo "unknown server: $s (expected 21st|fal|webflow|framer)" >&2; exit 2 ;;
  esac
done
echo "Added: $*. Sign in with:  claude mcp login <name>   (in a real terminal), then restart Claude Code here."
