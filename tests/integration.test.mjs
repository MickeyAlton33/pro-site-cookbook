import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const script = (name) => join(root, 'skills/pro-site/scripts', name);
function temp(t) {
  const dir = mkdtempSync(join(tmpdir(), 'pro-site test '));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function run(command, args, cwd, env = {}, input) {
  return spawnSync(command, args, { cwd, env: { ...process.env, ...env }, encoding: 'utf8', input });
}
function ok(result) { assert.equal(result.status, 0, result.stderr + result.stdout); }
function shim(dir, name, content) {
  writeFileSync(join(dir, name), `#!${process.execPath}\n${content}`, { mode: 0o755 });
}

for (const agent of ['claude', 'codex', 'both']) {
  test(`scaffold ${agent}: preserves instructions and isolates config`, (t) => {
    const dir = temp(t), bin = join(dir, 'bin'), site = join(dir, 'sites with spaces', 'coffee');
    mkdirSync(bin);
    const log = join(dir, 'calls.jsonl');
    shim(bin, 'npx', `
      const fs=require('node:fs'), path=require('node:path');
      const a=process.argv.slice(2); fs.appendFileSync(process.env.CALL_LOG,JSON.stringify(a)+'\\n');
      if(a.includes('create-next-app@16')) {
        const target=a[a.indexOf('create-next-app@16')+1]; fs.mkdirSync(target,{recursive:true});
        fs.writeFileSync(path.join(target,'AGENTS.md'),'Framework sentinel: read bundled Next docs.\\n');
        fs.writeFileSync(path.join(target,'CLAUDE.md'),'Existing Claude sentinel.\\n');
        fs.writeFileSync(path.join(target,'package.json'),'{}');
        fs.writeFileSync(path.join(target,'.gitignore'),'node_modules/\\n');
      }
      if(a.includes('mcp')) fs.writeFileSync('.mcp.json',JSON.stringify({mcpServers:{shadcn:{command:'npx'}}}));
    `);
    shim(bin, 'npm', `require('node:fs').appendFileSync(process.env.CALL_LOG,JSON.stringify(process.argv.slice(2))+'\\n');`);
    const env = {
      PATH: `${bin}:${process.env.PATH}`, CALL_LOG: log,
      GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.com',
      GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.com',
      CODEX_HOME: join(dir, 'untouched-codex-home'),
    };
    ok(run('bash', [script('new-site.sh'), '--agent', agent, site], dir, env));
    const contract = readFileSync(join(site, 'AGENTS.md'), 'utf8');
    assert.ok(contract.includes('Design contract'));
    assert.ok(contract.includes('Framework sentinel'));
    const claude = readFileSync(join(site, 'CLAUDE.md'), 'utf8');
    assert.ok(claude.includes('Existing Claude sentinel'));
    assert.ok(claude.includes('@AGENTS.md'));
    assert.equal(existsSync(join(site, '.mcp.json')), agent !== 'codex');
    assert.equal(existsSync(join(site, '.codex/config.toml')), agent !== 'claude');
    assert.equal(existsSync(env.CODEX_HOME), false);
    for (const file of ['docs/design-review.md', 'scripts/capture-review.mjs', 'scripts/lighthouse.mjs', 'tests/visual.spec.ts', 'playwright.config.ts']) assert.ok(existsSync(join(site, file)), file);
    const calls = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
    const skillAgents = calls.filter((a) => a.includes('skills@1')).map((a) => a[a.indexOf('--agent') + 1]);
    assert.deepEqual(skillAgents, agent === 'both' ? ['claude-code', 'codex'] : [agent === 'claude' ? 'claude-code' : 'codex']);
    const before = readFileSync(log, 'utf8');
    assert.notEqual(run('bash', [script('new-site.sh'), '--agent', agent, site], dir, env).status, 0);
    assert.equal(readFileSync(log, 'utf8'), before, 'existing site must not invoke package managers');
    assert.equal(readFileSync(join(site, 'AGENTS.md'), 'utf8'), contract);
  });
}

test('MCP setup is repeatable, preserves custom servers, and validates before mutation', (t) => {
  const dir = temp(t);
  mkdirSync(join(dir, '.codex'));
  const file = join(dir, '.codex/config.toml');
  const original = 'model = "custom"\n[mcp_servers."figma"]\nurl = "https://example.com/custom"\n';
  writeFileSync(file, original);
  ok(run('bash', [script('add-mcp.sh'), '--agent', 'codex', 'figma', 'playwright', '21st'], dir));
  const once = readFileSync(file, 'utf8');
  assert.ok(once.startsWith(original));
  assert.ok(once.includes('https://21st.dev/api/mcp'));
  ok(run('bash', [script('add-mcp.sh'), '--agent', 'codex', 'figma', 'playwright', '21st'], dir));
  assert.equal(readFileSync(file, 'utf8'), once);
  assert.notEqual(run('bash', [script('add-mcp.sh'), '--agent', 'codex', 'vercel', 'bogus'], dir).status, 0);
  assert.equal(readFileSync(file, 'utf8'), once);
  writeFileSync(file, 'mcp_servers = {}\n');
  assert.notEqual(run(process.execPath, [script('codex-mcp.mjs'), 'figma'], dir).status, 0);
  assert.equal(readFileSync(file, 'utf8'), 'mcp_servers = {}\n');
});

test('standalone installer is repeatable and refuses conflicts', (t) => {
  const dir = temp(t), target = join(dir, 'skills with spaces');
  const installer = join(root, 'scripts/install-codex.sh');
  ok(run('bash', [installer, '--skill', target], dir));
  assert.equal(readlinkSync(join(target, 'pro-site')), resolve(root, 'skills/pro-site'));
  ok(run('bash', [installer, '--skill', target], dir));
  const conflict = join(dir, 'conflict');
  mkdirSync(join(conflict, 'pro-site'), { recursive: true });
  writeFileSync(join(conflict, 'pro-site/keep'), 'do not touch');
  assert.notEqual(run('bash', [installer, '--skill', conflict], dir).status, 0);
  assert.equal(readFileSync(join(conflict, 'pro-site/keep'), 'utf8'), 'do not touch');
});

for (const client of ['claude', 'codex']) {
  test(`${client} hook detects English/Hebrew and ignores edits/non-design requests`, (t) => {
    const dir = temp(t);
    const hook = (prompt, raw) => run(process.execPath, [join(root, 'hooks/detect-new-site.mjs'), '--client', client], dir, {}, raw ?? JSON.stringify({ prompt, cwd: dir }));
    for (const prompt of ['Build a new website for coffee', 'תבנה לי אתר לבית קפה']) {
      const result = hook(prompt); ok(result);
      const output = JSON.parse(result.stdout).hookSpecificOutput;
      assert.equal(output.hookEventName, 'UserPromptSubmit');
      assert.ok(output.additionalContext.includes(client === 'codex' ? 'SKILL.md' : 'Skill tool'));
    }
    for (const prompt of ['Audit website security', 'Build a scraper for a website', 'Create one button', '/pro-site', '']) assert.equal(hook(prompt).stdout, '');
    for (const raw of ['not json', 'null', '[]', '42']) { const result = hook('', raw); ok(result); assert.equal(result.stdout, ''); }
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { next: '16' } }));
    assert.equal(hook('Redesign the website').stdout, '');
  });
}

