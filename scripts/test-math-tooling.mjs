import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import { context } from 'esbuild';

const processor = unified().use(remarkParse).use(remarkMath).use(remarkRehype).use(rehypeKatex);
const html = JSON.stringify(await processor.run(processor.parse('Inline $x^2$\n\n$$\n\\frac{a}{b}\n$$')));
assert.match(html, /"katex"/);
assert.match(html, /katex-display/);
assert.match(html, /"math"/);
const unsafe = JSON.stringify(await processor.run(processor.parse('$\\href{javascript:alert(1)}{click}$')));
assert.doesNotMatch(unsafe, /"href":"javascript:/);

const directory = await mkdtemp(join(tmpdir(), 'yuber-tooling-'));
let server;
try {
  const require = createRequire(import.meta.url);
  const coreUtils = require.resolve('@esbuild-kit/core-utils');
  const esmLoader = require.resolve('@esbuild-kit/esm-loader');
  const fixture = join(directory, 'fixture.ts');
  await writeFile(fixture, 'const answer: number = 42; console.log(answer);');
  const result = execFileSync(process.execPath, ['--loader', esmLoader, fixture], { encoding: 'utf8' });
  assert.match(result, /42/);
  assert.ok(coreUtils);
  const config = join(directory, 'drizzle.config.ts');
  await writeFile(config, `export default {schema: ${JSON.stringify(resolve('drizzle/schema.ts'))}, out: ${JSON.stringify(join(directory, 'migrations'))}, dialect: 'turso'};`);
  execFileSync(process.execPath, [resolve('node_modules/drizzle-kit/bin.cjs'), 'generate', `--config=${config}`], { encoding: 'utf8' });
  const files = await readdir(join(directory, 'migrations'));
  const sql = await readFile(join(directory, 'migrations', files.find((file) => file.endsWith('.sql'))), 'utf8');
  assert.match(sql, /CREATE TABLE `users`/);
  assert.match(sql, /CREATE TABLE `bookings`/);
  server = await context({ stdin: { contents: 'console.log(42)' }, write: false });
  const { port } = await server.serve({ host: '127.0.0.1', port: 0, servedir: directory });
  const denied = await fetch(`http://127.0.0.1:${port}/fixture.ts`, { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  console.log('Math rendering, unsafe URL rejection, legacy TS loader, Drizzle schema generation and cross-origin serve protections passed');
} finally {
  await server?.dispose();
  await rm(directory, { recursive: true, force: true });
}
