import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symlinks are not public website inputs');
    if (entry.isDirectory()) files.push(...await walk(target));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}
export async function validateSite(dir) {
  const root = path.resolve(dir);
  const errors = [];
  const files = await walk(root);
  const allowed = /(?:\.(?:html|css|js|mjs|mts|ts|json|xml|txt|svg|png|webp|ico|webmanifest|woff2?|py|whl|gz|tgz)|\/(?:_headers|_redirects))$/i;
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/');
    if (!allowed.test('/' + rel)) errors.push('Unexpected published file: ' + rel);
    if (/(^|\/)(?:\.git|\.env|node_modules|target|core|app|symbols)(?:\/|$)/i.test(rel)) errors.push('Private/build path: ' + rel);
    if ((await stat(file)).size > 25 * 1024 * 1024) errors.push('Cloudflare file too large: ' + rel);
    if (!/\.(?:html|js|css|json|xml|txt|py)$/.test(file)) continue;
    const text = await readFile(file, 'utf8');
    if (/(?:\/home\/[^\s"'<>]+|\/Users\/[^\s"'<>]+|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)/.test(text)) errors.push('Private path/key material: ' + rel);
    if (/free forever|miễn phí trọn đời|miễn phí mãi mãi|no server keeps your messages|không máy chủ nào giữ tin nhắn/i.test(text)) errors.push('Unsupported blanket claim: ' + rel);
    if (!file.endsWith('.html')) continue;
    const headings = [...text.matchAll(/<h1\b[^>]*>/gi)].filter(match => !/\shidden(?:\s|>|=)/i.test(match[0]));
    if (headings.length !== 1) errors.push('Expected one initially visible main heading: ' + rel);
    const ids = [...text.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    if (new Set(ids).size !== ids.length) errors.push('Duplicate HTML ID: ' + rel);
    for (const tag of text.matchAll(/<(?:a|img|script|link|use)\b[^>]*>/gi)) {
      if (/^<img\b/i.test(tag[0]) && !/\balt="[^"]*"/i.test(tag[0])) errors.push('Missing image alt: ' + rel);
      if (/\son[a-z]+=|\sstyle=/i.test(tag[0])) errors.push('Inline executable/style: ' + rel);
      for (const attr of tag[0].matchAll(/\b(?:href|src)="([^"]+)"/g)) {
        const url = attr[1].replaceAll('&amp;', '&');
        if (/^javascript:/i.test(url)) errors.push('Unsafe URL: ' + rel);
        if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(url)) continue;
        const clean = decodeURIComponent(url.split(/[?#]/)[0]);
        if (!clean) continue;
        let target = clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(file), clean);
        if (!target.startsWith(root + path.sep)) { errors.push('Escaped root: ' + rel); continue; }
        try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); await stat(target); }
        catch { errors.push('Broken local resource: ' + rel + ' -> ' + url); }
      }
    }
    for (const block of text.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
      try { JSON.parse(block[1]); } catch { errors.push('Invalid structured data: ' + rel); }
    }
  }
  if (!htmlFiles.length) errors.push('No website pages');
  const project = JSON.parse(await readFile(path.join(root, 'project.json'), 'utf8'));
  const releases = JSON.parse(await readFile(path.join(root, 'releases.json'), 'utf8'));
  if (releases.repo !== 'hoangtuvungcao/get_lumora' || 'v' + releases.version !== project.applicationTag) errors.push('Wrong application release authority');
  const manifestFiles = [...Object.values(releases.platforms).flatMap(p => p.files), ...releases.tools.botRunner.files];
  for (const file of manifestFiles.filter(file => file.available)) {
    if (!file.url?.startsWith('https://github.com/hoangtuvungcao/get_lumora/releases/download/' + project.applicationTag + '/')) errors.push('Wrong download URL: ' + file.id);
    if (!/^[a-f0-9]{64}$/.test(file.sha256 || '') || !(file.bytes > 0)) errors.push('Invalid integrity metadata: ' + file.id);
  }
  const app = await readFile(path.join(root, 'assets/js/app.js'), 'utf8');
  const fallback = app.match(/\/\*RELEASES-BEGIN\*\/([\s\S]*?)\/\*RELEASES-END\*\//);
  if (!fallback || JSON.stringify(JSON.parse(fallback[1])) !== JSON.stringify(releases)) errors.push('Release fallback differs from releases.json');
  if (errors.length) throw new Error(errors.join('\n'));
  return { pages: htmlFiles.length, files: files.length, appDownloads: manifestFiles.length };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const dir = process.argv[2] || fileURLToPath(new URL('../site/', import.meta.url));
  console.log(JSON.stringify(await validateSite(dir)));
}
