---
title: Env
lang: en-US
footer: Apache 2.0 Licensed
---

# Env

The env provider aims to provide an access to environment variables.

## Configuration

By default, the env provider will load environment variables from process.env.

## Usage

In order to use `env()` you must import it from `@ilos/core`

```ts
import { env } from '@ilos/core';
```

The first argument is the env key, the second is the fallback. You can omit the fallback but if you do so, the env provider will raise an Error if the key is not found.

## Pattern

`env()` is meant to be used by the `config` extension. See [Config Provider](/documentation/providers/config)
