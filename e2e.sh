DC="$(which docker-compose) -f docker-compose.e2e.yml --env-file e2e.env"

rebuild() {
  $DC build api
  $DC build dashboard
}

start_services() {
  $DC up -d s3 postgres redis smtp
}

start_app() {
  $DC up -d api dashboard
}

wait_for_app() {
  $DC run wait
}

seed_data() {
  $DC run api yarn workspace @pdc/proxy ilos seed
}

create_bucket() {
  $DC run -e BUCKET=$1 s3-init
}

e2e() {
  mkdir -p /tmp/cypress/videos
  $DC run cypress
}

stop() {
  $DC down -v
}

if [ "$1" = "rebuild" ]; then
  rebuild
fi

start_services && seed_data && create_bucket local && start_app && wait_for_app && e2e 2> /dev/null
EXIT=$?
stop
exit $EXIT
