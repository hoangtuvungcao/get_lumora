import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
const changes=JSON.parse(fs.readFileSync(new URL('site-copy.json',import.meta.url),'utf8'));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function esc(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function rx(s){return s.replace(/[.*+?^$()|[\]\\{}]/g,'\\$&');}
let count=0;
for(const file of walk('site').filter(p=>/\.(html|js)$/.test(p))){
 let old=fs.readFileSync(file,'utf8'),text=old;
 text=text.replace(/Miễn phí trọn đời|Miễn phí mãi mãi|miễn phí trọn đời|miễn phí mãi mãi/g,'Bản hiện tại miễn phí').replace(/Free forever/gi,'Current version is free');
 for(const [key,[vi,en]]of Object.entries(changes)){
  if(file.endsWith('.html'))text=text.replace(new RegExp('(<([a-z][a-z0-9]*)\\b[^>]*\\bdata-i18n="'+rx(key)+'"[^>]*>)([\\s\\S]*?)(</\\2>)','gi'),(_,a,tag,body,z)=>a+esc(vi)+z);
  if(file.endsWith('.js'))text=text.replace(new RegExp('("'+rx(key)+'"\\s*:\\s*)"(?:\\\\.|[^"\\\\])*"','g'),(_,a)=>a+JSON.stringify(en));
 }
 text=text.replaceAll('Miễn phí, không cần đăng ký, chỉ bạn và người nhận đọc được.','Bản hiện tại miễn phí, với P2P, mã hoá nội dung và giới hạn metadata được công bố.')
 .replaceAll('Lumora không cần tài khoản, không thu thập dữ liệu. Tin nhắn được mã hoá đầu cuối và lưu trên thiết bị của bạn.','Lumora: SQLCipher cục bộ, tệp tải về không mã hoá và giới hạn metadata của P2P, relay, Nostr.')
 .replaceAll('Lumora needs no account and collects no data. Messages are end-to-end encrypted and stored on your device.','Lumora: local SQLCipher, unencrypted downloads, and P2P, relay and Nostr metadata limits.');
 if(file.endsWith('.html')){
  if(!text.includes('data-i18n="nav.community"'))text=text.replace(/(<a href="\/developers\/" data-i18n="nav.dev">[^<]*<\/a>)/g,'$1<a href="/community/" data-i18n="nav.community">Cộng đồng</a>');
  if(!text.includes('data-i18n="footer.source"'))text=text.replace(/(<a href="https:\/\/github.com\/hoangtuvungcao\/get_lumora\/releases"[^>]*data-i18n="footer.releases">[^<]*<\/a>)/g,'$1<a href="https://github.com/hoangtuvungcao/lumora" target="_blank" rel="noopener" data-i18n="footer.source">Mã ứng dụng/lõi (giấy phép riêng)</a><a href="https://github.com/hoangtuvungcao/get_lumora" target="_blank" rel="noopener" data-i18n="footer.website">Mã website và bản tải</a><a href="/community/" data-i18n="nav.community">Cộng đồng</a>');
  if(!text.includes('data-i18n="footer.license"'))text=text.replace('<p class="footer__copy">','<p class="footer__copy" data-i18n="footer.license">Ứng dụng và lõi: giấy phép riêng · SDK bot: MIT.</p><p class="footer__copy">');
 }
 if(file==='site/assets/js/app.js'){
  const missing=Object.entries(changes).filter(([key])=>!new RegExp('"'+rx(key)+'"\\s*:').test(text));
  text=text.replace('var EN = {','var EN = {'+missing.map(([k,pair])=>JSON.stringify(k)+':'+JSON.stringify(pair[1])+',').join(''));
 }
 if(file==='site/index.html')text=text.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,start,json,end)=>{
  const ld=JSON.parse(json),app=ld['@graph'].find(v=>v['@type']==='SoftwareApplication');
  app.description='Lumora P2P messaging, calls and files; local SQLCipher database with documented metadata and download limits.';
  app.softwareVersion='1.0.10';app.license='https://github.com/hoangtuvungcao/get_lumora/blob/main/LICENSE.md';
  const faq=ld['@graph'].find(v=>v['@type']==='FAQPage');
  faq.mainEntity.forEach((v,i)=>{if(changes['a'+(i+1)])v.acceptedAnswer.text=changes['a'+(i+1)][0];});
  if(!ld['@graph'].some(v=>v['@type']==='SoftwareSourceCode'))ld['@graph'].push({'@type':'SoftwareSourceCode',codeRepository:'https://github.com/hoangtuvungcao/lumora',license:app.license,description:'Proprietary source; access may be restricted during maintenance. Separately licensed Bot SDK: MIT.'});
  return start+JSON.stringify(ld).replaceAll('</','<\\/')+end;
 });
 if (/site\/developers\/reference\/(?:js|python)\/index\.html$/.test(file)) text=text.replace(/<h4 id="bot-(files|groups|users)">/g,'<h4 id="bot-$1-method">');
 if(text!==old){fs.writeFileSync(file,text);count++;}
}
let css=fs.readFileSync('site/assets/css/styles.css','utf8');
if(!css.includes('/* Community additions')){css+='\n/* Community additions reuse existing page and card styles. */\n.community-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.community-card{padding:28px;min-width:0}.community-card h2{font-size:1.35rem;margin:0 0 12px}.community-card p{margin-bottom:18px}.community-card a{display:inline-block;margin:8px 18px 0 0}.community-note{padding:28px;margin-top:28px}.community-shots{display:grid;grid-template-columns:2fr 1fr 2fr;gap:20px;margin-top:28px;align-items:start}.community-shots figure{margin:0;min-width:0}.community-shots img{display:block;width:100%;height:280px;object-fit:contain;border-radius:16px}.community-shots figcaption{margin-top:12px;font-size:.9rem;text-align:center}.community-heading{margin-top:42px}@media(max-width:720px){.community-grid,.community-shots{grid-template-columns:1fr}.community-card{padding:22px}.community-shots img{height:auto;max-height:420px}}\n';fs.writeFileSync('site/assets/css/styles.css',css);}
let sitemap=fs.readFileSync('site/sitemap.xml','utf8');
if(!sitemap.includes('/community/'))fs.writeFileSync('site/sitemap.xml',sitemap.replace('</urlset>','<url><loc>https://getlumora.pages.dev/community/</loc><lastmod>2026-11-27</lastmod></url></urlset>'));
const home=fs.readFileSync('site/index.html','utf8'),download=fs.readFileSync('site/download/index.html','utf8');
let head=download.slice(0,download.indexOf('<main id="main">')).replace('data-page="download"','data-page="community"')
 .replace(/data-title-en="[^"]*"/,'data-title-en="Lumora — Source, downloads and community"').replace(/data-desc-en="[^"]*"/,'data-desc-en="Official releases, proprietary source, MIT SDK and community."')
 .replace(/<title>[^<]*<\/title>/,'<title>Lumora — Mã nguồn, tải về và cộng đồng</title>').replaceAll('https://getlumora.pages.dev/download/','https://getlumora.pages.dev/community/')
 .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*"/g,'$1Bản phát hành Lumora, mã nguồn giấy phép riêng, SDK MIT và cộng đồng."')
 .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*"/g,'$1Lumora — Mã nguồn, tải về và cộng đồng"').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
