#!/bin/sh

yarn global add db-migrate db-migrate-pg

npx lerna run --sort build

chmod u+x node_modules/@ilos/framework/dist/cli.js
ln -svf ../@ilos/framework/dist/cli.js node_modules/.bin/ilos

# clean up
echo '[app] Clean up dev files'
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

echo -n "[app] size: "; du -ch | tail -n 1

# set the application version from git commit number
# git and .git folder are not available at this building stage
# a more readable value would be $(git describe --tags)
echo "[app] version: $DEPLOY_GIT_REF"
echo "APP_VERSION=$DEPLOY_GIT_REF" > .env
