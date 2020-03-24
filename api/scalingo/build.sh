#!/bin/sh
lerna run --scope @pdc/* --sort build

# clean up
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete
