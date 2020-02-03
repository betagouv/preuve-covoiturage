#!/bin/sh

# script runs from the api folder

# install global dependencies
yarn global add npm-run-all lerna typescript

# install ilos dev branch
cd ..
git clone https://github.com/betagouv/ilos
cd ilos
git checkout dev
yarn
yarn build
rm -rf ./node_modules
rm -rf ./**/node_modules
echo -n "[ilos] size: "; du -ch | tail -n 1
cd ..
mv ilos api/ilos
