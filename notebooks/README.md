# Regsitre de preuve data exploration 

RPC Data exploration with jupyter notebook

## Python (3.10.6)

## Create virtualenv

You can use vscode python extension or

```bash
python3.10 -m venv .venv
```

## Use python virtual env

Vscode does this automatically with a new terminal
```bash
source ./.venv/bin/activate
```

## Exit python virtual env

```bash
deactivate
```

## Install requierements (with venv activated) 
```bash
pip install -r requirements.txt 
pip install -r requirements-dev.txt 
```


## Install pre-commit hook to prevent sensitve data to be added to the repo

This will create a pre-commit hook in `.git` folder
```
pre-commit install
```

https://zhauniarovich.com/post/2020/2020-06-clearing-jupyter-output/

Please use untracked playground folder as much as possible for local analysis