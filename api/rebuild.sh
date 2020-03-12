#!/bin/bash

#
# - clean up the dist and node_modules folders in /api and /api/ilos
# to avoid having outdated compiled .js files in dist folders.
# - rebuild ilos and api completely
#
# You can run `docker-compose up api` and it should work with such output:
#
# > Starting preuve-covoiturage_api_1 ... done
# > Attaching to preuve-covoiturage_api_1
# > api_1       | yarn run v1.22.0
# > api_1       | $ yarn workspace @pdc/proxy ilos http $PORT
# > api_1       | $ ilos http 8080
# > api_1       | Bootstraping app...
# > api_1       | debug:   Async call trip:refresh
# > api_1       | debug:   Async call trip:refresh
# > api_1       | Ready!
#
# If you experience problems while running docker-compose up, especially
# after switching branches, try to rebuild the docker system from scratch.
#
# $ docker system prune -a
# $ docker-compose build --force-rm --no-cache --parallel
#
# Note:
# When running a VPN, you need to re-create a docker network:
# $ docker network create docker-network --subnet 172.24.24.0/24
#
# start the api using the provided docker-compose config files:
# $ cd api
# $ docker-compose -y ../docker-compose.yml -y ../docker-compose.openvpn.yml up api
#

echo "---------------------------------------------"
echo "            Rebuid ilos && app               "
echo "---------------------------------------------"

if [ ${PWD##*/} != "api" ]; then
  echo 'Error: run me from "api" folder';
  exit 1;
fi

find . -type d -name node_modules -exec rm -rf {} \;
find . -type d -name dist -exec rm -rf {} \;

cd ilos
yarn
yarn build

cd ..
yarn
yarn build
