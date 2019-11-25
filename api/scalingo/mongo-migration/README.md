# Production Mongo -> Postgres migration

```shell

mongoexport -u<user> -p<password> --authenticationDatabase=admin -d <database> -c <collection> dump.json

# split dump by 100000 entries files
split -l 100000 dump.json

# convert JSON --> SQL INSERT line
cat xaa | jq '.|@json' | while read line; do node convert.js $line >> xaa.sql; done
cat xab | jq '.|@json' | while read line; do node convert.js $line >> xab.sql; done
...

# concat all results
cat xaa.sql xab.sql ... > all.sql

# fix single quotes in export (fixed in convert.js):
cat all.sql | sed -E "s/([a-z\"])'([a-z\"])/\1''\2/ig" > all-fixed.sql

# On the server
psql < all.sql
```

## Data merge

- OLD: pdc-api-prod-9327
- NEW: pdc-test-5583

Dernière safejourney OLD

```json
{
  "_id": ObjectId("5db821d31b03e5004271d348"),
  "journey_id": "klaxit:e27b1116-1b99-42ef-b665-56e79626cb25",
  "createdAt": ISODate("2019-10-29T11:26:11.618Z")
}
```

Total avant sur NEW : 489451
Total après sur NEW : 493878
DIFF : 4427
overlapping journeys : 1

Dernière safejourney NEW

```json
{
  "_id": ObjectId("5db650361b03e5004271c1c0"),
  "journey_id": "klaxit:3c196939-2951-4481-948f-9715867774c1",
  "createdAt": ISODate("2019-10-28T02:19:34.319Z")
}
```

Sur OLD, 4428 safejourneys entre 28/10 et 29/10

:::warning
:warning: Après le 28/10, l'acquisition écrit directement
dans `journeys` et non plus dans `safejourneys`.
:::

Sur NEW.journeys : 103423 entrées avec `created_at`
