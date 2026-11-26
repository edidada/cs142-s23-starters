'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch();
  try {
    const page=await browser.newPage({viewport:{width:1100,height:850}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const root='http://localhost:3000/';
    await page.goto(root+'getting-started.html');
    await page.locator('.personal-header').waitFor();
    assert.equal(await page.locator('.motto-update h2').innerText(),'edidada');
    assert.equal(await page.locator('.current-motto').innerText(),'Learn by building');
    await page.getByLabel('Your motto (up to 20 characters)').fill('Build and reflect');
    assert.equal(await page.locator('.current-motto').innerText(),'Build and reflect');
    await page.goto(root+'p2.html');
    await page.locator('.states-view').waitFor();
    const names=await page.evaluate(()=>window.cs142models.statesModel().slice().sort());
    assert.deepEqual(await page.locator('.states-view li').allTextContents(),names);
    // Check every state's prefixes, literal regex punctuation, mixed case and empty input.
    for(const term of ['', 'aL', 'zzzzzz', '.', '[', ...names.map(n=>n.slice(0,3))]) {
      await page.getByLabel('State name contains').fill(term);
      const expected=names.filter(n=>n.toLowerCase().includes(term.toLowerCase()));
      assert.deepEqual(await page.locator('.states-view li').allTextContents(),expected);
      assert.equal(await page.locator('.states-view output').innerText(),term);
      assert.equal(await page.getByRole('status').count(),expected.length?0:1);
    }
    await page.getByLabel('State name contains').fill('aL');
    fs.mkdirSync('results',{recursive:true});
    await page.screenshot({path:'results/states.png',fullPage:true});
    await page.goto(root+'p4.html');
    await page.getByRole('button',{name:'Switch to Example',exact:true}).click();
    assert.equal(await page.locator('.states-view').count(),0);
    await page.locator('.motto-update').waitFor();
    await page.getByRole('button',{name:'Switch to States',exact:true}).click();
    assert.equal(await page.locator('.motto-update').count(),0);
    await page.locator('.states-view').waitFor();
    await page.goto(root+'p5.html#/example');
    await page.locator('.motto-update').waitFor();
    assert.equal(await page.locator('.personal-header').count(),1);
    await page.reload(); await page.locator('.motto-update').waitFor();
    await page.getByRole('link',{name:'States',exact:true}).click();
    assert(page.url().endsWith('#/states'));
    await page.locator('.states-view').waitFor();
    await page.reload(); await page.locator('.states-view').waitFor();
    await page.goBack(); await page.locator('.motto-update').waitFor();
    await page.goForward(); await page.locator('.states-view').waitFor();
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    await page.screenshot({path:'results/routed-mobile.png',fullPage:true});
    assert.deepEqual(errors,[]);
    fs.writeFileSync('results/checks.json',JSON.stringify({stateCount:names.length,filterCases:names.length+5,
      mottoModelAndEditing:true,headerAllFourApps:true,p4BothDirections:true,hashDeepLinkAndReload:true,
      browserHistory:true,mobileNoOverflow:true,pageErrors:errors},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
