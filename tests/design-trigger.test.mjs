import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const hook = fileURLToPath(new URL('../hooks/detect-new-site.mjs', import.meta.url));
const reportedPrompt = `❯ Ok so now I want to redisign - "https://supernatural.sh/"
You first need to grab the content , then redisgn, suppoer wow-site, all tricks, animations, 3d etc.. someting state of the art
Do at least 5 options, "engineering vibes" 3d stuff, professional etc..
When done upload all to vercel`;

for (const client of ['claude', 'codex']) {
  for (const existing of [false, true]) {
    test(`${client}: mode hook handles redesigns ${existing ? 'inside' : 'outside'} a web project`, (t) => {
      const cwd = mkdtempSync(join(tmpdir(), 'pro-site-trigger-'));
      t.after(() => rmSync(cwd, { recursive: true, force: true }));
      if (existing) {
        mkdirSync(join(cwd, 'src'));
        writeFileSync(join(cwd, 'package.json'), JSON.stringify({ dependencies: { next: '16' } }));
      }
      const run = (prompt) => {
        const result = spawnSync(process.execPath, [hook, '--client', client], {
          cwd, input: JSON.stringify({ prompt, cwd }), encoding: 'utf8',
        });
        assert.equal(result.status, 0, result.stderr);
        return result.stdout ? JSON.parse(result.stdout) : null;
      };
      for (const prompt of [
        reportedPrompt,
        'Redesign https://supernatural.sh/',
        'Redesign the website',
        'Redesign the website and create a new navbar',
        'Redesign https://supernatural.sh/ and build a new header',
        'Rebuild our landing page from scratch',
        'Scrape the content from https://supernatural.sh/ then redesign it',
        'Scrape the content and build a new website with five options',
        'Create a new website for coffee',
        'תעצב מחדש את האתר https://example.com',
      ]) {
        const result = run(prompt);
        assert.ok(result, `Did not trigger: ${prompt}`);
        assert.equal(result.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
        assert.equal(result.decision, undefined, 'Detection must not block a turn');
        assert.equal(result.continue, undefined, 'Detection must not stop a turn');
      }
      for (const prompt of [
        'Extract the content from https://supernatural.sh/',
        'Design a web scraper for https://example.com',
        'Build a scraper for this website',
        'Audit https://supernatural.sh/ for security vulnerabilities',
        'Fix the footer on our site',
        'Change the website button color',
        'Redesign the header of https://supernatural.sh/',
        'Design an API for https://supernatural.sh/',
        'Deploy this website to Vercel',
        '/help',
      ]) assert.equal(run(prompt), null, `Unexpected trigger: ${prompt}`);
    });
  }
}
