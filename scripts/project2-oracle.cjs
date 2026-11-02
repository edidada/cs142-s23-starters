"use strict";
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({console});
context.window = context;
for (const file of ['cs142-make-multi-filter.js', 'cs142-template-processor.js']) {
  vm.runInContext(fs.readFileSync(`project2/${file}`, 'utf8'), context);
}
const original = [0, 1, 2, 3, 4];
const filter = context.cs142MakeMultiFilter(original);
let calls = 0;
assert.equal(filter(x => x % 2 === 0, function (result) {
  assert.equal(this, original);
  assert.deepEqual(Array.from(result), [0, 2, 4]);
  calls++;
}), filter);
assert.equal(calls, 1);
assert.deepEqual(Array.from(filter(x => x > 0)()), [2, 4]);
assert.deepEqual(original, [0, 1, 2, 3, 4]);
assert.deepEqual(Array.from(context.cs142MakeMultiFilter([9])()), [9]);
assert.deepEqual(Array.from(filter(null, () => assert.fail('unexpected callback'))), [2, 4]);
const template = new context.Cs142TemplateProcessor('{{x}}|{{x}}|{{zero}}|{{no}}|{{none}}');
assert.equal(template.fillIn({x: '$&', zero: 0, no: false}), '$&|$&|0|false|');
assert.equal(template.fillIn({x: 'next'}), 'next|next|||');
const before = new Set(Object.keys(context));
vm.runInContext(fs.readFileSync('project2/cs142-test-project2.js', 'utf8'), context);
const additions = Object.keys(context).filter(k => !before.has(k)).sort();
assert.deepEqual(additions, ['cs142Project2Results', 'onload']);
assert.deepEqual(JSON.parse(JSON.stringify(context.cs142Project2Results)),
  {p1Message: 'SUCCESS', p2Message: 'SUCCESS', p3Message: 'SUCCESS'});
console.log('Callback binding, independent closures, repeated templates, and global isolation passed');
