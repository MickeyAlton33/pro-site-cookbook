import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const template = new URL('../skills/pro-site/templates/lighthouse.mjs', import.meta.url);
for (const [name, score, runtimeError, expected] of [
  ['passing scores', 0.95, false, 0],
  ['low scores', 0.94, false, 1],
  ['missing scores', null, false, 1],
  ['runtime error despite scores', 1, true, 1],
]) {
  test(`Lighthouse gate: ${name}`, (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'pro-site-lh-'));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    mkdirSync(join(dir, 'scripts'));
    mkdirSync(join(dir, 'node_modules/lighthouse/cli'), { recursive: true });
    copyFileSync(template, join(dir, 'scripts/lighthouse.mjs'));
    writeFileSync(join(dir, 'node_modules/lighthouse/cli/index.js'), `
      const fs=require('node:fs');
      const file=process.argv.find(a=>a.startsWith('--output-path=')).slice('--output-path='.length);
      fs.writeFileSync(file,JSON.stringify({categories:{performance:{score:${score}},accessibility:{score:1}},runtimeError:${runtimeError ? '{message:"navigation failed"}' : 'null'}}));
    `);
    const result = spawnSync(process.execPath, ['scripts/lighthouse.mjs'], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, expected, result.stdout + result.stderr);
    if (!runtimeError) for (const mode of ['mobile', 'desktop']) assert.equal(JSON.parse(readFileSync(join(dir, `.lighthouse/${mode}.json`))).categories.performance.score, score);
  });
}
