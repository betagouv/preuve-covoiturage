#!/usr/bin/env bash

setup() {
  # load environment variables
  if [ -e ".env" ]
  then
    source .env
    export $(sed '/^#/d' .env | cut -d= -f1)
    echo "Environment variables from .env exported"
  else
    echo "Missing .env file. Please copy .env.example to .env and configure it"
  fi

  # setup the playground folder
  mkdir -p playground
  echo "playground folder (untracked) created. Have fun!"
}

cleanup() {
  if [ -e ".env" ]
  then
    source .env
    unset $(sed '/^#/d' .env | cut -d= -f1)
    echo "Environment variables from .env removed from shell"
  else
    echo "Missing .env file. Please copy .env.example to .env and configure it"
  fi
}
