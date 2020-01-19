#!/bin/sh

# script runs from the api folder

# clean up ilos folders to save space
rm -rf ./ilos/.git
find ./ilos -type d -name node_modules -exec rm -rf {} +

# clean up
find . -type f -name "*.js.map" -delete
find . -type f -name "*.d.ts" -delete
