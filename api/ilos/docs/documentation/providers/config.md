---
title: Config
lang: en-US
footer: Apache 2.0 Licensed
---

# Configuration

The config provider aims to provide an access to config files.

## Installation

`yarn add @ilos/config`

Note: this package is already loaded by the framework.

## Configuration

By default, the config provider will search config file from #APP_WORKING_PATH/config. You can use ts/js file or yaml files.

`/services/greeting/src/config/greeting.ts`

```ts
import { env } from '@ilos/core';

export const hi = env('APP_HI');
```

In your service provider, you may bind use the `config` keyword to configure the provider.

```ts
import { Parents, Container } from '@ilos/core';
import { HelloAction } from './action/HelloAction';

@Container.serviceProvider({
  config: __dirname,
  handlers: [HelloAction],
})
export class ServiceProvider extends Parents.ServiceProvider {}
```

The config keyword accept a base path as string (ie. `__dirname`), a path configuration (`{ workingPath: string, configDir: string }`) or a config object ({ [k: string]: any }).

## Usage

In order get config provider from IOC, you must add it in the constructor. Then, you can do

```ts
this.config.get(key, fallback);
```

The first argument is the config key, the second is the fallback. You can omit the fallback but if you do so, the config provider will raise Error on key not found.

## Example

```ts
import { Parents, Container, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/config';

type HelloParamsType = {
  name: string;
};

@Container.handler({
  service: 'greeting',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  constructor(private config: ConfigProviderInterfaceResolver) {
    super();
  }

  protected async handle(params: HelloParamsType, context: Types.ContextType): Promise<string> {
    const greeting = this.config.get('greeting.hi', 'Hello');

    return `${greeting} ${params.name}`;
  }
}
```

## Custom implementation

You can replace the packaged config provider with your own implementation by binding the `ConfigInterfaceResolver` with a class which implements `ConfigInterface`.
