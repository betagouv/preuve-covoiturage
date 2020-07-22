#!/bin/sh

yarn global add db-migrate db-migrate-pg

npx lerna run --sort build

# clean up
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

echo -n "[app] size: "; du -ch | tail -n 1
