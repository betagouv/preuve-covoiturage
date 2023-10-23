# Load testing

## Requirements

- [k6.io binary](https://k6.io/docs/getting-started/installation)

## Run the tests

```shell
cd api/proxy/load
k6 run certificate_create.js
k6 run certificate_pdf.js
k6 run acquisition_create.js
```

> Runs with 10 virtual users for 10 seconds  
> You can change with `k6 run --vus 10 --duration 20s certificate_create.js`

Run in docker using: 

```shell
# default options (--vus 10 --duration 10)
docker-compose run --rm k6 run acquisition_create.js

# run once
docker-compose run --rm k6 run --vus 1 --iterations 1 acquisition_create.js
```
