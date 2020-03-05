#!/bin/bash

echo "---------------------------------------------"
echo "            Rebuid ilos && app               "
echo "---------------------------------------------"

if [ ${PWD##*/} != "api" ]; then
  echo 'Error: run me from "api" folder';
  exit 1;
fi

rm -rf ./**/dist
rm -rf ./**/node_modules

cd ilos
yarn
yarn build

cd ..
yarn
yarn build
