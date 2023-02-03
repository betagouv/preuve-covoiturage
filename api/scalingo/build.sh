#!/bin/sh

yarn global add db-migrate db-migrate-pg

echo $APP_GPG_GIT_SECRET_PRIVATE_KEY >> private.pgp
echo $APP_GPG_GIT_SECRET_PUBLIC_KEY >> public.pgp
gpg --import public.pgp
gpg --import private.pgp

git secret reveal

npx lerna run --sort build

chmod u+x node_modules/@ilos/framework/dist/cli.js
ln -svf ../@ilos/framework/dist/cli.js node_modules/.bin/ilos

# clean up
echo '[app] Clean up dev files'
find . -type f -name "*.spec.js" -delete
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

echo -n "[app] size: "; du -ch | tail -n 1
