#!/usr/bin/env bash

set_env() {
  export DC="$(which docker-compose) -p pdce2e -f docker-compose.e2e.yml $1"
  export CERT_DIR="$(pwd)/docker/traefik/certs"
  export KEY_DIR="$(pwd)/docker/api/certs"
}

generate_keys() {
  echo "Generating keys"
  export KEY_DIR="$(pwd)/docker/api/certs"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -pkeyopt rsa_keygen_pubexp:3 -out "$KEY_DIR/privateKey.pem"
  openssl pkey -in "$KEY_DIR/privateKey.pem" -out "$KEY_DIR/publicKey.pem" -pubout

  # avoid permission error on e2e tests
  chmod a+r "$KEY_DIR/privateKey.pem"
  chmod a+r "$KEY_DIR/publicKey.pem"
}

ensure_keys() {
  if [ ! -f $KEY_DIR/privateKey.pem ]; then
      generate_keys
  fi
}

generate_certs() {
  echo "Generating certificates"
  openssl genrsa -out $CERT_DIR/localCA.key 2048
  openssl req -x509 -new -nodes -key $CERT_DIR/localCA.key -sha256 -days 1825 -out $CERT_DIR/localCA.pem -subj "/C=FR/ST=Idf/L=Paris/O=Local PDC/CN=pdc/emailAddress=technique@covoiturage.beta.gouv.fr"
  openssl genrsa -out $CERT_DIR/cert.key 2048
  openssl req -new -key $CERT_DIR/cert.key -out $CERT_DIR/cert.csr -subj "/C=FR/ST=Idf/L=Paris/O=Local PDC/CN=*.covoiturage.test/emailAddress=technique@covoiturage.beta.gouv.fr"
  openssl x509 -req -in $CERT_DIR/cert.csr -CA $CERT_DIR/localCA.pem -CAkey $CERT_DIR/localCA.key -CAcreateserial -out $CERT_DIR/cert.crt -days 500 -sha256
}

ensure_certs() {
  if [ ! -f $CERT_DIR/cert.key ]; then
      generate_certs
  fi
}

rebuild() {
  echo "Rebuilding app image"
  $DC build api
  $DC build dashboard
}

start_services() {
  echo "Start services"
  echo "$DC up -d s3 postgres mailer"
  $DC up -d s3 postgres mailer
}

start() {
  echo "Start proxy $1"
  $DC up -d proxy $1
}

wait_for_app() {
  $DC run --rm wait
}

seed_data() {
  echo "Seed data"
  # $DC run --rm api yarn workspace @pdc/proxy ilos seed
  # $DC run --rm api yarn test:integration
  yarn --cwd api workspace @pdc/proxy ilos seed
}

create_bucket() {
  echo "Create bucket"
  $DC run --rm -e BUCKET=$1 s3-init
}

bootstrap() {
  ensure_certs && \
  ensure_keys && \
  start_services && \
  seed_data && \
  create_bucket local-pdc-export && \
  create_bucket local-pdc-appels-de-fonds && \
  create_bucket local-pdc-public
}

stop() {
  echo "Cleaning up"
  $DC down -v
}

run_e2e() {
  echo "Start e2e test"
  mkdir -p /tmp/cypress/screenshots
  mkdir -p /tmp/cypress/videos
  $DC run --rm cypress
}

e2e() {
  set_env && \
  bootstrap && \
  start dashboard && \
  wait_for_app && \
  run_e2e 2>&1
  EXIT=$?
  stop
  exit $EXIT
}

local_e2e() {
  ( cd tests && yarn && \
    CYPRESS_MAILHOG_URL=https://mailer.covoiturage.test/api \
    CYPRESS_BASE_URL=https://app.covoiturage.test \
    yarn cy:open
  )
}

run_integration() {
  echo "Start integration test"
  # echo $DC
  # $DC run --rm api yarn test:integration
  yarn --cwd api test:integration
}


bootstrap_integration() {
  ensure_certs && \
  ensure_keys && \
  start_services && \
  create_bucket local-pdc-export && \
  create_bucket local-pdc-appels-de-fonds && \
  create_bucket local-pdc-public
}


integration() {
  set_env "-f docker-compose.integration.yml" && \
  export DC="$(which docker-compose) -p pdce2e -f docker-compose.integration.yml $1" && \
  start && \
  bootstrap_integration && \
  run_integration 2>&1
  EXIT=$?
  # stop
  exit $EXIT
}

"$@"
