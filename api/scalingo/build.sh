#!/bin/sh

yarn global add db-migrate db-migrate-pg

npx lerna run --sort build

echo '[app] Clean up node_modules'
npm root
npm root -g
# find . -type d -name node_modules -exec rm -rf {} \;  2>/dev/null

echo '[app] Re-install dependencies'
unset PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
yarn

ls -l node_modules

# clean up
echo '[app] Clean up dev files'
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

echo -n "[app] size: "; du -ch | tail -n 1
