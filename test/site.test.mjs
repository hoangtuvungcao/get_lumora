import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateSite } from '../tools/check.mjs';

const site = new URL('../site/', import.meta.url);
const read = path => readFile(new URL(path, site), 'utf8');
test('all public pages, local assets, links and structured data pass the standalone validator', async () => {
  const result = await validateSite(fileURLToPath(site));
  assert.equal(result.pages, 18);
  assert.equal(result.appDownloads, 14);
});
test('download metadata matches all existing v1.0.10 binary assets without rebuilding them', async () => {
  const release = JSON.parse(await read('releases.json'));
  const baseline = JSON.parse(await readFile(new URL('fixtures/release-v1.0.10.json', import.meta.url), 'utf8'));
  assert.equal(baseline.tag_name, 'v1.0.10');
  assert.equal(baseline.assets.length, 18);
  const assets = new Map(baseline.assets.map(asset => [asset.name, asset]));
  for (const file of [...Object.values(release.platforms).flatMap(p => p.files), ...release.tools.botRunner.files]) {
    const asset = assets.get(decodeURIComponent(new URL(file.url).pathname.split('/').at(-1)));
    assert.ok(asset, file.id);
    assert.equal(file.bytes, asset.size, file.id);
    assert.equal('sha256:' + file.sha256, asset.digest, file.id);
  }
  assert.ok(assets.has('SHA256SUMS'));
  assert.ok(assets.has('SHA256SUMS.sigstore.json'));
});
test('home metadata preserves proprietary app/core, MIT SDK and application version', async () => {
  const home = await read('index.html');
  const ld = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const app = ld['@graph'].find(item => item['@type'] === 'SoftwareApplication');
  assert.equal(app.softwareVersion, '1.0.10');
  assert.match(app.license, /get_lumora\/blob\/main\/LICENSE.md$/);
  assert.match(home, /data-i18n="footer.license"/);
  assert.match(await read('community/index.html'), /giấy phép riêng/);
  assert.match(await read('community/index.html'), /MIT/);
});
test('privacy copy discloses ciphertext retention, plaintext downloads and ID/IP metadata in both languages', async () => {
  const vi = await read('privacy/index.html');
  const en = await read('assets/js/legal.js');
  assert.match(vi, /SQLCipher/);
  assert.match(en, /SQLCipher/);
  assert.match(vi, /không mã hoá/);
  assert.match(en, /unencrypted/);
  assert.match(vi, /Nostr/);
  assert.match(en, /Nostr/);
  assert.match(vi, /ID.*IP|IP.*ID/);
  assert.match(en, /ID.*IP|IP.*ID/);
  assert.match(vi, /bản mã/);
  assert.match(en, /ciphertext/);
});
test('public community links stay on the correct source and release repositories', async () => {
  const html = await read('community/index.html');
  for (const url of [
    'https://github.com/hoangtuvungcao/lumora',
    'https://github.com/hoangtuvungcao/get_lumora/releases/tag/v1.0.10',
    'https://github.com/hoangtuvungcao/get_lumora/issues',
    'https://github.com/hoangtuvungcao/get_lumora/discussions'
  ]) assert.ok(html.includes(url), url);
  assert.match(html, /bảo trì/);
  assert.match(await read('sitemap.xml'), /https:\/\/getlumora.pages.dev\/community\//);
});
test('screenshots reuse reviewed public images and have descriptive alternatives', async () => {
  const html = await read('community/index.html');
  for (const name of ['community', 'call', 'remote']) {
    assert.match(html, new RegExp('screenshots/' + name + '\\.png'));
    const image = html.match(new RegExp('<img[^>]+src="/assets/img/screenshots/' + name + '\\.png"[^>]*>'))[0];
    assert.match(image, /alt="[^"]{15,}"/);
  }
});
