#!/bin/bash

info() {
  echo "---------------------------------------------"
  echo "            Build ilos && app               "
  echo "---------------------------------------------"
}

# Check if script is launch from api
check() {
  if [ ${PWD##*/} != "api" ]; then
    echo 'Error: run me from "api" folder';
    exit 1;
  fi
  return 0
}

# Drop node module folders
drop_modules() {
  echo "Drop node_modules directories"
  find . -type d -name node_modules -exec rm -rf {} \;  2>/dev/null
  return 0
}

# Drop dist folders
drop_dist() {
  echo "Drop dist directories"
  find . -type d -name dist -exec rm -rf {} \;  2>/dev/null
  return 0
}

# Install dependencies
install() {
  echo "Installing dependencies ($1)"
  args="--frozen-lockfile --non-interactive"
  if [ "$1" = "production" ]; then
    yarn install $args --production
  else
    yarn install $args
  fi
  return $?
}

# Build
build() {
  echo "Building app"
  yarn build
  return $?
}

info && check && drop_modules && drop_dist && install && build && drop_modules && install $1 && echo "Done!"