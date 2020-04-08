#!/bin/sh

# script runs from the api folder

# install global dependencies
yarn global add npm-run-all lerna typescript

# install ilos dev branch
cd ..
git clone https://github.com/betagouv/ilos
cd ilos

# 2020/03/02 use tagged master@0.4.1 until ilos is published or completely cleaned
if [ $NODE_ENV = 'production' ]; then
  git checkout master
else
  git checkout dev
fi

yarn
yarn build

find . -name "node_modules" -exec rm -rf {} \;

echo -n "[ilos] size: "; du -ch | tail -n 1
cd ..
mv ilos api/ilos
