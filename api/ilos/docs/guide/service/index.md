
### Services

Services are implementation and expose actions and commands (cli)

They are used separated packages.

#### File structure

File structure is quite flexible but for better separation of roles

+ **myservice**
    + **src**
        + **config** *[See config section](../config.mf)
            - example.ts
        + **actions** *[See action section](./action.md)*
            - ExampleAction.ts
        + **commands** *[See command section](./command.md)*
            - ExampleCommand.ts
        + **interfaces**
            - Example.ts
            - ExampleRepositoryProviderInterface.ts
        + **providers** *[See providers section](../provider.md)*
            - ExampleRepositoryProvider.ts
        - bootstrap.ts
        - ServiceProvider.ts
    - package.json
    - ts.config.json


#### bootstrap and Service Provider

Each ilos service is in separate package with one bootstrap and one service provider

**Bootstrap.ts**
```ts
import { Bootstrap as BaseBootstrap } from "@ilos/framework";
import { Kernel } from "@ilos/core";
import { ServiceProvider } from "./ServiceProvider";


// BaseBoostrap is taken from ilos framework with all most used extension a more minimalist can be take from ilos
export const bootstrap = BaseBootstrap.create({
    // an custom Kernel can be taken with kernel closure
  // kernel: () => Kernel,      
  serviceProviders: [ServiceProvider]
});

```
**ServiceProvider.ts**
```ts
import { serviceProvider } from "@ilos/common";
import { ServiceProvider as AbstractServiceProvider } from "@ilos/core";
import { ExampleRepositoryProvider } from "./providers/ExampleRepositoryProvider";
import { ExampleAction } from "./actions/ExampleAction";
import { GetFromDateProviderAction } from "./actions/GetFromDateProviderAction";
import { ExampleCommand } from "./commands/ExampleCommand";
import { DateProvider } from "@my-app/provider-date";
import { AuthMiddleware } from "@my-app/provider-auth";
import { AuthGuardedAction } from "./actions/GuardedAction";

// use serviceProvider annotation to setup project provider
@serviceProvider({
  config: __dirname,
  commands: [ExampleCommand],
  providers: [ExampleRepositoryProvider, DateProvider],
  validator: [],

  // define middlewares
  middlewares: [
    ["guard", AuthMiddleware]
  ],

  // define connections
  connections: [
    // [RedisConnection, "connections.redis"],
    // [PostgresConnection, "connections.postgres"]
  ],

  // define actions
  handlers: [ExampleAction, GetFromDateProviderAction, AuthGuardedAction]
  
  // define queues
  // queues: ["fraud"]
})
export class ServiceProvider extends AbstractServiceProvider {}
```



