#!/usr/bin/env node
// Audit an already running production server. The caller owns its lifecycle.
import { spawnSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const url = process.argv[2] ?? 'http://localhost:3200';
if (!['http:', 'https:'].includes(new URL(url).protocol)) throw new Error('Expected an HTTP(S) URL');
await mkdir('.lighthouse', { recursive: true });
let failed = false;
for (const mode of ['mobile', 'desktop']) {
  const output = `.lighthouse/${mode}.json`;
  const args = [require.resolve('lighthouse/cli/index.js'), url,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless=new', '--output=json', `--output-path=${output}`, '--quiet'];
  if (mode === 'desktop') args.push('--preset=desktop');
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error || result.status !== 0) throw result.error ?? new Error(`Lighthouse ${mode} failed (${result.status})`);
  const report = JSON.parse(await readFile(output, 'utf8'));
  if (report.runtimeError) throw new Error(report.runtimeError.message);
  const scores = Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, value.score === null ? null : Math.round(value.score * 100)]));
  console.log(`${mode}: ${JSON.stringify(scores)} (${output})`);
  if ((scores.performance ?? 0) < 95 || (scores.accessibility ?? 0) < 95) failed = true;
}
if (failed) { console.error('Quality gate failed: Performance and Accessibility must each reach 95 on both profiles.'); process.exitCode = 1; }
