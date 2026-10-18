import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
process.env.OPENAI_API_KEY = 'offline-regression';
let calls = 0;
globalThis.fetch = async (url, init) => {
  calls++;
  console.log('Intercepted', String(url));
  const body = JSON.parse(String(init?.body));
  assert.equal(body.model, 'gpt-4o');
  return Response.json({id: 'resp-test', object: 'response', created_at: 1, status: 'completed', model: 'gpt-4o', output: [{id: 'msg-test', type: 'message', role: 'assistant', status: 'completed', content: [{type: 'output_text', text: 'Where is the leak? [STATE: needs_clarification, missing: location]', annotations: []}]}], usage: {input_tokens: 5, output_tokens: 10, total_tokens: 15}});
};
const {helpAgent} = await import('../server/mastra/agents/helpAgent');
const result = await helpAgent.generate([{role:'user',content:'My pipe burst'}]);
assert.match(result.text, /needs_clarification/);
assert.equal(calls, 1);
console.log('HelpAgent provider generation passes');
const {updateSettingsTool} = await import('../server/mastra/tools/updateSettingsTool');
const settings = await updateSettingsTool.execute!({emailEnabled:false}, {} as never);
assert.equal(settings.updatedSettings.emailEnabled, false);
const {createWorkflow, createStep} = await import('@mastra/core/workflows');
const {z} = await import('zod');
const step = createStep({id:'offline-probe',inputSchema:z.object({value:z.number()}),outputSchema:z.object({value:z.number()}),execute:async ({inputData})=>({value:inputData.value+1})});
const workflow=createWorkflow({id:'offline-workflow',inputSchema:z.object({value:z.number()}),outputSchema:z.object({value:z.number()})}).then(step).commit();
const run=await workflow.createRun();
const outcome=await run.start({inputData:{value:41}});
assert.equal(outcome.status,'success');
if(outcome.status==='success') assert.equal(outcome.result.value,42);
console.log('Updated settings tool execute and asynchronous workflow createRun/start pass');

const fromMastra = createRequire(import.meta.resolve('@mastra/core'));
const matter = fromMastra('gray-matter');
const document = matter('---\ntitle: Emergency\npriority: 2\n---\nCall a professional.');
assert.deepEqual(document.data, { title: 'Emergency', priority: 2 });
assert.equal(document.content.trim(), 'Call a professional.');
const fromMatter = createRequire(fromMastra.resolve('gray-matter'));
const yamlCli = fromMatter.resolve('js-yaml/bin/js-yaml.js');
for (const args of [[], ['--compact'], ['--to-json']]) {
  const parsed = spawnSync(process.execPath, [yamlCli, ...args], { input: 'title: Emergency\npriority: 2\n', encoding: 'utf8' });
  assert.equal(parsed.status, 0, parsed.stderr);
  assert.deepEqual(JSON.parse(parsed.stdout), { title: 'Emergency', priority: 2 });
}
const invalid = spawnSync(process.execPath, [yamlCli, '--compact'], { input: 'title: [broken', encoding: 'utf8' });
assert.notEqual(invalid.status, 0);
console.log('Mastra frontmatter and YAML CLI parsing/rejection pass with patched parser dependency');
