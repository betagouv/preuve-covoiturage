# Repository

## Install

```
// TODO
```

## Lint

### Build and install dependencies

```shell
docker-compose build lint
cd docker/lint
yarn
```

### Connect with VScode

1. Install [Prettier Code Formatter extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. Il should detect the config from `.vscode/settings.json` and use the configured `prettier` module from `docker/lint/node_modules`. Check the _Ouput_ panel in VScode (Menu > View > Output)

> :warning: Do not install `eslint` or `prettier` locally or globally

### Use

```shell
# lint api and dashboard
docker-compose run lint

# lint api or dashboard only
docker-compose run lint yarn api
docker-compose run lint yarn dashboard

# fix problems
docker-compose run lint yarn api --fix
docker-compose run lint yarn dashboard --fix
```

> You can Ctrl-click on the file paths for the errors and it should jump to the right position in the file.
