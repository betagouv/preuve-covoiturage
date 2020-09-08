#!/bin/sh

pwd
env
VERSION='version'
echo "APP_VERSION=$VERSION"
exit 0

yarn global add db-migrate db-migrate-pg

npx lerna run --sort build

chmod u+x node_modules/@ilos/framework/dist/cli.js
ln -svf ../@ilos/framework/dist/cli.js node_modules/.bin/ilos

# clean up
echo '[app] Clean up dev files'
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

echo -n "[app] size: "; du -ch | tail -n 1
