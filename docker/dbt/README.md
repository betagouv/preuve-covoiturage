# dbt

To use dbt with docker, you need to first build the image :

```bash
docker build -t dbt-covoiturage --platform linux/amd64 .
```

## Run dbt commands

dbt needs you to mount into the container the `dbt` project folder and you're dbt profiles file. You also need to have several environment variables set. This is an example of running a dbt command with all the necessary environment variables and mounts:

```
docker run \
--network=host \
--mount type=bind,source=path/to/project,target=/usr/app \
--mount type=bind,source=path/to/profiles.yml,target=/root/.dbt/ \
--env-file=./.env \
-t dbt-covoiturage \
debug
```

Make sure to replace `./.env`, `path/to/project` and `path/to/profiles.yml` with the real path.
