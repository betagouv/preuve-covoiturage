# Load testing

## Requirements

- [k6.io binary](https://k6.io/docs/getting-started/installation)

## Run the tests

```shell
cd api/proxy/load
k6 run certificate_create.js
k6 run certificate_pdf.js
k6 run certificate_png.js
```

> Runs with 10 virtual users for 10 seconds  
> You can change with `k6 run --vus 20 --duration 20s certificate_create.js`
