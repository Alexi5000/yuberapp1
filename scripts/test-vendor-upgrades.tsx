import assert from 'node:assert/strict';
import { parseCookie } from 'cookie';
import OpenAI from 'openai';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { motion, AnimatePresence } from 'framer-motion';

assert.equal(parseCookie('session=first; session=second').session, 'first');
assert.equal(parseCookie('session=encoded%20value').session, 'encoded value');
assert.equal(parseCookie('session=%broken').session, '%broken');
assert.equal(parseCookie('unrelated=value').session, undefined);
assert.equal(parseCookie('__proto__=blocked').__proto__, 'blocked');
assert.equal(({} as Record<string, unknown>).blocked, undefined);

let calls = 0;
const client = new OpenAI({
  apiKey: 'offline-test-only',
  fetch: async (url, init) => {
    calls++;
    assert.equal(String(url), 'https://api.openai.com/v1/chat/completions');
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, 'gpt-4o');
    assert.equal(body.max_tokens, 5);
    return Response.json({ id: 'offline', object: 'chat.completion', created: 1, model: 'gpt-4o', choices: [{ index: 0, message: { role: 'assistant', content: 'Pong' }, finish_reason: 'stop' }] });
  },
});
const response = await client.chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Ping' }], max_tokens: 5 });
assert.equal(response.choices[0]?.message.content, 'Pong');
assert.equal(calls, 1);
const markup = renderToString(<AnimatePresence><motion.div key="job" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Booking confirmed</motion.div></AnimatePresence>);
assert.match(markup, /Booking confirmed/);
assert.match(markup, /opacity:0/);
console.log('Cookie parsing boundaries, OpenAI chat transport, and motion server rendering pass');
