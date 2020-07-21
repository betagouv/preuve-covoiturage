
#### Action

Action is accessible from transport layer (queue, command, http) and implement API commands

**ExampleAction.ts**

```ts
import { Action } from "@ilos/core";
import { handler, ContextType } from "@ilos/common";
import { Example } from "../interfaces/Example";
import { ExampleRepositoryProviderInterfaceResolver } from "../interfaces/ExampleRepositoryProviderInterface";

@handler({
  service: "myservice",
  method: "example"
})
export class ExampleAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [
     ["guard", ["Arg"]] // example of guarded middle implementation
  ];

  // define in constructor all requested serviceProvided using there resolver as type definition
  constructor(private repos: ExampleRepositoryProviderInterfaceResolver) {
    super();
  }

    // implementation of the action
  public async handle(request: any, context: ContextType): Promise<Example> {
      // get data from repository
    return await this.repos.getRes(true);
  }
}
```