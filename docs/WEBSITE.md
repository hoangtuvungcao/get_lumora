# Website source and deployment

This repository contains the public Lumora download site in `site/`, reviewed product images,
release metadata and developer documentation. The Flutter app and Rust core are maintained in
the separate [Lumora source repository](https://github.com/hoangtuvungcao/lumora).

The app/core remain **proprietary freeware** under the existing [application license](../LICENSE.md).
Source visibility does not make them open source. The separately identified Bot SDK is **MIT**;
its distributed license and third-party notices must stay with its files.

## Validate and preview

Use Node.js 20 or later:

```sh
npm ci
npm test
npm run build
npm run check
npm run qa
npm run serve
```

Browser QA uses the installed Google Chrome at `/usr/bin/google-chrome`, or `CHROME_BIN`.
If neither is installed, install Playwright Chromium with `npx playwright install chromium`.
QA checks all index pages at mobile and desktop widths, both languages, navigation, theme,
FAQ, real release links and image loading. Screenshots are local outputs in ignored
`test-results/`; they are not user-submitted screenshots.

`npm run build` copies only `site/`, validates local links and content, versions CSS/JS references
and writes deployment metadata to `dist/version.json`. It never builds or signs application binaries.

## Release boundaries

The application download authority is
[v1.0.10 in get_lumora](https://github.com/hoangtuvungcao/get_lumora/releases/tag/v1.0.10),
published 2026-11-09 with **18 assets**. Its checksums and asset metadata are independently
recorded in `test/fixtures/release-v1.0.10.json`. The website validates 14 app/runner downloads
against those existing assets. This is metadata/integrity verification, not a claim of a new
binary build or fresh device testing.

Website releases use their own `website-*` tag, are marked **prerelease / not latest**, and carry
no replacement application assets. Keep `releases/latest` pointing to the application release.
Never move `v1.0.10`, rebuild or replace its assets as part of a website update.

The app source repository may be temporarily inaccessible during release maintenance.
Download, issues and discussion links remain on this public repository.

## Existing Cloudflare Pages project

Authenticate locally with Wrangler and use the **existing** direct-upload project `getlumora`:

```sh
npm run build
npx wrangler@4.86.0 pages deploy dist --project-name getlumora --branch main
```

The production domain is **https://getlumora.pages.dev**. After uploading, verify
`/version.json`, the home page, downloads, community and developer docs on production.
Only deploy `dist/`; never upload the repository root, private app/core, local notes or tokens.

This is a deliberate local direct upload. The check workflow does not provide continuous
deployment. A short-lived local Wrangler OAuth session is not a durable CI credential:
do not copy it into GitHub secrets or describe it as permanent CD.

## Content boundaries

Keep both Vietnamese and English copies aligned. Encryption protects supported content paths;
it does not hide all connection metadata or protect a compromised recipient device.
SQLCipher covers the local database, not normal downloaded/exported files. Encrypted offline
mail can be retained by friends/relay/Nostr infrastructure. Nostr public-inbox subscriptions
can link ID and IP while discoverability is enabled; configured relays see connecting identity
and IP. Do not reinstate claims of no server-held copies, complete IP anonymity or free forever.
