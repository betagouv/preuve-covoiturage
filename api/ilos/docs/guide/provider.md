## Provider

Service centered provider can be implemented directly in services. It becomes not mandatory but advice to apply rule of exposition using interface and interface resolver to expose the provider.

**ExampleRepositoryProvider.ts**
```ts
import { provider } from "@ilos/common";

import {
  Example,
  ExampleRepositoryProviderInterfaceResolver,
  ExampleRepositoryProviderInterface
} from "../interfaces";

@provider({
  identifier: ExampleRepositoryProviderInterfaceResolver
})
export class ExampleRepositoryProvider
  implements ExampleRepositoryProviderInterface {
  public readonly table = "fraudcheck.fraudchecks";

  constructor() {}

  public async getRes(fakeRes: boolean): Promise<Example> {
    return Promise.resolve({ ok: fakeRes });
  }
}
```

**ExampleRepositoryProviderInterface.ts**
```ts
import { Example } from "./Example";

export interface ExampleRepositoryProviderInterface {
  getRes(fakeRes: boolean): Promise<Example>;
}

export abstract class ExampleRepositoryProviderInterfaceResolver
  implements ExampleRepositoryProviderInterface {
  getRes(fakeRes: boolean): Promise<Example> {
    throw new Error("Method not implemented.");
  }
}
```

### Simple provider

#### File structure 

+ **data**
    + **src**
        + **interfaces**
            - DateProviderInterfaceResolver.ts
        + DateProvider.ts
        + index.ts



In this example we implement a DateProvider class (exposed in index.ts)

#### index.ts
```ts
export { DateProvider } from './DateProvider';
export { DateProviderInterface, DateProviderInterfaceResolver } from './interfaces/DateProviderInterfaceResolver';
```

It is mandatory but adviced to use for each provider an interface, an interface resolver, an implementation. It makes easier future refactoring in other micro services


#### Implementation in *DateProvider.ts*
```ts
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import { provider } from '@ilos/common';

import { DateProviderInterface, DateProviderInterfaceResolver } from './interfaces/DateProviderInterfaceResolver';

@provider({
  identifier: DateProviderInterfaceResolver,
})
export class DateProvider implements DateProviderInterface {
  format(date: Date, formatStr = 'PP'): string {
    return format(date, formatStr, { locale: fr });
  }
}

```

A resolver is used to interface the feature with the service consumer

#### DateProviderInterfaceResolver.ts

```ts
import { ProviderInterface } from '@ilos/common';

// Interface class
export interface DateProviderInterface extends ProviderInterface {
  format(date: Date, formatStr: string): string;
}

// Resolver class
export abstract class DateProviderInterfaceResolver implements DateProviderInterface {
  format(date: Date, formatStr = 'PP'): string {
    throw new Error('Method not implemented.');
  }
}

```