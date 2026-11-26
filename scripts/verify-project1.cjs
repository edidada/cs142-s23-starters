'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 fs.mkdirSync('results',{recursive:true});
 const source=fs.readFileSync('project1/index.html','utf8');assert(!/<script\b/i.test(source));
 const server=http.createServer((req,res)=>{
  const name=path.basename(req.url.split('?')[0]);
  if(!['index.html','styleA.css','styleB.css','styleC.css'].includes(name)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync('project1/'+name));
 });
 await new Promise(r=>server.listen(3000,'127.0.0.1',r));const browser=await chromium.launch();
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const load=async(style,width,height)=>{
   await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:3000/index.html');
   await page.evaluate(style=>new Promise((resolve,reject)=>{const link=document.querySelector('link');link.onload=resolve;link.onerror=reject;link.href=style+'.css?layout-check='+Date.now();}),style);
   await page.mouse.move(width-1,1);
  };
  const boxes=()=>page.locator('.box').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return{x:r.x,y:r.y,width:r.width,height:r.height,bg:s.backgroundColor,color:s.color,font:s.fontFamily,size:s.fontSize,top:s.borderTopWidth,left:s.borderLeftWidth,leftStyle:s.borderLeftStyle,pad:s.paddingLeft};}));
  for(const [width,height] of [[1000,900],[750,1200],[390,660],[390,500]]){
   await load('styleA',width,height);assert.equal(await page.title(),'CS142 Project 1');const b=await boxes();assert.equal(b.length,6);
   const gaps=[];
   b.forEach((box,i)=>{assert.equal(box.width,100);assert.equal(box.height,100);assert.equal(box.x,(width-100)/2);assert.equal(box.size,'40px');assert(box.font.includes('Tahoma'));if(i<5){assert.equal(box.top,'1px');assert.equal(box.bg,i%2?'rgb(238, 239, 242)':'rgb(223, 225, 231)');gaps.push(b[i+1].y-box.y-100);}});
   assert(gaps.every(g=>g>=0));assert(Math.max(...gaps)-Math.min(...gaps)<1);assert.equal(b[5].bg,'rgb(104, 114, 145)');assert.equal(b[5].top,'4px');
   const center=await page.locator('.box').last().evaluate(n=>{const range=document.createRange();range.selectNodeContents(n);const r=range.getBoundingClientRect(),b=n.getBoundingClientRect();return Math.abs((r.y+r.height/2)-(b.y+b.height/2));});assert(center<2);
   if(width===1000)await page.screenshot({path:'results/styleA.png',fullPage:true});
  }
  for(const [width,height] of [[1000,900],[390,660]]){
   await load('styleB',width,height);let b=await boxes();
   b.forEach(box=>{assert.equal(box.width,100);assert.equal(box.height,150);assert.equal(box.left,'10px');assert.equal(box.leftStyle,'dotted');assert.equal(box.pad,'10px');assert.equal(box.bg,'rgb(238, 239, 242)');assert.equal(box.size,'40px');});
   for(let i=1;i<5;i++){assert.equal(b[i].y,b[0].y);assert.equal(b[i].x-b[i-1].x,110);}
   assert.equal(b[5].x,width-100);assert.equal(b[5].y,height-150);
   await page.locator('.box').first().hover();b=await boxes();assert.equal(b[0].bg,'rgb(255, 255, 0)');assert.equal(b[0].color,'rgb(218, 165, 32)');assert.equal(await page.locator('.box').first().evaluate(n=>getComputedStyle(n).cursor),'pointer');
   await page.screenshot({path:'results/styleB-'+width+'.png',fullPage:true});
  }
  await load('styleC',1000,900);assert(await page.locator('.box').first().evaluate(n=>getComputedStyle(n).backgroundImage.includes('linear-gradient')));assert(await page.locator('.box').first().evaluate(n=>getComputedStyle(n).boxShadow!=='none'));await page.screenshot({path:'results/styleC.png',fullPage:true});
  assert.deepEqual(errors,[]);fs.writeFileSync('results/checks.json',JSON.stringify({styleAViewports:4,styleBViewports:2,nonOverlapAndEqualGaps:true,fixedBottomRight:true,noWrap:true,hoverColorsAndCursor:true,optionalGradientShadowTransition:true,noApplicationJavaScript:true,pageErrors:errors},null,2));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1);});
