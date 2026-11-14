#!/usr/bin/env node
// Project scope by default. User scope must be selected explicitly. No OAuth tokens.
import { existsSync, mkdirSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const servers = {
  shadcn: { command: "npx", args: ["-y", "shadcn@4", "mcp"] },
  context7: { command: "npx", args: ["-y", "@upstash/context7-mcp"] },
  playwright: { command: "npx", args: ["-y", "@playwright/mcp@latest", "--headless", "--isolated"] },
  "chrome-devtools": { command: "npx", args: ["-y", "chrome-devtools-mcp@latest", "--no-usage-statistics", "--no-performance-crux", "--isolated", "--headless"] },
  figma: { url: "https://mcp.figma.com/mcp" },
  vercel: { url: "https://mcp.vercel.com" },
  "21st": { url: "https://21st.dev/api/mcp" },
  fal: { url: "https://mcp.fal.ai/mcp-relay" },
  webflow: { url: "https://mcp.webflow.com/mcp" },
  framer: { url: "https://mcp.framer.com/mcp" },
};

const args = process.argv.slice(2);
let scope = "project";
if (args[0] === "--scope") { args.shift(); scope = args.shift(); }
if (!["project", "user"].includes(scope)) { console.error("Expected --scope project|user"); process.exit(2); }
const names = [...new Set(args)];
if (!names.length || names.some((name) => !Object.hasOwn(servers, name))) {
  console.error(`usage: codex-mcp.mjs ${Object.keys(servers).join("|")} [...]`);
  process.exit(2);
}
const dir = scope === "user" ? (process.env.CODEX_HOME || join(homedir(), ".codex")) : join(process.cwd(), ".codex");
const file = join(dir, "config.toml");
const existing = existsSync(file) ? readFileSync(file, "utf8") : "";
// A hand-written inline mcp_servers table needs a TOML-aware manual merge.
if (/^\s*mcp_servers\s*=/m.test(existing) || /^\s*\[\s*mcp_servers\s*\]/m.test(existing)) {
  console.error("Existing inline or parent mcp_servers table: merge servers manually; config left unchanged.");
  process.exit(1);
}
let additions = "";
for (const name of names) {
  const defined = new RegExp(`^\\s*\\[\\s*mcp_servers\\s*\\.\\s*(?:${name}|"${name}"|'${name}')\\s*(?:\\]|\\.)`, "m");
  if (defined.test(existing)) {
    console.log(`Keeping existing MCP server: ${name}`);
    continue;
  }
  additions += `\n[mcp_servers.${JSON.stringify(name)}]\n`;
  for (const [key, value] of Object.entries(servers[name])) additions += `${key} = ${JSON.stringify(value)}\n`;
  additions += "startup_timeout_sec = 60\n";
}
if (additions) {
  mkdirSync(dir, { recursive: true });
  appendFileSync(file, additions);
}
console.log(`Codex ${scope} MCP definitions ready in ${file}. Start a new session; project config requires project trust. HTTP services still need separate authentication.`);
