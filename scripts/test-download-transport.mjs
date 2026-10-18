import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { once } from 'node:events';

const require = createRequire(import.meta.url);
const providerRequire = createRequire(require.resolve('@ai-sdk/provider-utils'));
const { Agent, fetch } = providerRequire('undici');
const { fetchWithValidatedRedirects } = await import('@ai-sdk/provider-utils');
assert.match(providerRequire('undici/package.json').version, /^6\./);
const server = createServer((request, response) => {
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify({ method: request.method, path: request.url }));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const dispatcher = new Agent({ connect: { lookup: (_hostname, options, callback) => options.all ? callback(null, [{ address: '127.0.0.1', family: 4 }]) : callback(null, '127.0.0.1', 4) } });
try {
  const response = await fetch(`http://transport.test:${server.address().port}/media`, { dispatcher });
  assert.deepEqual(await response.json(), { method: 'GET', path: '/media' });
  await assert.rejects(fetchWithValidatedRedirects({ url: `http://127.0.0.1:${server.address().port}/media` }));
  let calls = 0;
  await assert.rejects(fetchWithValidatedRedirects({
    url: 'https://public.example/media',
    fetch: async () => {
      calls++;
      return new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data' } });
    },
  }));
  assert.equal(calls, 1);
  console.log('Undici transport and private-target/redirect guards pass');
} finally {
  await dispatcher.close();
  await new Promise(resolve => server.close(resolve));
}

const { diff, clone, patch } = await import('jsondiffpatch');
const initialState = { user: { name: 'Alex' }, jobs: [{ id: 1, done: false }] };
const nextState = { user: { name: 'Alex' }, jobs: [{ id: 1, done: true }, { id: 2, done: false }] };
assert.deepEqual(patch(clone(initialState), diff(initialState, nextState)), nextState);
assert.equal(initialState.jobs[0].done, false);
const target = {};
patch(target, JSON.parse('{"__proto__":[{"polluted":true}]}'));
assert.equal(Object.getPrototypeOf(target), Object.prototype);
assert.equal(target.polluted, undefined);
assert.equal({}.polluted, undefined);
console.log('AI state diff/clone/patch compatibility and prototype guard pass');
