start_services() {
  docker-compose -f docker-compose.e2e.yml --env-file e2e.env up -d s3 postgres redis smtp
}

start_app() {
  docker-compose -f docker-compose.e2e.yml --env-file e2e.env up -d api dashboard
}

seed_data() {
  docker-compose -f docker-compose.e2e.yml --env-file e2e.env run api yarn workspace @pdc/proxy ilos seed
}

create_bucket() {
  docker-compose -f docker-compose.e2e.yml --env-file e2e.env run -e BUCKET=$1 s3-init
}

e2e() {
  mkdir -p /tmp/cypress/videos
  docker-compose -f docker-compose.e2e.yml --env-file e2e.env run cypress
}

stop() {
  docker-compose -f docker-compose.e2e.yml --env-file e2e.env down -v
}

start_services && seed_data && create_bucket local && start_app && e2e
