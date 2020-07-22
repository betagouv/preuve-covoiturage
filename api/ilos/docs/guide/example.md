# Ilos Example

## Directory structure

+ my_app
    + **ilos : Framework ilos (optional, npm package will be available)**
    
    + **providers : Provider utilisé par l'application** (providers)[./provider.md]
        + **auth : Example de provider**
            - **src**   
            - package.json
            - tsconfig.json
        + **...**
    + **services : Différents services** (services)[./service/index.md]
        + **my_service**
            - **src**
            - package.json
            - tsconfig.json
        + **...**
    + **app : Centralized app orchestrator (optional)** (monolith example)[./example_monolotith.md]
        - **src**   
        - package.json
        - tsconfig.json

    - package.json
    - tsconfig.json
    - lerna.json

## Project setup

A core package.json is used only to link project workspaces

**Package.json**
```json
{
    "name": "@my-app/app",
    "engines": {
      "node": "12.x.x"
    },
    "workspaces": [
      "app",
      "providers/*",
      "services/*",
      "ilos/packages/*"
    ],
    "scripts": {
      "clean": "rm -rf ./**/dist",
      "watch": "lerna run --parallel watch",
      "ls": "lerna ls",
      "build": "run-s clean build:providers build:services",
      "build:providers": "lerna run --parallel --scope @my-app/provider-* build",
      "build:services": "lerna run --parallel --scope @my-app/service-* build"
    },
    

    "devDependencies": {
      "@typescript-eslint/eslint-plugin": "^2.15.0",
      "@typescript-eslint/parser": "^2.15.0",
      "eslint": "^6.8.0",
      "eslint-plugin-prettier": "^3.1.2",
      "lerna": "^3.20.2",
      "lint-staged": "^9.5.0",
      "npm-run-all": "^4.1.5",
      "prettier": "^1.19.1",
      "ts-node": "^8.5.4",
      "typescript": "^3.7.4"
    },
    "lint-staged": {
        "*.ts": [
            "prettier --write",
            "eslint --fix",
            "git add"
        ]
    }
}
```

**package setup using lerna.json**
```json
{
    "packages": [
        "app",
        "services/*",
        "providers/*"
    ],
    "version": "0.0.1",
    "npmClient": "yarn",
    "useWorkspaces": true
}
```
**tsconfig.json**
```json
{"compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "allowJs": false,
    "declaration": true,
    "noImplicitAny": false,
    "moduleResolution": "node",
    "noStrictGenericChecks": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "*": ["node_modules/*"],
      "~/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "src/**/*.spec.ts",
    "tests/**"
  ],
  "libs": ["es6"]
}
```


#### Start action from command line

Start http transport API

```bash
yarn ilos http 8080
```

#### Start action 

```bash
yarn ilos call -p {request_param: true} -c {context_option: true} service:action 
```