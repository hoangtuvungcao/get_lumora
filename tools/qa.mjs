import { chromium } from 'playwright';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { startServer } from './serve.mjs';
import { walk } from './check.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),source=path.join(root,'dist'),output=path.join(root,'test-results');
await mkdir(output,{recursive:true});
const local=process.env.QA_ORIGIN?null:await startServer(source),origin=process.env.QA_ORIGIN||local.origin;
const routes=(await walk(source)).filter(file=>file.endsWith('/index.html')).map(file=>'/'+path.relative(source,file).split(path.sep).join('/').replace(/index\.html$/,''));
const args={headless:true},chrome=process.env.CHROME_BIN||'/usr/bin/google-chrome';try{await stat(chrome);args.executablePath=chrome;}catch{}
const browser=await chromium.launch(args),errors=[];let checks=0;
try{
 for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});
  for(const lang of ['vi','en']){
   const page=await context.newPage();page.on('pageerror',error=>errors.push(String(error)));
   for(const route of routes){
    const response=await page.goto(origin+route+'?lang='+lang,{waitUntil:'networkidle'});
    assert.equal(response.status(),200,route);assert.equal(await page.locator('h1:visible').count(),1,route);
    assert.equal(await page.locator('html').getAttribute('lang'),lang,route);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,route+' overflow '+viewport.width+'/'+lang);
    const broken=await page.evaluate(async()=>{const images=[...document.images];images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.complete?undefined:new Promise(r=>{i.onload=r;i.onerror=r;})));return images.filter(i=>!i.naturalWidth).map(i=>i.src);});
    assert.deepEqual(broken,[],route);checks++;
    if(['/','/download/','/community/'].includes(route))await page.screenshot({path:path.join(output,(route==='/'?'home':route.replaceAll('/',''))+'-'+viewport.width+'-'+lang+'.png'),fullPage:true});
   }
   await page.goto(origin+'/?lang='+lang,{waitUntil:'networkidle'});
   const before=await page.locator('html').getAttribute('data-theme');await page.locator('#theme-toggle').click();assert.notEqual(await page.locator('html').getAttribute('data-theme'),before);
   if(viewport.width<700){await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.locator('#nav-links a[href="/community/"]').click();assert.match(page.url(),/\/community\//);}
   await page.goto(origin+'/?lang='+lang,{waitUntil:'networkidle'});const faq=page.locator('#faq details').first();await faq.locator('summary').click();assert.equal(await faq.getAttribute('open'),'');
   await page.goto(origin+'/download/?lang='+lang,{waitUntil:'networkidle'});assert.ok(await page.locator('a[href*="/releases/download/v1.0.10/"]').count()>=11);
   await page.close();console.log('QA completed '+viewport.width+'px '+lang+' ('+checks+' pages).');
  }await context.close();
 }
 const tiny=await browser.newPage({viewport:{width:320,height:740},reducedMotion:'reduce'});for(const route of ['/','/download/','/community/']){await tiny.goto(origin+route,{waitUntil:'networkidle'});assert.equal(await tiny.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'320px '+route);checks++;}await tiny.close();assert.deepEqual(errors,[]);
 console.log(JSON.stringify({origin,pageChecks:checks,languages:['vi','en'],widths:[320,390,1440],pageErrors:errors.length}));
}finally{await browser.close();if(local)await new Promise(r=>local.server.close(r));}