function t(tag,key,cls){return '<'+tag+(cls?' class="'+cls+'"':'')+' data-i18n="'+key+'">'+esc(changes[key][0])+'</'+tag+'>';}
function link(url,key){return '<a class="text-link" href="'+url+'"'+(url.startsWith('https:')?' target="_blank" rel="noopener"':'')+' data-i18n="'+key+'">'+esc(changes[key][0])+'</a>';}
const main='<main id="main"><section class="page-head"><div class="container">'+t('p','community.eyebrow','badge-gold')+t('h1','community.title','hero__title')+t('p','community.lead')+'</div></section><section class="section section--tight"><div class="container"><div class="community-grid">'
 +'<article class="glass community-card">'+t('h2','community.release.title')+t('p','community.release.body')+link('https://github.com/hoangtuvungcao/get_lumora/releases/tag/v1.0.10','community.release.link')+'</article>'
 +'<article class="glass community-card">'+t('h2','community.docs.title')+t('p','community.docs.body')+link('/developers/','community.docs.link')+'</article>'
 +'<article class="glass community-card">'+t('h2','community.source.title')+t('p','community.source.body')+link('https://github.com/hoangtuvungcao/lumora','community.source.link')+link('https://github.com/hoangtuvungcao/get_lumora','community.website.link')+'</article>'
 +'<article class="glass community-card">'+t('h2','community.feedback.title')+t('p','community.feedback.body')+link('https://github.com/hoangtuvungcao/get_lumora/discussions','community.discussions.link')+link('https://github.com/hoangtuvungcao/get_lumora/issues','community.issues.link')+'</article></div>'
 +'<aside class="glass community-note">'+t('h2','community.limits.title')+t('p','community.limits.body')+link('/privacy/','community.privacy.link')+'</aside>'
 +t('h2','community.images.title','community-heading')+t('p','community.images.body')+'<div class="community-shots">'
 +[['community','Cộng đồng Lumora với các kênh chữ và phòng thoại'],['call','Màn hình cuộc gọi video trong ứng dụng Lumora'],['remote','Màn hình kết nối hỗ trợ máy tính từ xa của Lumora']].map(([name,alt])=>'<figure><img src="/assets/img/screenshots/'+name+'.png" alt="'+alt+'" data-i18n-attr="alt:community.alt.'+name+'" loading="lazy">'+t('figcaption','community.image.'+name)+'</figure>').join('')+'</div></div></section></main>';
fs.mkdirSync('site/community',{recursive:true});fs.writeFileSync('site/community/index.html',head+main+home.slice(home.indexOf('</main>')+'</main>'.length));
console.log('Refreshed bilingual content/metadata in '+count+' pages/scripts and generated community page.');
