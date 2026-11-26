'use strict';
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch();
 try{
  const a=await browser.newContext({viewport:{width:1100,height:850}}),b=await browser.newContext();
  const base='http://localhost:3000';
  const get=async(ctx,url)=>{const r=await ctx.request.get(base+url);assert.equal(r.status(),200);return r.json();};
  const post=async(ctx,url,data)=>{const r=await ctx.request.post(base+url,{data});assert.equal(r.status(),200);return r.json();};
  for(const route of ['/activities','/latestActivities','/profileSummary/bad','/photoOrder/bad'])assert.equal((await a.request.get(base+route)).status(),401);
  const took=await post(a,'/admin/login',{login_name:'took',password:'weak'});
  const ripley=await post(b,'/admin/login',{login_name:'ripley',password:'weak'});
  const users=await get(a,'/user/list');
  for(const user of users){
    const photos=await get(a,'/photosOfUser/'+user._id);const summary=await get(a,'/profileSummary/'+user._id);
    if(!photos.length){assert.equal(summary.latest,null);assert.equal(summary.mostCommented,null);continue;}
    assert.equal(new Date(summary.latest.date_time).valueOf(),Math.max(...photos.map(p=>new Date(p.date_time).valueOf())));
    assert.equal(summary.mostCommented.comments,Math.max(...photos.map(p=>p.comments.length)));
    assert(photos.some(p=>p._id===summary.latest._id));assert(photos.some(p=>p._id===summary.mostCommented._id));
  }
  const photos=await get(a,'/photosOfUser/'+took._id),photo=photos[0];
  await Promise.all(Array.from({length:20},()=>post(a,'/photoLike/'+photo._id,{liked:true})));
  let order=await get(a,'/photoOrder/'+took._id);assert.equal(order.find(p=>p._id===photo._id).count,1);
  await post(b,'/photoLike/'+photo._id,{liked:true});order=await get(a,'/photoOrder/'+took._id);assert.equal(order[0]._id,photo._id);assert.equal(order[0].count,2);assert(order[0].liked);
  await post(a,'/photoLike/'+photo._id,{liked:false});const byB=await get(b,'/photoOrder/'+took._id);assert.equal(byB.find(p=>p._id===photo._id).count,1);assert(byB.find(p=>p._id===photo._id).liked);
  assert.equal((await a.request.post(base+'/photoLike/'+photo._id,{data:{liked:'yes'}})).status(),400);
  assert.equal((await a.request.post(base+'/photoLike/000000000000000000000000',{data:{liked:true}})).status(),400);
  const page=await a.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/photo-share.html#/users/'+took._id);await page.locator('.profile-summary').first().waitFor();
  await page.getByRole('checkbox',{name:'Enable Advanced Features'}).check();
  for(const kind of ['latest','mostCommented']){
    const summary=await get(a,'/profileSummary/'+took._id);await page.locator('[data-summary='+kind+'] img').click();
    await page.locator('[data-photo-id="'+summary[kind]._id+'"]').waitFor();assert.equal(await page.locator('[data-photo-id]').count(),1);
    await page.goBack();await page.locator('.profile-summary').first().waitFor();
  }
  await page.getByRole('link',{name:'View photos',exact:true}).click();await page.locator('[data-photo-id]').waitFor();
  const card=page.locator('[data-photo-id]').first();const target=await card.getAttribute('data-photo-id');
  await card.getByRole('button',{name:'Like',exact:true}).click();await card.getByRole('button',{name:'Unlike',exact:true}).waitFor();assert.equal(await card.getByRole('button',{name:'Unlike',exact:true}).getAttribute('aria-pressed'),'true');
  await page.reload();await page.locator('[data-photo-id="'+target+'"]').getByRole('button',{name:'Unlike',exact:true}).waitFor();
  await page.locator('[data-photo-id="'+target+'"]').getByRole('button',{name:'Unlike',exact:true}).click();await page.locator('[data-photo-id="'+target+'"]').getByRole('button',{name:'Like',exact:true}).waitFor();
  // Other session produces a photo upload; sidebar must update without navigation or reload.
  const jpeg=fs.readFileSync('project8/test/testPhoto.jpg');
  const upload=await b.request.post(base+'/photos/new',{multipart:{uploadedphoto:{name:'sidebar.jpg',mimeType:'image/jpeg',buffer:jpeg}}});assert.equal(upload.status(),200);
  await page.locator('[data-activity-user="'+ripley._id+'"] img').waitFor({timeout:10000});
  await page.getByRole('link',{name:'Activities',exact:true}).click();await page.locator('.activities article').first().waitFor();
  let feed=await get(a,'/activities');assert.equal(feed.length,5);assert.equal(feed[0].type,'Photo Upload');
  assert.deepEqual(await page.locator('.activities article').evaluateAll(nodes=>nodes.map(n=>n.dataset.activityId)),feed.map(x=>x._id));
  assert(feed.every((x,i)=>i===0||new Date(feed[i-1].date_time)>=new Date(x.date_time)));
  for(let i=0;i<6;i++)await post(b,'/commentsOfPhoto/'+photo._id,{comment:'feed-'+i});
  await page.getByRole('button',{name:'Refresh activities',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.activities article p').length===5&&Array.from(document.querySelectorAll('.activities article p')).every(p=>p.textContent.includes('New Comment')));
  feed=await get(a,'/activities');assert.equal(feed.length,5);assert(feed.every(x=>x.type==='New Comment'));assert.equal(await page.locator('.activities article img').count(),5);
  await page.screenshot({path:'results/activities-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));await page.screenshot({path:'results/activities-mobile.png',fullPage:true});
  const mongoose=require('../project8/node_modules/mongoose');await mongoose.connect('mongodb://127.0.0.1/cs142project6');
  try{
    const events=await mongoose.connection.collection('activities').find({}).toArray();const types=[...new Set(events.map(e=>e.type))];
    for(const type of ['User logging in','User logging out','User registering','Photo Upload','New Comment'])assert(types.includes(type));
    const likes=(await mongoose.connection.collection('photos').findOne({_id:new mongoose.Types.ObjectId(photo._id)})).likes;assert.equal(new Set(likes.map(String)).size,likes.length);assert(likes.length<=users.length);
  }finally{await mongoose.disconnect();}
  assert.deepEqual(errors,[]);fs.writeFileSync('results/story-checks.json',JSON.stringify({storyPoints:14,profileSummaryAllUsers:users.length,profileThumbnailStepper:true,concurrentDuplicateLikes:20,multiUserLikes:true,likeBrowserPersistence:true,sidebarAutomaticUploadThumbnail:true,feedLatestFiveAndRefresh:true,allFiveActivityTypes:true,mobileNoOverflow:true,pageErrors:errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
