# Registre de preuve data exploration

RPC Data exploration with jupyter notebook

## Python (3.10.6)

## Create virtualenv

You can use vscode python extension or

```bash
virtualenv .venv
```

## Use python virtual env

Vscode does this automatically with a new terminal
when the Python Environment Manager extension is installed.
```bash
source ./.venv/bin/activate
```

Copy the `.env.example` to `.env` and setup the required variables.
It is loaded in scripts by `load_dotenv()` from `dotenv`.

## Exit python virtual env

```bash
deactivate
```

## Install requierements (with venv activated)
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Install pre-commit hook to prevent sensitive data to be added to the repo

This will create a pre-commit hook in `.git` folder
```
pre-commit install
```
https://zhauniarovich.com/post/2020/2020-06-clearing-jupyter-output/

Please use untracked playground folder as much as possible for local analysis

## Industrialise notebook script
In order to execute your notebook as a python script
```
jupyter nbconvert --to script scripts/overlap-anomalie-research.ipynb
```

Then it should be added to Dockerfile


## Directory structure

`/scripts` contains industrialised python script
`/scripts/notebooks` is meant for data exploration sharing. It will not be part of industrialised code
