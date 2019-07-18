#!/bin/sh

# script runs from the api folder

# install global dependencies
yarn global add npm-run-all lerna typescript @types/node

# install ilos dev branch
git clone https://github.com/betagouv/ilos
cd ilos
git checkout dev
yarn
yarn build
