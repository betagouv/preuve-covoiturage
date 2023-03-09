#!/usr/bin/env bash

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

start_services() {
  echo "Start services"
  echo "$DC up -d s3 postgres redis mailer"
  $DC up -d s3 postgres redis mailer
}

start() {
  echo "Start proxy $1"
  $DC up -d proxy $1
}

seed_data() {
  echo "Seed data"
  yarn --cwd api workspace @pdc/proxy ilos seed
}

create_bucket() {
  echo "Create bucket"
  $DC run --rm -e BUCKET=$1 s3-init
}

stop() {
  echo "Cleaning up"
  $DC down -v
}

set_env_integration() {
  export DC="$(which docker-compose) -p pdce2e -f docker-compose.integration.yml"
  export CERT_DIR="$(pwd)/docker/traefik/certs"
  export KEY_DIR="$(pwd)/docker/api/certs"
}

run() {
  set_env_integration && \
  start && \
  ensure_certs && \
  ensure_keys && \
  start_services && \
  # seed_data && \
  create_bucket local-pdc-export && \
  create_bucket local-pdc-appels-de-fonds && \ 
  create_bucket local-pdc-public && \
  yarn --cwd api test:integration 2>&1
  EXIT=$?
  stop
  exit $EXIT
}

"$@"