test('invalid scaffold options create no destination', (t) => {
  const dir = temp(t), site = join(dir, 'site');
  assert.notEqual(run('bash', [script('new-site.sh'), '--agent', 'unknown', site], dir).status, 0);
  assert.equal(existsSync(site), false);
  assert.notEqual(run('bash', [script('new-site.sh'), '--agent'], dir).status, 0);
});

test('full-stack setup separates global core/accounts from project-only services', (t) => {
  const dir = temp(t), configHome = join(dir, 'codex-home'), project = join(dir, 'project');
  const env = { CODEX_HOME: configHome };
  const helper = script('setup-codex.sh');
  mkdirSync(project);
  ok(run('bash', [helper, 'core'], dir, env));
  ok(run('bash', [helper, 'accounts'], dir, env));
  const globalFile = join(configHome, 'config.toml');
  const globalConfig = readFileSync(globalFile, 'utf8');
  for (const name of ['context7', 'playwright', 'chrome-devtools', 'figma', 'vercel', '21st']) assert.ok(globalConfig.includes(`[mcp_servers."${name}"]`));
  for (const name of ['fal', 'webflow', 'framer']) assert.ok(!globalConfig.includes(`[mcp_servers."${name}"]`));
  ok(run('bash', [helper, 'core'], dir, env));
  ok(run('bash', [helper, 'accounts'], dir, env));
  assert.equal(readFileSync(globalFile, 'utf8'), globalConfig);
  ok(run('bash', [helper, 'project', project, 'fal', 'webflow', 'framer'], dir, env));
  assert.equal(readFileSync(globalFile, 'utf8'), globalConfig);
  const projectConfig = readFileSync(join(project, '.codex/config.toml'), 'utf8');
  for (const name of ['fal', 'webflow', 'framer']) assert.ok(projectConfig.includes(`[mcp_servers."${name}"]`));
  assert.notEqual(run('bash', [helper, 'project', join(dir, 'missing'), 'fal'], dir, env).status, 0);
  assert.equal(existsSync(join(dir, 'missing')), false);
});
