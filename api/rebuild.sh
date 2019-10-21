#!/bin/bash

echo "---------------------------------------------"
echo "            Rebuid ilos && app               "
echo "---------------------------------------------"

rm -rf ./**/dist
rm -rf ./**/node_modules
rm -rf ./node_modules

cd ilos
yarn
yarn build

cd ..
yarn
yarn build
