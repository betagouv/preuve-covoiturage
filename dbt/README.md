Generate sources yml

```
 dbt run-operation generate_source --args '{"schema_name": "fraudcheck", "database_name": "local","generate_columns": true, "table_names":["labels"]}'
 ```