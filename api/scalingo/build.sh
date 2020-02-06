#!/bin/sh

# build providers
yarn workspace @pdc/provider-crypto build
npx lerna run --parallel --scope @pdc/provider-* build

# build services
npx lerna run --parallel --scope @pdc/service-* build

# build proxy
yarn workspace @pdc/proxy build

# clean up
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete
