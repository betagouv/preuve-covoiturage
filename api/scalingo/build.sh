#!/bin/sh

yarn global add db-migrate db-migrate-pg

npx lerna run --sort build
find . -type d -name node_modules -exec rm -rf {} \;  2>/dev/null

unset PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
yarn


# clean up
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

echo -n "[app] size: "; du -ch | tail -n 1
