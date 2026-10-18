import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Calendar } from '../client/src/components/ui/calendar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../client/src/components/ui/resizable';
import { Streamdown } from '../client/src/components/ui/streamdown';

const calendar = renderToStaticMarkup(<Calendar mode="single" month={new Date(2026, 9, 1)} selected={new Date(2026, 9, 18)} />);
assert.match(calendar, /October 2026/);
assert.match(calendar, /w-full border-collapse/);
assert.match(calendar, /data-selected-single="true"/);
for (const orientation of ['horizontal', 'vertical'] as const) {
  const panels = renderToStaticMarkup(<ResizablePanelGroup orientation={orientation}>
    <ResizablePanel defaultSize="50%">First</ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize="50%">Second</ResizablePanel>
  </ResizablePanelGroup>);
  assert.match(panels, new RegExp(`data-panel-group-direction="${orientation}"`));
  assert.match(panels, /data-slot="resizable-panel"/);
  assert.match(panels, /data-slot="resizable-handle"/);
}
const markdown = renderToStaticMarkup(<Streamdown mode="static">{'**Preserved markdown**\n\n$$x^2$$\n\n```js\nconst count = 1;\n```\n\n[unsafe](javascript:alert(1))<script>alert(1)</script>'}</Streamdown>);
assert.match(markdown, /data-streamdown="strong">Preserved markdown<\/span>/);
assert.match(markdown, /class="katex"/);
assert.match(markdown, /data-streamdown="code-block"/);
assert.doesNotMatch(markdown, /href="javascript:|<script[\s>]/i);
console.log('Calendar selected-day styling, horizontal/vertical panel adapters, markdown/math/code rendering and unsafe-content rejection passed');
