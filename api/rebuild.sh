#!/bin/bash

echo "---------------------------------------------"
echo "            Rebuid ilos && app               "
echo "---------------------------------------------"

if [ ${PWD##*/} != "api" ]; then
  echo 'Error: run me from "api" folder';
  exit 1;
fi

find . -type d -name node_modules -exec rm -rf {} \;
find . -type d -name dist -exec rm -rf {} \;

yarn
yarn build:all

