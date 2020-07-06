#!/bin/sh

# script runs from the api folder

# install global dependencies
yarn global add npm-run-all lerna typescript db-migrate db-migrate-pg

# install ilos dev branch
cd ..
git clone https://github.com/betagouv/ilos
cd ilos

git checkout master

yarn
yarn build

find . -name "node_modules" -exec rm -rf {} \;

echo -n "[ilos] size: "; du -ch | tail -n 1
cd ..
mv ilos api/ilos
