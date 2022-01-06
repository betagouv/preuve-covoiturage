#!/usr/bin/env bash

set_env() {
  DC="$(which docker-compose) -p pdce2e -f docker-compose.e2e.yml $1"
  CERT_DIR="$(pwd)/docker/traefik/certs"
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
  echo "$DC up -d s3 postgres"
  $DC up -d s3 postgres
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
  $DC run --rm api yarn workspace @pdc/proxy ilos seed
}

create_bucket() {
  echo "Create bucket"
  $DC run --rm -e BUCKET=$1 s3-init
}

bootstrap() {
  ensure_certs && \
  start_services && \
  seed_data && \
  create_bucket local-pdc-export && \
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
  run_e2e 2> /dev/null
  EXIT=$?
  stop
  exit $EXIT
}

local_e2e() {
  ( cd tests && \
    CYPRESS_MAILHOG_URL=https://mailer.covoiturage.test/api \
    CYPRESS_BASE_URL=https://app.covoiturage.test \
    yarn cy:open
  )
}

run_integration() {
  echo "Start integration test"
  echo $DC
  $DC run --rm api sh -c "yarn install && yarn test:integration"
}

integration() {
  set_env "-f docker-compose.integration.yml" && \
  bootstrap && \
  start && \
  run_integration 2> /dev/null
  EXIT=$?
  stop
  exit $EXIT
}

"$@"