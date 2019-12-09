#!/bin/bash

# macro for dependencies to Scalingo one-off containers
# run ./scalingo-setup.sh when prompt is ready

dbclient-fetcher pgsql 11
export $(DATABASE_URL=$SCALINGO_POSTGRESQL_URL npx pgexplode | xargs)
wget -O ffsend https://github.com/timvisee/ffsend/releases/download/v0.2.55/ffsend-v0.2.55-linux-x64-static && chmod +x ffsend
yarn global add db-migrate db-migrate-pg
alias l='ls -lh'
echo 'export $(DATABASE_URL=$SCALINGO_POSTGRESQL_URL npx pgexplode | xargs)'
