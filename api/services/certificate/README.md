# Certificate

- create schema and table files (migration) in api/db/migrations

```sql
CREATE EXTENSION IF NOT EXISTS 'uuid-ossp';
```

```sql
CREATE SCHEMA IF NOT EXISTS certificate;
```

```sql
CREATE TABLE IF NOT EXISTS certificate.certificates
(
	_id serial primary key,
	uuid uuid unique NOT NULL DEFAULT uuid_generate_v4 (),
	identity_id varchar NOT NULL,
	operator_id varchar NOT NULL,
	territory_id varchar NOT NULL,
	start_at timestamp NOT NULL,
	end_at timestamp NOT NULL,
	created_at timestamp NOT NULL DEFAULT NOW(),
	meta json NOT NULL,
	accessed_at json,
)
```

https://www.postgresql.org/docs/11/datatype-uuid.html

`meta` JSON object with key data for human verification
```json
{
	type: "object",
	additionalProperties: false,
	minProperties: 4,
	properties: {
		total_km: { type: "number" },
		total_point: { type: "integer" },
		total_cost: { type: "number" },
		remaining: { type: "number" },
	}
}
```

`accessed_at`: Array of JSON objects storing access data:
```json
{
	type: "object",
	additionalProperties: false,
	required: ["datetime", "user_agent"],
	properties: {
		datetime: { type: "string", format: "date-time" },
		ip: { type: "string", format: anyOf: ["ipv4", "ipv6"] },
		user_agent: { macro: "longchar" },
		user_id: { macro: "varchar" },
		content_type: {
			type: "string",
			enum: ["application/json", "application/pdf"]
		}
	}
}
```

