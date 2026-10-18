import assert from 'node:assert/strict';
import { mock } from 'bun:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as recharts from 'recharts';

mock.module('recharts', () => ({
  ...recharts,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
}));
const { ChartContainer, ChartTooltipContent, ChartLegendContent } = await import('../client/src/components/ui/chart');
const config = { jobs: { label: 'Completed jobs', color: '#123456' } };
const payload = [{ name: 'jobs', dataKey: 'jobs', value: 0, color: '#123456' }];
const render = (child: React.ReactElement) => renderToStaticMarkup(<ChartContainer config={config}>{child}</ChartContainer>);
const html = render(<ChartTooltipContent active payload={payload} />);
assert.match(html, /Completed jobs/);
assert.match(html, />0<\/span>/);
let formatterPayload: unknown;
render(<ChartTooltipContent active payload={payload} formatter={(value, name, item, index, entries) => {
  assert.equal(value, 0);
  assert.equal(name, 'jobs');
  assert.equal(item.dataKey, 'jobs');
  assert.equal(index, 0);
  formatterPayload = entries;
  return 'formatted';
}} />);
assert.deepEqual(formatterPayload, payload);
assert.match(render(<ChartLegendContent payload={[{ value: 'jobs', dataKey: 'jobs', color: '#123456' }]} />), /Completed jobs/);
assert.doesNotMatch(render(<ChartTooltipContent active={false} payload={payload} />), /Completed jobs/);
console.log('Chart adapters: zero value, missing nested payload, formatter entries, legend, inactive tooltip passed');
