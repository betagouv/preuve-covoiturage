#!/bin/sh

# script runs from the api folder

# install global dependencies
yarn global add npm-run-all lerna typescript

# install ilos dev branch
cd ..
git clone https://github.com/betagouv/ilos
cd ilos

# 2020/03/02 use tagged master@0.4.1 until ilos is published or completely cleaned
if [ $(git rev-parse --abbrev-ref HEAD) = 'master' ]; then
  git checkout 0.4.1
else
  git checkout dev
fi

yarn
yarn build
rm -rf ./node_modules
rm -rf ./**/node_modules
echo -n "[ilos] size: "; du -ch | tail -n 1
cd ..
mv ilos api/ilos
