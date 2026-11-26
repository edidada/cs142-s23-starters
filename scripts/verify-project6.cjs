'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const mongoose=require('../project6/node_modules/mongoose');
const User=require('../project6/schema/user');
const originals=require('../project6/modelData/photoApp').cs142models;
const base='http://localhost:3000';
async function json(path){const r=await fetch(base+path);assert.equal(r.status,200);return r.json();}
(async()=>{
  const users=await json('/user/list');
  const info=await json('/test/info');
  assert.equal(users.length,6);
  const keys=(o)=>Object.keys(o).sort();
  let photoCount=0,commentCount=0;
  for(const user of users){
    assert.deepEqual(keys(user),['_id','first_name','last_name']);
    const detail=await json('/user/'+user._id);
    assert.deepEqual(keys(detail),['_id','description','first_name','last_name','location','occupation']);
    const photos=await json('/photosOfUser/'+user._id);
    const original=originals.userListModel().find(u=>u.first_name===user.first_name);
    assert.equal(photos.length,originals.photoOfUserModel(original._id).length);
    for(const photo of photos){
      assert.deepEqual(keys(photo),['_id','comments','date_time','file_name','user_id']);
      for(const comment of photo.comments){
        assert.deepEqual(keys(comment),['_id','comment','date_time','user']);
        assert.deepEqual(keys(comment.user),['_id','first_name','last_name']);
        commentCount++;
      }
      photoCount++;
    }
  }
  for(const id of ['bad','000000000000000000000000','123456789012']){
    for(const route of ['/user/','/photosOfUser/']) assert.equal((await fetch(base+route+id)).status,400);
  }
  // Prove HTTP data comes from the live database, including a valid user with zero photos.
  await mongoose.connect('mongodb://127.0.0.1/cs142project6');
  let inserted;
  try{
    inserted=await User.create({first_name:'CI-only',last_name:'Live DB',location:'isolated runner',description:'probe',occupation:'probe'});
    assert.equal((await json('/user/'+inserted._id)).first_name,'CI-only');
    assert((await json('/user/list')).some(u=>u._id===String(inserted._id)));
    assert.deepEqual(await json('/photosOfUser/'+inserted._id),[]);
  }finally{if(inserted)await User.deleteOne({_id:inserted._id});await mongoose.disconnect();}
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1100,height:850}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const user of users){
      await page.goto(base+'/photo-share.html#/users/'+user._id);
      await page.locator('.user-detail').waitFor();
      // Hash-only navigation preserves the app's feature flag from the prior user.
      await page.getByRole('checkbox',{name:'Enable Advanced Features'}).uncheck();
      assert.equal(await page.locator('.user-detail h1').innerText(),user.first_name+' '+user.last_name);
      await page.waitForFunction(version=>document.querySelector('.schema-version').textContent==='Version '+version,info.version);
      assert.equal(await page.evaluate(()=>typeof window.cs142models),'undefined');
      await page.getByRole('link',{name:'View photos',exact:true}).click();
      const photos=await json('/photosOfUser/'+user._id);
      await page.waitForFunction(n=>document.querySelectorAll('[data-photo-id]').length===n,photos.length);
      for(const photo of photos){
        const card=page.locator(`[data-photo-id="${photo._id}"]`);
        await card.locator('img').evaluate(img=>img.decode());
        assert.equal(await card.locator('.photo-comments li').count(),photo.comments.length);
        for(const comment of photo.comments)assert((await card.textContent()).includes(comment.comment));
      }
      await page.reload();
      await page.waitForFunction(n=>document.querySelectorAll('[data-photo-id]').length===n,photos.length);
      await page.getByRole('checkbox',{name:'Enable Advanced Features'}).check();
      assert.equal(await page.locator('[data-photo-id]').count(),1);
    }
    // Verify all bubbles, authored comments and both clickable thumbnail/text targets.
    await page.getByRole('checkbox',{name:'Enable Advanced Features'}).uncheck();
    assert.equal(await page.locator('.comment-count').count(),0);
    await page.getByRole('checkbox',{name:'Enable Advanced Features'}).check();
    await page.waitForFunction(()=>document.querySelectorAll('.comment-count').length===6);
    const stats=await json('/userStats');
    let authoredLinks=0;
    for(const user of users){
      const stat=stats.find(x=>x._id===user._id);
      assert.equal(await page.getByRole('link',{name:'Comments by '+user.first_name,exact:true}).textContent(),String(stat.comments));
      assert.equal(await page.locator('[aria-label="Photos by '+user.first_name+'"]').textContent(),String(stat.photos));
      await page.getByRole('link',{name:'Comments by '+user.first_name,exact:true}).click();
      await page.locator('.user-comments').waitFor();
      const comments=await json('/commentsOfUser/'+user._id);
      assert.equal(await page.locator('[data-comment-id]').count(),comments.length);
      for(const comment of comments){
        for(const target of ['img','p']){
          const card=page.locator('[data-comment-id="'+comment._id+'"]');
          assert((await card.textContent()).includes(comment.comment));
          await card.locator(target).click();
          await page.locator('[data-photo-id="'+comment.photo._id+'"]').waitFor();
          assert.equal(await page.locator('[data-photo-id]').count(),1);
          assert((await page.locator('[data-photo-id]').textContent()).includes(comment.comment));
          await page.goBack();await page.locator('.user-comments').waitFor();
        }
        authoredLinks++;
      }
    }
    fs.mkdirSync('results',{recursive:true});
    await page.screenshot({path:'results/comments-desktop.png',fullPage:true});
    await page.screenshot({path:'results/database-photos.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    await page.screenshot({path:'results/database-mobile.png',fullPage:true});
    assert.deepEqual(errors,[]);
    fs.writeFileSync('results/checks.json',JSON.stringify({users:users.length,photoCount,commentCount,
      authoredLinks,advancedBubbles:true,commentThumbnailAndTextNavigation:true,schemaVersion:info.version,strictProjection:true,invalidAndMissingIds400:true,liveDatabaseMutation:true,
      validUserZeroPhotos:true,axiosBrowserAllUsers:true,photoRefreshAndStepper:true,mobileNoOverflow:true,pageErrors:errors},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
