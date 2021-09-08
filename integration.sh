DC="$(which docker-compose) -p pdce2e -f docker-compose.e2e.yml"
CERT_DIR="$(pwd)/docker/traefik/certs"

generate_certs() {
  echo "Generating certificates"
  openssl genrsa -out $CERT_DIR/localCA.key 2048
  openssl req -x509 -new -nodes -key $CERT_DIR/localCA.key -sha256 -days 1825 -out $CERT_DIR/localCA.pem -subj "/C=FR/ST=Idf/L=Paris/O=Local PDC/CN=pdc/emailAddress=technique@covoiturage.beta.gouv.fr"
  openssl genrsa -out $CERT_DIR/cert.key 2048
  openssl req -new -key $CERT_DIR/cert.key -out $CERT_DIR/cert.csr -subj "/C=FR/ST=Idf/L=Paris/O=Local PDC/CN=*.covoiturage.test/emailAddress=technique@covoiturage.beta.gouv.fr"
  openssl x509 -req -in $CERT_DIR/cert.csr -CA $CERT_DIR/localCA.pem -CAkey $CERT_DIR/localCA.key -CAcreateserial -out $CERT_DIR/cert.crt -days 500 -sha256
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

start_app() {
  echo "Start app"
  $DC up -d proxy
}

wait_for_app() {
  $DC run wait
}

seed_data() {
  echo "Seed data"
  $DC run api yarn workspace @pdc/proxy ilos seed
}

create_bucket() {
  echo "Create bucket"
  $DC run -e BUCKET=$1 s3-init
}

integration() {
  echo "Start integration test"
  $DC run api test:integration
}

stop() {
  echo "Cleaning up"
  $DC down -v
}

if [ "$1" = "rebuild" ]; then
  rebuild
fi

if [ ! -f $CERT_DIR/cert.key ]; then
    generate_certs
fi

start_services && seed_data && create_bucket local-pdc-export && create_bucket local-pdc-public && start_app && wait_for_app && integration 2> /dev/null
EXIT=$?
stop
exit $EXIT
