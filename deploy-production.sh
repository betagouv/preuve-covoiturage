#!/usr/bin/env bash

ROOT=$(pwd)
HOST=covoiturage-beta-gouv@ssh-covoiturage-beta-gouv.alwaysdata.net

git stash
git checkout master
git reset --hard

cd dashboard
rm -rf dist
yarn
yarn run build --configuration=production

ssh $HOST rm -rf www/production/*
scp -rp dist/dashboard/* $HOST:www/production

echo "Production deployed: https://app.covoiturage.beta.gouv.fr"
