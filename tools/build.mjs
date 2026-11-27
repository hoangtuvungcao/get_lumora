import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSite } from './check.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'site');
const out = path.join(root, 'dist');
await validateSite(source);
if (path.dirname(out) !== path.resolve(root) || path.basename(out) !== 'dist') throw new Error('Unsafe output path');
await rm(out, { recursive: true, force: true });
await mkdir(out);
await cp(source, out, { recursive: true });
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else if (entry.isFile()) files.push(target);
    else throw new Error('Unexpected non-file: ' + target);
  }
  return files;
}
const files = await walk(out);
const hashes = new Map();
for (const file of files.filter(file => /\.(css|js)$/.test(file))) {
  const rel = '/' + path.relative(out, file).split(path.sep).join('/');
  hashes.set(rel, createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 12));
}
for (const file of files.filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const versioned = html.replace(/((?:href|src)=["'])(\/assets\/[^"'?#]+\.(?:css|js))(?:\?[^"'#]*)?(["'])/g,
    (all, start, url, end) => hashes.has(url) ? start + url + '?v=' + hashes.get(url) + end : all);
  await writeFile(file, versioned);
}
let sourceCommit = null;
try { sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch {}
const project = JSON.parse(await readFile(path.join(source, 'project.json'), 'utf8'));
await writeFile(path.join(out, 'version.json'), JSON.stringify({
  websiteVersion: project.websiteVersion, sourceCommit,
  applicationTag: project.applicationTag, applicationReleaseAssetCount: project.applicationReleaseAssetCount,
  applicationRebuilt: false, cloudflareProject: 'getlumora'
}, null, 2) + '\n');
await validateSite(out);
console.log('Built ' + files.length + ' reviewed website files into dist/; application ' + project.applicationTag + ' unchanged.');
