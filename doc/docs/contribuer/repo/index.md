# Repository

## Install

```
// TODO
```

## Lint

### Build and install dependencies

```shell
docker-compose build lint
```

### Use the linter

```shell
docker-compose run lint
```

> :information_source: the code is mounted in `read-only` mode to keep the linter from making changes. Fix'em yourself!

### Connect with VScode (optional)

1. Install the `node_modules` in the `docker/lint` folder, otherwise VScode cannot access them (they are built inside the Docker container).

```shell
cd docker/lint && npm install 

2. Install [Eslint extension](https://open-vsx.org/vscode/item?itemName=dbaeumer.vscode-eslint)
3. Il should detect the config from `.vscode/settings.json` and use the configured module from `docker/lint/node_modules`. Check the _Ouput_ panel in VScode (Menu > View > Output)

> :warning: Do not install `eslint` or `prettier` locally or globally

### Use

```shell
# lint api and dashboard
docker-compose run lint

# lint api or dashboard only
docker-compose run lint npm run api
docker-compose run lint npm run dashboard
```

> You can Ctrl-click on the file paths for the errors and it should jump to the right position in the file.
