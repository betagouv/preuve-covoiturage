---
title: Validator
lang: en-US
footer: Apache 2.0 Licensed
---
# Validator
The validator provider provide method to validate input data.

## Installation
`yarn add @ilos/validator`
Note: this package is already loaded by the framework.

## Configuration
The packaged implementation of the validator provider use JSON Schema validation (with [ajv](http://ajv.js.org)).

### Configuration example
`/services/greeting/src/ServiceProvider.ts`
```ts
import { Parents, Container } from '@ilos/core';
import { HelloAction } from './actions/HelloAction';
import { helloActionParamsSchema } from './schemas/helloActionParamsSchema';

@Container.serviceProvider({
  handlers: [
    HelloAction,
  ],
  validator: [
    ['greeting.hello', helloActionParamsSchema],
  ],
})
export class ServiceProvider extends Parents.ServiceProvider {}
```

The `validator` keyword may receive custom validators as array `[string, any][]` or validator or/and keywords as an object `{ validators?: [string, any][], keywords?: any[] }`.

## Usage
In order get validator provider from IOC, you must add it in the constructor. Then, you can do

```ts
this.validator.validate(data, key?: string);
```

The first argument is the data, the second is the key.

## Example
```ts
import { Parents, Container, Types } from '@ilos/core';
import { ValidatorInterfaceResolver } from '@ilos/validator';

type HelloParamsType = {
  name: string,
};

@Container.handler({
  service: 'greeting',
  method: 'hello',
})
export class HelloAction extends Parents.Action {
  constructor(
    private validator: ValidatorInterfaceResolver,
  ) {
    super();
  }

  protected async handle(
    params: HelloParamsType,
    context: Types.ContextType,
  ): Promise<string> {
    if (!this.validate(params, 'greeting.hello')) {
      throw new Error('Wrong');
    }
    return `Hello ${params.name}`;
  }
}
```
## Custom implementation
In your service provider, you may bind `ValidatorInterfaceResolver` with the implementation of your choice. You can register validators with the following method: 
`registerValidator(definition: any, target?: Types.NewableType<any> | string): ValidatorInterface;`
By example, in the packaged implementation, you can register a schema with a key by doing this: 
```ts
registerValidator(mySchema, 'myKey');
```

You can also register custom keywords with `registerCustomKeyword(definition: any): ValidatorInterface;`.
By example, in the packaged implementation, you can add a json schema string format with : 
```ts
registerCustomKeyword({
  name: 'id'
  type: 'format',
  definition: (data:string):boolean => true,
});
```
