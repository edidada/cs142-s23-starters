'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const models=require('../project5/modelData/photoApp.js').cs142models;
(async()=>{
  const browser=await chromium.launch();
  try {
    const page=await browser.newPage({viewport:{width:1100,height:850}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const root='http://localhost:3000/photo-share.html';
    const users=models.userListModel();
    let photosChecked=0,commentsChecked=0;
    for(const user of users) {
      const name=user.first_name+' '+user.last_name;
      await page.goto(root+'#/users/'+user._id);
      await page.locator('.user-detail').waitFor();
      assert.equal(await page.locator('.user-detail h1').innerText(),name);
      for(const field of ['location','occupation','description']) assert((await page.locator('.user-detail').textContent()).includes(user[field]),name+' '+field);
      await page.waitForFunction(name=>document.querySelector('.view-context').textContent===name,name);
      assert.equal(await page.locator('.schema-version').innerText(),'Version '+models.schemaInfo().__v);
      assert.equal(await page.locator('nav[aria-label="Users"] a').count(),users.length);
      assert.equal(await page.evaluate(()=>typeof window.cs142models),'undefined');
      await page.getByRole('link',{name:'View photos',exact:true}).click();
      const photos=models.photoOfUserModel(user._id);
      await page.waitForFunction(count=>document.querySelectorAll('[data-photo-id]').length===count,photos.length);
      await page.waitForFunction(name=>document.querySelector('.view-context').textContent==='Photos of '+name,name);
      for(const photo of photos) {
        const card=page.locator(`[data-photo-id="${photo._id}"]`);
        await card.locator('img').evaluate(img=>img.decode());
        assert((await card.locator('img').getAttribute('src')).endsWith(photo.file_name));
        assert.equal(await card.locator('time').first().getAttribute('datetime'),photo.date_time);
        const comments=photo.comments||[];
        assert.equal(await card.locator('.photo-comments li').count(),comments.length);
        for(let i=0;i<comments.length;i++) {
          const item=card.locator('.photo-comments li').nth(i),comment=comments[i];
          assert((await item.textContent()).includes(comment.comment));
          assert.equal(await item.locator('a').getAttribute('href'),'#/users/'+comment.user._id);
          assert.equal(await item.locator('time').getAttribute('datetime'),comment.date_time);
          commentsChecked++;
        }
        photosChecked++;
      }
      await page.reload();
      await page.waitForFunction(count=>document.querySelectorAll('[data-photo-id]').length===count,photos.length);
    }
    fs.mkdirSync('results',{recursive:true});
    await page.screenshot({path:'results/photos.png',fullPage:true});
    // Exercise the actual transport in isolation, without changing its implementation.
    const source=fs.readFileSync('project5/lib/fetchModelData.js','utf8').replace('export default fetchModel;','window.fixtureFetch = fetchModel;');
    await page.addScriptTag({content:source});
    await page.route('**/fixture-invalid',r=>r.fulfill({status:200,contentType:'application/json',body:'not json'}));
    const transport=await page.evaluate(async()=>{
      const concurrent=await Promise.all(['/user/list','/test/info','/user/list'].map(u=>window.fixtureFetch(u)));
      const rejected=[];
      for(const url of ['/test/bad','/fixture-invalid']) {
        try {await window.fixtureFetch(url);throw new Error('Expected rejection');}
        catch(e){rejected.push({status:e.status,statusText:e.statusText});}
      }
      return {sizes:[concurrent[0].data.length,concurrent[2].data.length],rejected};
    });
    assert.deepEqual(transport.sizes,[users.length,users.length]);
    assert.equal(transport.rejected[0].status,400);
    assert.equal(transport.rejected[1].statusText,'Invalid JSON response');
    // Race: delayed old route must not overwrite a newer route's details/context.
    await page.route('**/user/'+users[0]._id,async r=>{await new Promise(resolve=>setTimeout(resolve,800));await r.continue();});
    await page.evaluate(id=>{window.location.hash='/users/'+id;},users[0]._id);
    await page.waitForTimeout(100);
    await page.evaluate(id=>{window.location.hash='/users/'+id;},users[1]._id);
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('.user-detail h1').innerText(),users[1].first_name+' '+users[1].last_name);
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'results/mobile-detail.png',fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    assert.deepEqual(errors,[]);
    fs.writeFileSync('results/checks.json',JSON.stringify({users:users.length,photosChecked,commentsChecked,
      serverDataOnly:true,allPhotoDeepLinksReload:true,concurrentXHR:true,httpAndJsonErrors:true,
      staleResponseGuard:true,mobileNoOverflow:true,pageErrors:errors},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
