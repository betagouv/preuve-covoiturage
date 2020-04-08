#!/bin/sh
lerna run --scope @pdc/* --sort build

# clean up
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

# Post build
rm -rf ./ilos/.git
find ./ilos -type d -name node_modules -exec rm -rf {} +

# clean up
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete

echo -n "[app] size: "; du -ch | tail -n 1