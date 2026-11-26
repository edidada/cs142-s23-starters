'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1050 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const file = name => pathToFileURL(path.resolve('project3', name)).href;
    await page.goto(file('datepicker.html'));
    await page.evaluate(() => {
      window.selections = [];
      window.testPicker = new DatePicker('datepicker1', (id, date) => window.selections.push({id,date}));
    });
    let checkedMonths = 0;
    // Gregorian leap/century/year-boundary coverage, independent UTC weekday oracle.
    for (const year of [1900, 2000, 2009, 2024, 2026, 2100]) {
      for (let month = 0; month < 12; month++) {
        await page.evaluate(({year,month}) => window.testPicker.render(new Date(year,month,15)), {year,month});
        const grid = await page.locator('#datepicker1 tbody').evaluate(body => Array.from(body.rows, row =>
          Array.from(row.cells, cell => ({day:Number(cell.textContent),disabled:cell.firstChild.disabled}))));
        const start = new Date(Date.UTC(year,month,1)).getUTCDay();
        const days = new Date(Date.UTC(year,month+1,0)).getUTCDate();
        assert.equal(grid.length, Math.ceil((start+days)/7));
        assert(grid.every(row => row.length === 7));
        for (let i = 0; i < grid.flat().length; i++) {
          const expected = new Date(Date.UTC(year,month,1-start+i));
          assert.equal(grid.flat()[i].day, expected.getUTCDate());
          assert.equal(grid.flat()[i].disabled, expected.getUTCMonth() !== month);
        }
        checkedMonths++;
      }
    }
    await page.evaluate(() => window.testPicker.render(new Date(2024,1,29)));
    await page.locator('#datepicker1 tbody button:enabled').filter({hasText:/^29$/}).click();
    assert.deepEqual(await page.evaluate(() => window.selections), [{id:'datepicker1',date:{month:2,day:29,year:2024}}]);
    await page.locator('#datepicker1 .outside-month button').first().dispatchEvent('click');
    assert.equal(await page.evaluate(() => window.selections.length),1);
    const second = await page.locator('#datepicker2').innerText();
    await page.evaluate(() => window.testPicker.render(new Date(2026,11,31)));
    await page.getByRole('button',{name:'Next month'}).first().click();
    assert.match(await page.locator('#datepicker1').innerText(), /January 2027/);
    await page.getByRole('button',{name:'Previous month'}).first().click();
    assert.match(await page.locator('#datepicker1').innerText(), /December 2026/);
    assert.equal(await page.locator('#datepicker2').innerText(), second);
    fs.mkdirSync('results',{recursive:true});
    await page.screenshot({path:'results/datepicker.png',fullPage:true});
    await page.goto(file('cs142-test-table.html'));
    for (const id of ['table1','table2','table3']) {
      const contents = await page.locator('#'+id).evaluate(table => Array.from(table.rows,row => Array.from(row.cells,c=>c.textContent)));
      const reference = await page.locator('#'+id+'filled').evaluate(table => Array.from(table.rows,row => Array.from(row.cells,c=>c.textContent)));
      assert.deepEqual(contents,reference);
      assert.equal(await page.locator('#'+id).evaluate(t=>t.style.visibility),'visible');
    }
    const edge = await page.evaluate(() => {
      const table = document.createElement('table'); table.id = 'edge';
      table.innerHTML='<tr><td>{{header}}</td><td>B</td></tr><tr><td>{{value}}</td><td>{{missing}}</td></tr>';
      document.body.appendChild(table);
      TableTemplate.fillIn('edge',{header:'A',value:'<b>safe</b>'},'unknown');
      const untouched = table.rows[1].cells[0].textContent;
      TableTemplate.fillIn('edge',{value:'<b>safe</b>'});
      return {header:table.rows[0].cells[0].textContent,untouched,value:table.rows[1].cells[0].textContent,
        missing:table.rows[1].cells[1].textContent,injected:table.querySelectorAll('b').length};
    });
    assert.deepEqual(edge,{header:'A',untouched:'{{value}}',value:'<b>safe</b>',missing:'',injected:0});
    await page.screenshot({path:'results/tables.png',fullPage:true});
    assert.deepEqual(errors,[]);
    fs.writeFileSync('results/checks.json',JSON.stringify({checkedMonths,originalExampleTables:3,leapSelection:true,
      independentPickers:true,disabledPadding:true,yearNavigation:true,templateEdges:true,pageErrors:errors},null,2));
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exit(1);});
